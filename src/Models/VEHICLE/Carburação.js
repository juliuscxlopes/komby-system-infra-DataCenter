const knex = require('../../DataBase/Postgrees/PgConfig/PgConfig');
const logger = require('../../Utils/Logger/LoggerConfig');

class Carburacao {
  // CREATE (Novo Setup com desativação do antigo)
  async createSetup(data) {
    const trx = await knex.transaction(); // Usamos transação para garantir consistência
    try {
      // 1. Desativa qualquer setup que esteja ativo para este motor
      await trx('carburacao_setup')
        .where({ motor_id: data.motor_id, is_active: true })
        .update({ is_active: false });

      // 2. Insere o novo setup como ativo
      const [newSetup] = await trx('carburacao_setup')
        .insert({ ...data, is_active: true })
        .returning('*');

      await trx.commit();

      logger.log('query', `[PG] NOVO SETUP ATIVADO: Motor ${data.motor_id} | Giclê: ${data.gicle_principal}`);
      return newSetup;
    } catch (err) {
      await trx.rollback();
      logger.error(`[PG] Erro ao trocar setup de carburação: ${err.message}`);
      throw err;
    }
  }

  // READ (Pega o setup que está mandando agora)
  async getActiveSetup(motor_id) {
    try {
      const setup = await knex('carburacao_setup')
        .where({ motor_id, is_active: true })
        .first();
        
      if (setup) {
        logger.log('query', `[PG] Setup ativo recuperado para motor: ${motor_id}`);
      }
      return setup;
    } catch (err) {
      logger.error(`[PG] Erro ao buscar setup ativo: ${err.message}`);
    }
  }

  // HISTORY (Puxa todos os ajustes feitos na vida do motor)
  async getHistory(motor_id) {
    try {
      const history = await knex('carburacao_setup')
        .where({ motor_id })
        .orderBy('data_setup', 'desc');
        
      logger.log('query', `[PG] Histórico de carburação consultado: ${history.length} registros.`);
      return history;
    } catch (err) {
      logger.error(`[PG] Erro ao buscar histórico: ${err.message}`);
    }
  }

  // DELETE (Uso cauteloso)
  async deleteSetup(id) {
    try {
      await knex('carburacao_setup').where({ id }).del();
      logger.log('delete', `🚨 [PG] Registro de carburação removido: ${id}`);
    } catch (err) {
      logger.error(`[PG] Erro ao deletar registro: ${err.message}`);
    }
  }
}

module.exports = new Carburacao();