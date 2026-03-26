const LimitesMotor = require('../../Models/LimitesOperacional/LimitesOperacional');
const WsResponse = require('../../WebSocket/WsResponse');
const logger = require('../../Utils/Logger/LoggerConfig');

class LimitOpController {
  /**
   * Gerencia as definições de limites de segurança e operação do motor
   * @param {object} ws - Instância do WebSocket
   * @param {string} action - Ação (SET_LIMITS, GET_ACTIVE_LIMITS, etc)
   * @param {object} payload - Dados dos limites (temp_max, rpm_max, motor_id, etc)
   */
  async handleRequest(ws, action, payload) {
    const entity = 'LIMIT_OP'; // Entidade separada para limites operacionais
    logger.log('ws', `[LIMIT-OP] Action: ${action}`);

    try {
      let result;

      switch (action) {
        
        case 'SET_MOTOR_LIMITS':
          // Define novos limites (pressão de óleo, temp, shift light, etc)
          // O Model já cuida de inativar o setup antigo
          result = await LimitesMotor.setLimites(payload);
          break;

        case 'GET_ACTIVE_LIMITS':
          // Usado pelo Worker de Telemetria ou pelo Display para carregar os gauges
          result = await LimitesMotor.getActiveLimits(payload.motor_id);
          if (!result) {
            return WsResponse.sendError(ws, 'NOT_FOUND', 'Nenhum limite ativo encontrado para este motor.');
          }
          break;

        case 'DELETE_LIMITS':
          // Caso precise limpar um setup de limites específico
          await LimitesMotor.delete(payload.id);
          result = { deleted: true, id: payload.id };
          break;

        default:
          logger.warn(`⚠️ [WS] Ação não reconhecida no LimitOpController: ${action}`);
          return WsResponse.sendError(ws, 'INVALID_ACTION', `Ação ${action} desconhecida.`);
      }

      // Resposta de sucesso padronizada
      WsResponse.sendSuccess(ws, entity, action, result);

    } catch (err) {
      logger.error(`[LIMIT-OP-ERROR] Falha na operação ${action}: ${err.message}`);
      WsResponse.sendError(ws, 'INTERNAL_SERVER_ERROR', err.message);
    }
  }
}

module.exports = new LimitOpController();