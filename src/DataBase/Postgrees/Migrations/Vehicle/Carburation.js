exports.up = function(knex) {
  return knex.schema.createTable('carburacao_setup', table => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('motor_id').references('id').inTable('motores').onDelete('CASCADE');
    
    table.string('modelo_carburador'); 
    table.float('venturi');
    table.integer('gicle_principal');
    table.integer('gicle_lenta');
    table.integer('corretor_ar');
    table.string('tubo_misturador'); 
    table.integer('injetor_rapida');
    
    // Controle de Versão
    table.boolean('is_active').defaultTo(true); // O setup atual
    table.text('motivo_ajuste'); // Ex: "Motor batendo pino em alta"
    table.timestamp('data_setup').defaultTo(knex.fn.now());
    
    // Índices para performance
    table.index(['motor_id', 'is_active']);
  });
};