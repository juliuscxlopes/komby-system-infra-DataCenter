const knex = require('../../DataBase/Postgrees/PgConfig/PgConfig');
const logger = require('../../Utils/Logger/LoggerConfig');

class VehicleEvent {
  // CREATE: Registra um novo evento na linha do tempo
  async create(data) {
    try {
      const [newEvent] = await knex('vehicle_events').insert(data).returning('*');
      
      // Log colorido conforme o tipo para facilitar o debug visual
      const logType = data.tipo === 'AJUSTE' ? 'query' : 'data';
      logger.log(logType, `[EVENT] Novo ${data.tipo} registrado: ${data.descricao.substring(0, 30)}...`);
      
      return newEvent;
    } catch (err) {
      logger.error(`[PG] Erro ao registrar evento: ${err.message}`);
      throw err;
    }
  }

  // READ: Puxa a história de um componente específico (ex: tudo da carburação X)
  async getByReference(reference_id) {
    try {
      const events = await knex('vehicle_events')
        .where({ reference_id })
        .orderBy('created_at', 'desc');
        
      logger.log('query', `[PG] Recuperados ${events.length} eventos para a referência: ${reference_id}`);
      return events;
    } catch (err) {
      logger.error(`[PG] Erro ao buscar eventos: ${err.message}`);
      throw err;
    }
  }

  // READ: Puxa os últimos eventos (Geral do veículo)
  async getTimeline(limit = 20) {
    try {
      return await knex('vehicle_events')
        .orderBy('created_at', 'desc')
        .limit(limit);
    } catch (err) {
      logger.error(`[PG] Erro ao carregar timeline: ${err.message}`);
    }
  }

  // DELETE: Apenas para correções de erro de digitação
  async delete(id) {
    try {
      await knex('vehicle_events').where({ id }).del();
      logger.log('delete', `🚨 [PG] Evento removido da história: ${id}`);
    } catch (err) {
      logger.error(`[PG] Erro ao deletar evento: ${err.message}`);
    }
  }
}

module.exports = new VehicleEvent();