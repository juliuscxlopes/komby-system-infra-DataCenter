// src/service/WebSocket/WsEmitterService.js
const WsRoomManager = require('../../config/WsRoomManager');
const logger = require('../../config/logger');

class WsEmitterService {
    /**
     * Notifica o Display sobre mudanças no inventário ou setup
     */
    static sendToUser(userId, entity, action, data = {}) {
        const room = `notifications:user:${userId}`;
        this._executeEmit(room, entity, action, data);
    }

    /**
     * Notificação global (ex: Alerta de manutenção vencida para todos os aparelhos)
     */
    static sendToSystem(entity, action, data = {}) {
        const room = 'system:global';
        this._executeEmit(room, entity, action, data);
    }

    static _executeEmit(room, entity, action, data) {
        const payload = {
            type: 'notification',
            entity,
            action,
            timestamp: new Date().toISOString(),
            payload: data
        };

        const success = WsRoomManager.broadcastToRoom(room, payload);
        
        if (success) {
            logger.log('ws', `[EMIT] -> Sala: ${room} | Ação: ${entity}.${action}`);
        }
    }
    
    /**
     * Envia um comando direto para o Network Service na Kombi
     */
    static sendToKombi(action, payload = {}) {
        const room = 'kombi_central';
        this._executeEmit(room, 'NETWORK', action, payload);
    }

    static _executeEmit(room, type, action, data) { // 'entity' virou 'type' para bater com o Router
        const message = {
            type, 
            action,
            timestamp: new Date().toISOString(),
            payload: data
        };

        const success = WsRoomManager.broadcastToRoom(room, message);
        
        if (success) {
            logger.log('ws', `[EMIT] -> Sala: ${room} | Tipo: ${type} | Ação: ${action}`);
        } else {
            logger.warn(`[EMIT-FAILED] -> Sala ${room} está vazia ou offline.`);
        }
    }
}

module.exports = WsEmitterService;