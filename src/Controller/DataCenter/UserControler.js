const User = require('../../Models/User/UserModels');
const DeviceService = require('../../Models/User/UserDevice');
const HomeUser = require('../../Models/User/UserVehicle');
const WsResponse = require('../../WebSocket/WsResponse');
const logger = require('../../Utils/Logger/LoggerConfig');

class UserController {
  async handleRequest(ws, action, payload) {
    const entity = 'USER_CONTROL';
    logger.log('info', `[USER-CONTROL] Action: ${action}`);

    try {
      let result;

      switch (action) {
        // --- 1. IDENTIDADE (USER) ---
        case 'GET_USER_BY_EMAIL':
          result = await User.findByEmail(payload.email);
          break;

        case 'SYNC_GOOGLE_USER':
          // Se não existir, o save() cria um novo ID
          let user = await User.findByGoogleId(payload.google_id);
          if (!user) {
            user = new User(payload);
            await user.save();
          }
          result = user;
          break;

        // --- 2. DISPOSITIVOS & AUTORIZAÇÃO (DEVICE) ---
        case 'REGISTER_DEVICE':
          // Vincula o Tablet/Celular ao Usuário pelo MAC
          await DeviceService.registerOrUpdateDevice(
            payload.mac, 
            payload.user_id, 
            payload.device_name
          );
          result = { success: true, mac: payload.mac };
          break;

        case 'CHECK_DEVICE_AUTH':
          // O "porteiro" do sistema
          result = await DeviceService.checkAuthorization(payload.mac);
          break;

        // --- 3. PERMISSÕES DE GRUPO (HOME/VEHICLE USER) ---
        case 'ASSOCIATE_USER_CASA':
          // Define se o cara é Motorista, Passageiro ou Visitante
          const association = new HomeUser({
            user_id: payload.user_id,
            casa_id: payload.casa_id,
            role: payload.role
          });
          result = await association.save();
          break;

        case 'GET_Vehicle_USERS':
          // Lista todo mundo que tem acesso àquela casa/veículo
          result = await HomeUser.findUsersByCasaId(payload.casa_id);
          break;

        default:
          return WsResponse.sendError(ws, 'INVALID_ACTION', `Ação ${action} não mapeada em Users.`);
      }

      WsResponse.sendSuccess(ws, entity, action, result);

    } catch (err) {
      logger.log('error', `[USER-CONTROLLER-ERROR] ${action}: ${err.message}`);
      WsResponse.sendError(ws, 'AUTH_ERROR', err.message);
    }
  }
}

module.exports = new UserController();