// src/controllers/WebSocket/WsRouter.js
const VehicleController = require('../Controller/DataCenter/VehicleController');
const LimitOpController = require('../Controller/DataCenter/LimitsOPController');
const UserController = require('../Controller/DataCenter/UserControler');
const WsResponse = require('../WebSocket/WsResponse');

class WsRouter {
  /**
   * @param {object} ws - Socket do cliente
   * @param {object} message - O payload já parseado vindo do websocket.js
   */
  async dispatch(ws, message) {
    const { entity, action, payload } = message;

    try {
      switch (entity) {
        case 'VEHICLE':
          return await VehicleController.handleRequest(ws, action, payload);

        case 'LIMIT_OP':
          return await LimitOpController.handleRequest(ws, action, payload);

        case 'USER_CONTROL':
          return await UserController.handleRequest(ws, action, payload);

        default:
          return WsResponse.sendError(ws, 'UNKNOWN_ENTITY', `Entidade ${entity} não mapeada.`);
      }
    } catch (err) {
      WsResponse.sendError(ws, 'ROUTER_ERROR', err.message);
    }
  }
}

module.exports = new WsRouter();