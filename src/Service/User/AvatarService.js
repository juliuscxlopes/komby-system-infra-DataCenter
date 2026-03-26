// src/service/Storage/mongo/Auth/AvatarService.js
const axios = require('axios');
const { getBucket } = require('../../DataBase/Mongo/GridFsConfig');
const { Readable } = require('stream');
const logger = require('../../Utils/Logger/LoggerConfig');

class AvatarService {
    static async processGoogleAvatar(avatarUrl, userId) {
        try {
            logger.info(`[AvatarService] Baixando avatar para usuário: ${userId}`);
            
            // 1. Baixa a imagem da URL do Google
            const response = await axios.get(avatarUrl, { responseType: 'arraybuffer' });
            const buffer = Buffer.from(response.data, 'utf-8');

            // 2. Acessa o bucket que já inicializamos no App.js
            const bucket = getBucket('User_Assets');

            // 3. Cria o Stream de upload
            const filename = `avatar_${userId}_${Date.now()}.jpg`;
            const uploadStream = bucket.openUploadStream(filename, {
                metadata: { userId, type: 'avatar', source: 'google' }
            });

            // 4. Converte buffer para stream e sobe pro Mongo
            const readableStream = new Readable();
            readableStream.push(buffer);
            readableStream.push(null);

            return new Promise((resolve, reject) => {
                readableStream.pipe(uploadStream)
                    .on('error', reject)
                    .on('finish', () => {
                        logger.info(`[AvatarService] Avatar salvo no GridFS: ${filename}`);
                        resolve(uploadStream.id); // Retorna o ID do arquivo no Mongo
                    });
            });

        } catch (err) {
            logger.error(`[AvatarService] Falha ao processar avatar: ${err.message}`);
            throw err;
        }
    }
}

module.exports = AvatarService;