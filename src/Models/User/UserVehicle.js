const knex = require('../../DataBase/Postgrees/PgConfig/PgConfig');

class HomeUser {
    constructor(data) {
        this.id = data.id;
        this.user_id = data.user_id;
        this.casa_id = data.casa_id;
        this.role = data.role || ''; //controle de usuario Motorista - passageiro - visitante
        this.created_at = data.created_at;
    }

    // --- Métodos de Busca e Criação/Associação ---

    static async findAssociation(userId, casaId) {
        const association = await knex('vehicle_user')
            .where({ user_id: userId, casa_id: casaId })
            .first();
        if (!association) return null;
        return new HomeUser(association);
    }

    static async findAssociation(userId, casaId, trx = null) {
        // Se houver trx, usa ele, senão usa o knex padrão
        const queryBuilder = trx || knex;
        const association = await queryBuilder('vehicle_user')
            .where({ user_id: userId, casa_id: casaId })
            .first();
        if (!association) return null;
        return new HomeUser(association);
    }

    async save(trx = null) {
        const queryBuilder = trx || knex;
        
        if (this.id) {
            await queryBuilder('vehicle_user').where('id', this.id).update({
                role: this.role,
            });
        } else {
            const [id] = await queryBuilder('vehicle_user').insert({
                user_id: this.user_id,
                casa_id: this.casa_id,
                role: this.role,
            }).returning('id');
            this.id = id;
        }
        return this;
    }





    static async findUsersByCasaId(casaId) {
        // Busca todos os usuários associados a uma casa
        return knex('home_user')
            .select('user.*', 'home_users.role')
            .join('user', 'user.id', '=', 'home_user.user_id')
            .where('home_user.casa_id', casaId);
    }

}

module.exports = HomeUser;