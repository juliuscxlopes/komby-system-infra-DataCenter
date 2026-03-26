// src/database/mongoDB/config/mongo.js
const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;
const MONGO_DB_NAME = process.env.MONGO_DB_NAME;

async function connectMongo() {
    // Concatena a URI com o nome do Banco para evitar salvar no banco 'test'
    const fullUri = `${MONGO_URI.replace(/\/$/, "")}/${MONGO_DB_NAME}`;
    
    await mongoose.connect(fullUri);
    // Removemos o console.log simples pelo seu Winston logger
    console.log(`🍃 MongoDB conectado ao banco: ${MONGO_DB_NAME}`);
}

module.exports = { connectMongo };