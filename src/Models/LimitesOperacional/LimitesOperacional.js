const knex = require('../../DataBase/Postgrees/PgConfig/PgConfig');
const logger = require('../../Utils/Logger/LoggerConfig');

class LimitesMotor {
  // CREATE: Define novos limites e inativa os antigos do motor
  async setLimites(data) {
    const trx = await knex.transaction();
    try {
      // Desativa limites antigos para este motor
      await trx('limites_operacionais_motor')
        .where({ motor_id: data.motor_id, is_active: true })
        .update({ is_active: false });

      const [newLimites] = await trx('limites_operacionais_motor')
        .insert({ ...data, is_active: true })
        .returning('*');

      await trx.commit();
      logger.log('query', `[PG] NOVOS LIMITES OPERACIONAIS ATIVADOS para Motor: ${data.motor_id}`);
      return newLimites;
    } catch (err) {
      await trx.rollback();
      logger.error(`[PG] Erro ao definir limites: ${err.message}`);
      throw err;
    }
  }

  // READ: Puxa o setup de limites que o worker deve usar para comparar
  async getActiveLimits(motor_id) {
    try {
      const limites = await knex('limites_operacionais_motor')
        .where({ motor_id, is_active: true })
        .first();
      
      if (limites) {
        logger.log('query', `[PG] Limites operacionais carregados para monitoramento.`);
      }
      return limites;
    } catch (err) {
      logger.error(`[PG] Erro ao carregar limites: ${err.message}`);
      throw err;
    }
  }

  // DELETE: Remoção (Raro, mas padrão de log aplicado)
  async delete(id) {
    try {
      await knex('limites_operacionais_motor').where({ id }).del();
      logger.log('delete', `🚨 [PG] Registro de limites removido: ${id}`);
    } catch (err) {
      logger.error(`[PG] Erro ao deletar limites: ${err.message}`);
    }
  }
}

module.exports = new LimitesMotor();