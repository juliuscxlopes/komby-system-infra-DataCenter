// models/User.js
const knex = require('../../DataBase/Postgrees/PgConfig/PgConfig');
const jwt = require('jsonwebtoken');

class User {
    constructor(data) {
        this.id = data.id;
        this.nome = data.nome;
        this.email = data.email;
        this.password = data.password;
        this.telefone = data.telefone;
        this.google_id = data.google_id;
        this.avatar_url = data.avatar_url;
        this.status = data.status;
        this.created_at = data.created_at;
    }

    /**
     * Encontra um usuário pelo email. Usado no registerUser e loginUser.
     * @param {string} email
     * @returns {Promise<User|null>}
     */
    static async findByEmail(email) {
        const userData = await knex('user')
            .where({ email: email })
            .first();

        return userData ? new User(userData) : null;
    }

    /**
     * Encontra um usuário pelo ID.
     * @param {number} id
     * @returns {Promise<User|null>}
     */
// models/users/users.js

static async findByGoogleId(googleId) {
    const userData = await knex('user')
        .where({ google_id: String(googleId) }) // Garante que o googleId seja tratado como string
        .first();

    return userData ? new User(userData) : null;
}

    /**
     * Salva ou atualiza o usuário no banco de dados. Usado no registerUser.
     * @returns {Promise<void>}
     */
    async save() {
        const dataToSave = {
            nome: this.nome,
            email: this.email,
            password: this.password,
            telefone: this.telefone,
            google_id: this.google_id,
            avatar_url: this.avatar_url,
            status: this.status,
        };

        if (this.id) {
            await knex('user').where({ id: this.id }).update(dataToSave);
        } else {
            const result = await knex('user').insert(dataToSave).returning('id');
            const insertedId = Array.isArray(result) ? result[0] : result;
            this.id = typeof insertedId === 'object' ? insertedId.id : insertedId;
        }
    }

    static async findById(id) {
        const userData = await knex('user')
            .where({ id: id })
            .first();

        return userData ? new User(userData) : null;
    }

    /**
     * Gera um token JWT assinado para a instância atual do usuário
     */
    generateAuthToken() {
        const payload = { 
            id: this.id, 
            email: this.email 
        };

        return jwt.sign(
            payload, 
            process.env.JWT_SECRET, 
            { expiresIn: '7d' }
        );
    }

    
}

module.exports = User;