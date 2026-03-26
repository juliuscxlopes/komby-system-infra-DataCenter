// src/service/Auth/GoogleAuthService.js
const { google } = require('googleapis');
const GoogleToken = require('../../models/Auth/googletokens');
const User = require('../../Models/User/UserModels');
const AvatarService = require('../User/AvatarService');
//const SessionService = require('../../service/Storage/Redis/RedisSessionService'); // Novo
const logger = require('../../Utils/Logger/LoggerConfig');
//const Device = require('../../models/network/devices');
require('dotenv').config();

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

const SCOPES = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
];

class GoogleAuthService {
    static generateAuthUrl() {
        return oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES,
            prompt: 'consent',
        });
    }

    static async handleAuthCallback(code) {
        logger.info(`[GoogleAuth] Iniciando callback. Code: ${code.substring(0, 10)}...`);

        try {
            // 1. Obtenção de Tokens OAuth2
            const { tokens } = await oauth2Client.getToken(code);
            oauth2Client.setCredentials(tokens);
            logger.info(`[GoogleAuth] Tokens OAuth2 obtidos.`);

            // 2. Coleta de dados do Perfil
            const oauth2 = google.oauth2({ auth: oauth2Client, version: 'v2' });
            const userInfo = await oauth2.userinfo.get();
            const { id: googleId, email, name: nome, picture: avatarUrl } = userInfo.data;

            // 3. Gerenciamento do Usuário (Upsert)
            let user = await User.findByGoogleId(googleId);

            if (!user) {
                user = await User.findByEmail(email);
                if (user) {
                    user.google_id = googleId;
                    await user.save();
                    logger.info(`[GoogleAuth] Vinculado Google ID ao e-mail existente: ${email}`);
                } else {
                    user = new User({ nome, email, google_id: googleId });
                    await user.save();
                    logger.info(`[GoogleAuth] Novo usuário criado via Google: ${email}`);
                }
            }

                //VERIFICAR ISSO JUNTO AO NETWORK - MODULO ESPECIALISTA.
/*             // 4. Vinculação de Dispositivo (MAC Address)
            if (clientMac) {
            try {
                // Usamos o modelo que criamos para amarrar o hardware ao humano
                await Device.registerOrUpdateDevice(clientMac, user.id, `${user.nome}'s Device`);
                logger.info(`[GoogleAuth] Dispositivo ${clientMac} vinculado ao usuário ${user.email}`);
            } catch (devErr) {
                logger.error(`[GoogleAuth] Erro não crítico ao vincular device: ${devErr.message}`);
            }
            } */

            // 5. Processamento de Avatar (GridFS)
            if (avatarUrl && !user.avatar_url) {
                try {
                    const fileId = await AvatarService.processGoogleAvatar(avatarUrl, user.id);
                    user.avatar_url = fileId.toString();
                    user.avatar_id = fileId.toString();
                    await user.save();
                    logger.info(`[GoogleAuth] Avatar processado e salvo para ID: ${user.id}`);
                } catch (err) {
                    logger.error(`[GoogleAuth] Erro não crítico no avatar: ${err.message}`);
                }
            }

            // 6. Persistência de Tokens Google (Offline Access)
            await this._saveGoogleTokens(user.id, tokens);

            // 🚩 NOVO FLUXO DE SESSÃO PADRONIZADO
            const appToken = user.generateAuthToken(); // Model gera o JWT
            //await SessionService.startRedisSession(user); // Redis registra presença
            
            logger.info(`[GoogleAuth] Sessão e JWT gerados com sucesso para: ${email}`);

            return { 
                token: appToken, 
                user: {
                    id: user.id,
                    nome: user.nome,
                    email: user.email,
                    avatar_url: user.avatar_url,
                    telefone: user.telefone // Pode vir nulo, o Front tratará
                }
            };

        } catch (error) {
            this._handleAuthError(error);
        }
    }

    /**
     * Persistência dos tokens de acesso do Google
     */
    static async _saveGoogleTokens(userId, tokens) {
        try {
            if (!tokens.refresh_token && !tokens.access_token) return;

            const expiryDate = tokens.expiry_date ? new Date(tokens.expiry_date) : null;
            let googleToken = await GoogleToken.findByUserIdAndService(userId, 'google_login');

            if (googleToken) {
                if (tokens.refresh_token) googleToken.refresh_token = tokens.refresh_token;
                googleToken.access_token = tokens.access_token;
                if (expiryDate) googleToken.token_expiry = expiryDate;
            } else {
                googleToken = new GoogleToken({
                    user_id: userId,
                    service: 'google_login',
                    refresh_token: tokens.refresh_token,
                    access_token: tokens.access_token,
                    token_expiry: expiryDate,
                });
            }
            await googleToken.save();
            logger.debug(`[GoogleAuth] Tokens de serviço persistidos para User: ${userId}`);
        } catch (err) {
            logger.error(`[GoogleAuth] Erro ao salvar tokens Google: ${err.message}`);
        }
    }

    static _handleAuthError(error) {
        if (error.response?.data?.error === 'invalid_grant') {
            logger.warn(`[GoogleAuth] Código expirado.`);
            throw new AuthenticationError('Código de autorização expirado.');
        }
        logger.error(`[GoogleAuth] Erro Crítico: ${error.message}`);
        throw new Er('Erro na comunicação com Google APIs.');
    }
}

module.exports = GoogleAuthService;