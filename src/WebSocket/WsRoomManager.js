// src/config/WsRoomManager.js
const logger = require('./logger');

const rooms = new Map();
const clientRooms = new Map(); 

class RoomManager {
    static joinRoom(ws, roomName) {
        if (!rooms.has(roomName)) rooms.set(roomName, new Set());
        rooms.get(roomName).add(ws);

        if (!clientRooms.has(ws)) clientRooms.set(ws, new Set());
        clientRooms.get(ws).add(roomName);

        logger.debug(`[Rooms] Conexão adicionada à sala: ${roomName}`);
    }

    static leaveAllRooms(ws) {
        const roomsToLeave = clientRooms.get(ws);
        if (roomsToLeave) {
            roomsToLeave.forEach(roomName => {
                if (rooms.has(roomName)) rooms.get(roomName).delete(ws);
            });
            clientRooms.delete(ws);
        }
    }

    static broadcastToRoom(roomName, message) {
        const roomClients = rooms.get(roomName);
        if (roomClients && roomClients.size > 0) {
            const data = JSON.stringify(message);
            roomClients.forEach(client => {
                if (client.readyState === 1) { // 1 = OPEN
                    client.send(data);
                }
            });
            return true;
        }
        return false;
    }
}

module.exports = RoomManager;