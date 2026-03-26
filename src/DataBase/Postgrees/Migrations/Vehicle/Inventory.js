// src/database/migrations/YYYYMMDD_create_garage_erp.js

exports.up = function(knex) {
  return knex.schema
    // 1. PEÇAS E ATIVOS (O que está instalado)
    .createTable('inventory', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('motor_id').references('id').inTable('motores').onDelete('SET NULL');
      table.string('nome').notNullable();
      table.string('marca');
      table.enu('categoria', ['ENGINE', 'TRANSMISSION', 'SUSPENSION', 'ELECTRIC', 'CARBURATION', 'TIRES', 'BRAKES', 'OTHER']).notNullable();
      table.float('valor_compra').defaultTo(0);
      table.integer('km_instalacao');
      table.integer('expectativa_vida_km'); 
      table.boolean('is_active').defaultTo(true);
      table.jsonb('specs_tecnicas'); 
      table.timestamps(true, true);
    })

    // 2. CONSUMÍVEIS (Óleo, Filtros, Velas)
    .createTable('consumables_log', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('item_nome').notNullable(); // Ex: "Óleo 20W50 Mineral"
      table.float('valor').defaultTo(0);
      table.integer('km_troca');
      table.integer('proxima_troca_km');
      table.timestamp('data_troca').defaultTo(knex.fn.now());
    })

    // 3. ABASTECIMENTO (Independente)
    .createTable('fuel_log', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.float('litros').notNullable();
      table.float('valor_total').notNullable();
      table.integer('km_atual').notNullable();
      table.boolean('tanque_cheio').defaultTo(true);
      table.timestamp('data_abastecimento').defaultTo(knex.fn.now());
    })

    // 4. HISTÓRICO DE SERVIÇOS (Mão de obra)
    .createTable('maintenance_history', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('oficina_mecanico');
      table.string('descricao'); 
      table.float('custo_servico').defaultTo(0);
      table.integer('km_registro');
      table.timestamp('data_registro').defaultTo(knex.fn.now());
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTable('maintenance_history')
    .dropTable('fuel_log')
    .dropTable('consumables_log')
    .dropTable('inventory');
};