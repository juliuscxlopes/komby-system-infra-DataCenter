const Motor = require('../../Models/VEHICLE/Motor');
const Carburacao = require('../../Models/VEHICLE/Carburação');
const Inventario = require('../../Models/VEHICLE/InventoryModels');
const VehicleEvent = require('../../Models/VEHICLE/VehicleEvents'); // Novo
const WsResponse = require('../../WebSocket/WsResponse');
const logger = require('../../Utils/Logger/LoggerConfig');

class VehicleController {
  async handleRequest(ws, action, payload) {
    const entity = 'VEHICLE';
    logger.log('ws', `[VEHICLE] Action: ${action}`);

    try {
      let result;

      switch (action) {
        // --- 1. GESTÃO DO MOTOR ("O CORAÇÃO") ---
        case 'CREATE_MOTOR':
          result = await Motor.create(payload);
          break;
        case 'GET_MOTORES_VEICULO':
          result = await Motor.getByVeiculo(payload.veiculo_id);
          break;
        case 'GET_MOTOR_ATIVO':
          result = await Motor.getAtivo(payload.veiculo_id);
          break;
        case 'UPDATE_MOTOR':
          await Motor.update(payload.id, payload.data);
          result = { success: true, id: payload.id };
          break;

        // --- 2. CARBURAÇÃO & ACERTO ---
        case 'CREATE_CARB_SETUP':
          result = await Carburacao.createSetup(payload);
          break;
        case 'GET_CARB_HISTORY':
          result = await Carburacao.getHistory(payload.motor_id);
          break;

        // --- 3. INVENTÁRIO, COMBUSTÍVEL E ÓLEO ---
        case 'ADD_INVENTORY_ITEM':
          result = await Inventario.create(payload);
          break;
        case 'ADD_FUEL_LOG':
          const fuelId = await Inventario.addFuel(payload);
          result = { success: true, id: fuelId };
          break;
        case 'ADD_OIL_LOG': // Ação que vamos criar no Model agora
          const oilId = await Inventario.addOil(payload);
          result = { success: true, id: oilId };
          break;
        case 'UPDATE_ITEM_KM':
          await Inventario.updateItem(payload.id, { km_atual: payload.km });
          result = { success: true };
          break;

        // --- 4. LINHA DO TEMPO (EVENTS) ---
        case 'CREATE_VEHICLE_EVENT':
          result = await VehicleEvent.create(payload);
          break;
        case 'GET_VEHICLE_TIMELINE':
          result = await VehicleEvent.getTimeline(payload.limit || 20);
          break;
        case 'GET_EVENTS_BY_REF':
          // Útil para ver tudo que aconteceu com uma peça ou motor específico
          result = await VehicleEvent.getByReference(payload.reference_id);
          break;

        default:
          return WsResponse.sendError(ws, 'INVALID_ACTION', `Ação ${action} não mapeada.`);
      }

      WsResponse.sendSuccess(ws, entity, action, result);

    } catch (err) {
      logger.error(`[VEHICLE-CONTROLLER-ERROR] ${action}: ${err.message}`);
      WsResponse.sendError(ws, 'DB_ERROR', err.message);
    }
  }
}

module.exports = new VehicleController();