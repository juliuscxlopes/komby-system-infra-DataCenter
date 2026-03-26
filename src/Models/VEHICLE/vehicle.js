const knex = require('../../DataBase/Postgrees/PgConfig/PgConfig');
const logger = require('../../Utils/Logger/LoggerConfig');

class Veiculo {
  // CREATE: Cadastra o carro (ex: a Kombi 89)
  async create(data) {
    try {
      const [newVehicle] = await knex('veiculos').insert(data).returning('*');
      
      logger.log('data', `[PG] VEÍCULO CADASTRADO: ${data.nome_apelido} | Placa: ${data.placa}`);
      return newVehicle;
    } catch (err) {
      logger.error(`[PG] Erro ao cadastrar veículo: ${err.message}`);
      throw err;
    }
  }

  // READ: Puxa todos os carros da garagem
  async getAll() {
    try {
      const vehicles = await knex('veiculos').select('*');
      logger.log('query', `[PG] Consulta geral de veículos: ${vehicles.length} encontrados.`);
      return vehicles;
    } catch (err) {
      logger.error(`[PG] Erro ao buscar veículos: ${err.message}`);
      throw err;
    }
  }

  // READ: Busca um específico por placa ou ID
  async getById(id) {
    try {
      const vehicle = await knex('veiculos').where({ id }).first();
      if (vehicle) {
        logger.log('query', `[PG] Veículo localizado: ${vehicle.nome_apelido}`);
      }
      return vehicle;
    } catch (err) {
      logger.error(`[PG] Erro ao buscar veículo ${id}: ${err.message}`);
      throw err;
    }
  }

  // UPDATE: Mudar cor, apelido, ou dimensões (JSONB)
  async update(id, data) {
    try {
      await knex('veiculos').where({ id }).update(data);
      logger.log('query', `[PG] Dados do veículo ${id} atualizados.`);
      return true;
    } catch (err) {
      logger.error(`[PG] Erro na atualização do veículo: ${err.message}`);
      throw err;
    }
  }

  // DELETE: Remoção crítica
  async delete(id) {
    try {
      await knex('veiculos').where({ id }).del();
      logger.log('delete', `🚨 [PG] VEÍCULO REMOVIDO DO SISTEMA: ${id}`);
      return true;
    } catch (err) {
      logger.error(`[PG] Erro ao deletar veículo: ${err.message}`);
      throw err;
    }
  }
}

module.exports = new Veiculo();