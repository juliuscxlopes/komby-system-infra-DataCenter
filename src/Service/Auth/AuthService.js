// src/services/Auth/AuthService.js
const User = require('../../Models/User/UserModels');
const bcrypt = require('bcrypt');
const logger = require('../../Utils/Logger/LoggerConfig');
//const SessionService = require('../../service/Storage/Redis/RedisSessionService'); 


const SALT_ROUNDS = 10;

class AuthService {

    /**
     * Registro direto: Exige todos os dados.
     * Retorna o token e os dados para o front já logar o usuário de imediato.
     */
    static async registerUser({ nome, email, password, telefone }) {
        logger.info(`[AuthService] Iniciando registro: ${email}`);
        
        if (!nome || !email || !password || !telefone) {
            throw new BaseError('Todos os campos são obrigatórios para registro direto.', 400, 'ValidationError');
        }

        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            throw new BaseError('E-mail já cadastrado.', 409, 'ConflictError');
        }

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        
        const newUser = new User({
            nome,
            email,
            password: hashedPassword,
            telefone,
        });

        await newUser.save();
        logger.info(`[AuthService] Usuário registrado com ID: ${newUser.id}`);

        // Fluxo de Sessão pós-registro
        const token = newUser.generateAuthToken();
        //await SessionService.startRedisSession(newUser);

        return {
            token,
            user: {
                id: newUser.id,
                nome: newUser.nome,
                email: newUser.email,
                avatar_url: newUser.avatar_url
            }
        };
    }

    /**
     * Login via e-mail e senha.
     */
    static async loginUser(email, password) {
        logger.info(`[AuthService] Tentativa de login: ${email}`);
        
        const user = await User.findByEmail(email);
        if (!user) throw new AuthenticationError('E-mail ou senha inválidos.');
        
        if (!user.password) {
            throw new AuthenticationError('Por favor, acesse via Google Login.');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) throw new AuthenticationError('E-mail ou senha inválidos.');

        // Fluxo de Sessão
        const token = user.generateAuthToken();
        //await SessionService.startRedisSession(user);

        logger.info(`[AuthService] Login bem-sucedido: ${email}`);

        return {
            token,
            user: {
                id: user.id,
                nome: user.nome,
                email: user.email,
                avatar_url: user.avatar_url
            }
        };
    }

    /**
     * Atualização de perfil.
     */
    static async updateProfile(userId, { nome, telefone, password }) {
        logger.info(`[AuthService] Atualizando dados do usuário: ${userId}`);

        const user = await User.findById(userId);
        if (!user) throw new BaseError('Usuário não encontrado.', 404, 'UserNotFound');

        if (nome) user.nome = nome;
        if (telefone) user.telefone = telefone;
        if (password) user.password = await bcrypt.hash(password, SALT_ROUNDS);

        await user.save();
        
        // Opcional: Atualizar TTL no Redis se necessário
        //await SessionService.startRedisSession(user);
    }
}

module.exports = AuthService;