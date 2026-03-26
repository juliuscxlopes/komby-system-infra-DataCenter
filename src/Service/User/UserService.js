// src/service/User/UserService.js
const User = require('../../models/users/users');
const logger = require('../../config/logger');

class UserService {
    /**
     * Regra de negócio única para integridade do perfil
     */
    static checkProfileIntegrity(user) {
        const hasNome = !!user.nome;
        const hasTelefone = !!user.telefone;
        const isComplete = hasNome && hasTelefone;

        if (!isComplete) {
            logger.warn(`[UserService] Validação: Perfil incompleto - Nome[${hasNome}], Tel[${hasTelefone}]`);
        }
        return isComplete;
    }

    static async getProfile(userId) {
        logger.debug(`[UserService] Buscando dados no Model User para ID: ${userId}`);
        const user = await User.findById(userId);
        
        if (!user) return null;

        return {
            id: user.id,
            nome: user.nome,
            email: user.email,
            avatar_url: user.avatar_url,
            telefone: user.telefone || '',
            profileComplete: this.checkProfileIntegrity(user)
        };
    }
}

module.exports = UserService;