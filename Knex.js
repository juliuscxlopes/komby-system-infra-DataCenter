//./knex.js
require('dotenv').config();

module.exports = {

    development: {
            client: 'pg',
            connection: {
                // Ajustando para bater com o seu .env
                host:     process.env.POSTGRES_HOST, 
                port:     process.env.POSTGRES_PORT || 5432,
                user:     process.env.POSTGRES_USER,
                password: process.env.POSTGRES_PASSWORD,
                database: process.env.POSTGRES_DB,
            },
        migrations: {
            directory: './src/DataBase/Postgrees/Migrations',
        },
        seeds: {
            directory: './src/DataBase/Postgrees/Seeds',
        },
        pool: {
            min: 2,
            max: 10,
        },
    },

};