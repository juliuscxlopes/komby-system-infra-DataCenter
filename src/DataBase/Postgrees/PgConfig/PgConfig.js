// Puxando do arquivo knex.js na raiz (ajustei o nome e o path)
const knexConfig = require('../../../../Knex'); 

const environment = process.env.NODE_ENV || 'development';
const config = knexConfig[environment];

// Inicializa a instância. 
// Usei 'database' para não dar conflito com o 'require(knex)'
const database = require('knex')(config);

module.exports = database;