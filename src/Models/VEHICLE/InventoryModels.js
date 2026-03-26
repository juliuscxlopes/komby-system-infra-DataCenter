const knex = require('../../DataBase/Postgrees/PgConfig/PgConfig');
const logger = require('../../Utils/Logger/LoggerConfig');

class Inventario {
  // CREATE
  async create(data) {
    try {
      const [newElement] = await knex('inventory').insert(data).returning('*');
      logger.log('data', `[PG] Ativo adicionado ao inventário: ${data.nome} | Categoria: ${data.categoria}`);
      return newElement;
    } catch (err) {
      logger.error(`[PG] Erro ao cadastrar no inventário: ${err.message}`);
      throw err;
    }
  }

  // READ - Puxa ativos e calcula saúde da peça
  async getInventoryStatus() {
    try {
      const items = await knex('inventory').where({ is_active: true });
      logger.log('query', `[PG] Consulta de inventário ativo: ${items.length} itens encontrados.`);
      return items;
    } catch (err) {
      logger.error(`[PG] Erro ao ler inventário: ${err.message}`);
      throw err;
    }
  }

  // UPDATE - Ex: Atualizar KM atual de um pneu
  async updateItem(id, updateData) {
    try {
      await knex('inventory').where({ id }).update(updateData);
      logger.log('query', `[PG] Atualização de item: ${id}`);
      return true;
    } catch (err) {
      logger.error(`[PG] Erro na atualização do item ${id}: ${err.message}`);
      throw err;
    }
  }

  // ABASTECIMENTO - Método específico
  async addFuel(fuelData) {
    try {
      const [id] = await knex('fuel_log').insert(fuelData).returning('id');
      logger.log('data', `[PG] ABASTECIMENTO REGISTRADO: ${fuelData.litros}L | KM: ${fuelData.km_atual}`);
      return id;
    } catch (err) {
      logger.error(`[PG] Erro ao registrar abastecimento: ${err.message}`);
      throw err;
    }
  }

  // DELETE
  async delete(id) {
    try {
      await knex('inventory').where({ id }).del();
      logger.log('delete', `🚨 [PG] Item removido permanentemente: ${id}`);
      return true;
    } catch (err) {
      logger.error(`[PG] Erro ao deletar item: ${err.message}`);
      throw err;
    }
  }

  // GESTÃO DE ÓLEO - Registro de Troca/Nível
  async addOil(oilData) {
    try {
      // oilData deve conter: motor_id, km_atual, tipo_oleo, marca, filtro_trocado (bool)
      const [id] = await knex('oil_log').insert(oilData).returning('id');
      
      logger.log('data', `[PG] REGISTRO DE ÓLEO: ${oilData.tipo_oleo} | KM: ${oilData.km_atual}`);
      
      // Dica: Poderíamos também atualizar a KM do motor aqui automaticamente se quisesse
      return id;
    } catch (err) {
      logger.error(`[PG] Erro ao registrar troca de óleo: ${err.message}`);
      throw err;
    }
  }
  
}

module.exports = new Inventario();