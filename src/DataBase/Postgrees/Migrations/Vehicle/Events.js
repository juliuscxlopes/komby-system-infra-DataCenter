exports.up = function(knex) {
  return knex.schema.createTable('vehicle_events', table => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    
    // O pulo do gato: aponta para QUALQUER ID (motor, carburação, pneu, etc)
    table.uuid('reference_id').notNullable(); 
    
    // "AJUSTE", "MANUTENÇÃO", "OBSERVAÇÃO", "ALERTA"
    table.string('tipo').notNullable(); 
    
    table.text('descricao').notNullable();
    table.integer('km_momento');
    
    // Para auditoria e linha do tempo
    table.timestamps(true, true);

    // Índices para busca rápida por tipo ou por referência
    table.index(['reference_id', 'tipo']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('vehicle_events');
};