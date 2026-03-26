const knex = require('../../DataBase/Postgrees/PgConfig/PgConfig');

class GoogleToken {
    constructor(data) {
        this.id = data.id;
        this.user_id = data.user_id;
        this.service = data.service;
        this.refresh_token = data.refresh_token;
        this.access_token = data.access_token;
        this.token_expiry = data.token_expiry;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }

    static async findByUserIdAndService(userId, service) {
        const tokenData = await knex('google_tokens')
            .where({ user_id: userId, service: service })
            .first();
        if (!tokenData) return null;
        return new GoogleToken(tokenData);
    }

    async save() {
        const dataToSave = {
            user_id: this.user_id,
            service: this.service,
            refresh_token: this.refresh_token,
            access_token: this.access_token,
            token_expiry: this.token_expiry,
            updated_at: knex.fn.now(),
        };

        if (this.id) {
            // Atualizar
            await knex('google_tokens').where('id', this.id).update(dataToSave);
        } else {
            // Inserir
            const [id] = await knex('google_tokens').insert(dataToSave).returning('id');
            this.id = id;
        }
        return this;
    }

    // Método para atualizar apenas o access token e o expiry (usado na renovação)
    async updateAccessToken(accessToken, expiryDate) {
        await knex('google_tokens').where('id', this.id).update({
            access_token: accessToken,
            token_expiry: expiryDate,
            updated_at: knex.fn.now(),
        });
        this.access_token = accessToken;
        this.token_expiry = expiryDate;
    }
}

module.exports = GoogleToken;