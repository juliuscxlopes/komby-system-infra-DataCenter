exports.up = function(knex) {
  return knex.schema.createTable('veiculos', table => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('nome_apelido').notNullable();
    table.string('marca_modelo_ano');
    table.string('placa').unique();
    table.string('chassi').unique();
    table.string('cor');
    table.float('peso_vazio_kg');
    table.float('capacidade_carga_kg');
    table.jsonb('dimensoes'); // {h: 1925, w: 1720, l: 4505}
    table.enu('tipo_refrigeracao', ['AR', 'AGUA']).defaultTo('AR');
    table.timestamps(true, true);
  });
};