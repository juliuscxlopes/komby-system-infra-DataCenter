const AuthService = require('../../Service/Auth/AuthService');
//const redis = require('../../../config/redis');
const logger = require('../../Utils/Logger/LoggerConfig');

class AuthController {

    static async register(req, res) {
        try {
            const session = await AuthService.registerUser(req.body);
            return res.status(201).json({ message: 'Registro concluído.', ...session });
        } catch (error) {
            return AuthController._handleError(res, error, "Erro no Registro");
        }
    }

    static async login(req, res) {
        try {
            const { email, password } = req.body;
            const session = await AuthService.loginUser(email, password);
            return res.status(200).json(session);
        } catch (error) {
            return AuthController._handleError(res, error, "Erro no Login");
        }
    }

    /**
     * @PATCH /auth/complete-profile
     */
    static async completeProfile(req, res) {
        try {
            await AuthService.updateProfile(req.user.id, req.body);
            
            // Opcional: Se quiser retornar a sessão atualizada após completar
            return res.status(200).json({ message: 'Perfil atualizado.' });
        } catch (error) {
            return AuthController._handleError(res, error, "Erro ao atualizar perfil");
        }
    }

/*     static async logout(req, res) {
        try {
            const userId = req.user.id;
            await redis.del(`user:${userId}:status`);
            await redis.srem('users:online', userId);
            logger.info(`[AuthController] Logout realizado para o usuário: ${userId}`);
            return res.status(200).json({ message: 'Logout realizado.' });
        } catch (error) {
            return AuthController._handleError(res, error, "Erro no Logout");
        }
    } */

    static _handleError(res, error, context) {
        const status = error.status || 500;
        logger.error(`[AuthController] ${context}: ${error.message}`);
        return res.status(status).json({
            error: error.type || 'InternalError',
            message: error.message
        });
    }
}

module.exports = AuthController;