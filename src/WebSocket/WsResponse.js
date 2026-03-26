// src/ws/WsResponse.js
const logger = require('../Utils/Logger/LoggerConfig');

class WsResponse {

    static sendSuccess(ws, entity, action, payload = {}) {
        const message = {
            type: 'success',
            entity,
            action,
            payload,
            timestamp: Date.now()
        };

        try {
            if (ws.readyState === ws.OPEN) {
                ws.send(JSON.stringify(message));
            }
        } catch (err) {
            logger.error(`[WS] Erro ao enviar mensagem WS: ${err.message}`);
        }
    }

    static sendError(ws, code, message) {
        const errorPayload = {
            type: 'error',
            code,
            message,
            timestamp: Date.now()
        };

        try {
            if (ws.readyState === ws.OPEN) {
                ws.send(JSON.stringify(errorPayload));
            }
        } catch (err) {
            logger.error(`[WS] Erro ao enviar erro WS: ${err.message}`);
        }
    }
}

module.exports = WsResponse;
