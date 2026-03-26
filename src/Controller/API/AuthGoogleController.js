const GoogleAuthService = require('../../Service/Auth/GoogleAuthService');
const logger = require('../../Utils/Logger/LoggerConfig');

class AuthGoogleController {

    static async googleAuth(req, res) {
        try {
            const authUrl = GoogleAuthService.generateAuthUrl();
            logger.info('[AuthGoogleController] URL de autenticação do Google gerada.', authUrl);
            return res.json({ url: authUrl });
        } catch (error) {
            logger.error(`[AuthGoogleController] Falha ao gerar URL: ${error.message}`);
            return res.status(500).json({
                error: 'Internal Server Error',
                message: 'Não foi possível iniciar o fluxo de autenticação.'
            });
        }
    }
    
    static async googleAuthCallback(req, res) {
        const code = req.query.code || req.body.code;
        if (!code) return res.status(400).json({ error: 'Código obrigatório' });

        try {
            // 1. O Service cuida do OAuth, Banco e Avatar
            // Ele agora retorna o token assinado e o objeto user
            const { token, user: userData } = await GoogleAuthService.handleAuthCallback(code);
            
            // 2. Criamos a instância do modelo para garantir acesso aos métodos (se necessário)
            // Mas como o service já retornou o que precisamos, montamos a session:
            const session = {
                token,
                user: userData
            };
            
            logger.info(`[AuthGoogleController] Login finalizado com sucesso para: ${userData.email}`);

            if (req.method === 'GET') {
                const clientUrl = process.env.CLIENT_URL.replace(/\/$/, ""); 
                return res.send(`
                    <script>
                        window.opener.postMessage({
                            type: 'GOOGLE_AUTH_SUCCESS',
                            session: ${JSON.stringify(session)}
                        }, "${clientUrl}");
                        window.close();
                    </script>
                `);
            }
            return res.json(session);

        } catch (error) {
            logger.error(`[AuthGoogleController] Erro no callback: ${error.message}`);
            return res.status(500).json({ error: 'Erro na autenticação' });
        }
    }
}
module.exports = AuthGoogleController;