// src/database/mongoDB/config/gridFS.js
const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
const logger = require('../../Utils/Logger/LoggerConfig');

let buckets = {};

/**
 * Inicializa os buckets do GridFS
 * @param {string[]} names - Lista de nomes para os buckets
 */
function initBuckets(names = ['kombi_Assets','User_Assets']) { 
    // Pegamos a instância do banco de dados nativa do Mongoose
    const db = mongoose.connection.db;

    if (!db) {
        logger.error('[GridFS] Erro: Conexão com MongoDB não encontrada para inicializar buckets.');
        return;
    }

    names.forEach(name => {
        // Filtra nomes vazios para evitar erros
        if (name && name.trim() !== '') {
            buckets[name] = new GridFSBucket(db, { bucketName: name });
            logger.info(`🍃 [GridFS] Bucket "${name}" pronto.`);
        }
    });
}

function getBucket(name) {
    if (!buckets[name]) {
        throw new Error(`[GridFS] Bucket "${name}" não inicializado.`);
    }
    return buckets[name];
}

module.exports = { initBuckets, getBucket };