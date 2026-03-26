const knex = require('../../DataBase/Postgrees/PgConfig/PgConfig');
const logger = require('../../Utils/Logger/LoggerConfig');

class DeviceService {
    async registerOrUpdateDevice(mac, userId, deviceName = 'Desconhecido') {
        try {
            const formattedMac = mac.toUpperCase();
            
            await db('devices')
                .insert({
                    mac_address: formattedMac,
                    user_id: userId,
                    device_name: deviceName,
                    last_seen: db.fn.now()
                })
                .onConflict('mac_address')
                .merge(['user_id', 'last_seen']) // Atualiza o dono e o visto por último
                .returning('*');

            logger.log('info', `📱 [DeviceService] Dispositivo ${formattedMac} vinculado ao usuário.`);
        } catch (err) {
            logger.log('error', `[DeviceService] Erro: ${err.message}`);
        }
    }

    async checkAuthorization(mac) {
        // Busca o dispositivo e o nível de acesso do dono em um único Join
        const result = await db('devices')
            .join('users', 'devices.user_id', '=', 'users.id')
            .select('users.role', 'users.name', 'devices.is_blocked')
            .where('devices.mac_address', mac.toUpperCase())
            .first();

        if (!result || result.is_blocked) return { authorized: false };

        return { 
            authorized: true, 
            role: result.role, 
            userName: result.name 
        };
    }
}

module.exports = new DeviceService();