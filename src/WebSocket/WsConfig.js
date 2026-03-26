// src/config/websocket.js
const WebSocket = require('ws');
const logger = require('./logger');
const WsRoomManager = require('./WsRoomManager');
const WsRouter = require('../controllers/WebSocket/WsRouter');
const ActionEventService = require('../service/acoes_events/acoes_events_service');

const configureWebSocket = (server) => {
    // Escutando no path /ws
    const wss = new WebSocket.Server({ server, path: '/ws' });

    wss.on('connection', async (ws, req) => {
        // Como o MicroTik já validou a entrada, tratamos como Operador Único
        ws.userId = 'KOMBI_OPERATOR'; 
        
        // Todos entram na mesma sala única
        const mainRoom = 'kombi_central';
        WsRoomManager.joinRoom(ws, mainRoom);
        
        logger.log('ws', `🔌 [WS] Nova conexão estabelecida via IP: ${req.socket.remoteAddress}`);

        ws.on('message', async (message) => {


            try {

                        const dataReceived = JSON.parse(message.toString());
                        const { entity, action, payload } = dataReceived;

                // Auto-registro no Diário de Bordo para qualquer alteração
                const isMutation = payload.action?.includes('CREATE') || 
                                   payload.action?.includes('UPDATE') || 
                                   payload.action?.includes('DELETE');

                if (payload.shouldLog || isMutation) {
                    await ActionEventService.registerActivity({
                        userId: ws.userId,
                        entityType: payload.entity || 'SYSTEM', 
                        title: payload.title || `Ação: ${payload.action}`,
                        type: 'MANUTENCAO',
                        details: payload.data
                    });
                }

                // Despacha para o Router (CRUD do Postgres)
                WsRouter.dispatch(ws, payload);
                
            } catch (err) {
                logger.error(`[WS] Erro ao processar mensagem: ${err.message}`);
            }
        });

        ws.on('close', () => {
            WsRoomManager.leaveAllRooms(ws);
            logger.log('ws', `⚠️ [WS] Conexão encerrada.`);
        });

        ws.on('error', (err) => logger.error(`[WS] Erro no socket: ${err.message}`));
    });

    logger.info('🚀 [WS] Gateway de Gestão ativo (Segurança via Infra/MikroTik).');
};

module.exports = configureWebSocket;