const knex = require('../../DataBase/Postgrees/PgConfig/PgConfig');
const logger = require('../../Utils/Logger/LoggerConfig');

class Motor {
  // CREATE: Garante que apenas um motor seja o 'ativo' por veículo
  async create(data) {
    const trx = await knex.transaction();
    try {
      // Se o novo motor entrar como ativo, "aposentamos" o anterior
      if (data.ativo) {
        await trx('motores')
          .where({ veiculo_id: data.veiculo_id, ativo: true })
          .update({ ativo: false });
        
        logger.log('query', `[PG] Motor anterior desativado para o veículo: ${data.veiculo_id}`);
      }

      const [newMotor] = await trx('motores').insert(data).returning('*');
      
      await trx.commit();
      
      logger.log('data', `[PG] NOVO MOTOR REGISTRADO: ${data.codigo_motor || newMotor.id} | Cilindrada: ${data.cilindrada_cc}cc`);
      return newMotor;
    } catch (err) {
      await trx.rollback();
      logger.error(`[PG] Erro ao criar motor: ${err.message}`);
      throw err;
    }
  }

  // READ: Puxa todos os motores vinculados a uma Kombi/Carro
  async getByVeiculo(veiculo_id) {
    try {
      const motores = await knex('motores').where({ veiculo_id }).select('*');
      logger.log('query', `[PG] Listando ${motores.length} motores do veículo: ${veiculo_id}`);
      return motores;
    } catch (err) {
      logger.error(`[PG] Erro ao buscar motores: ${err.message}`);
      throw err;
    }
  }

  // READ: Puxa o "coração" que está batendo agora
  async getAtivo(veiculo_id) {
    try {
      const motor = await knex('motores').where({ veiculo_id, ativo: true }).first();
      if (motor) {
        logger.log('query', `[PG] Motor ativo localizado: ${motor.codigo_motor}`);
      }
      return motor;
    } catch (err) {
      logger.error(`[PG] Erro ao buscar motor ativo: ${err.message}`);
      throw err;
    }
  }

  // UPDATE: Atualiza specs ou status
  async update(id, data) {
    try {
      await knex('motores').where({ id }).update(data);
      logger.log('query', `[PG] Dados do motor ${id} atualizados com sucesso.`);
      return true;
    } catch (err) {
      logger.error(`[PG] Erro ao atualizar motor ${id}: ${err.message}`);
      throw err;
    }
  }

  // DELETE: Remove registro (Uso via nível 'delete' do logger)
  async delete(id) {
    try {
      await knex('motores').where({ id }).del();
      logger.log('delete', `🚨 [PG] MOTOR REMOVIDO: ${id}`);
      return true;
    } catch (err) {
      logger.error(`[PG] Erro ao deletar motor: ${err.message}`);
      throw err;
    }
  }
}

module.exports = new Motor();