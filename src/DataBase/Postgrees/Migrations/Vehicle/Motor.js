exports.up = function(knex) {
  return knex.schema.createTable('motores', table => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('veiculo_id').references('id').inTable('veiculos').onDelete('CASCADE');
    table.string('codigo_motor');
    table.integer('cilindrada_cc');
    table.string('Hp_Horses'); // Ex: "150 HP @ 6000 rpm"
    table.integer('Capacidade_Oleo_L');
    table.string('viscosidade_oleo'); // Ex: "20W50"
    table.string('combustivel'); // Gasolina, Alcool, Flex
    table.integer('Capacidade_Combustivel_L');
    table.string('bore_stroke'); // Ex: "85.5 x 69"
    table.string('sistema_escape');
    table.boolean('ativo').defaultTo(true); // Se este é o motor atual
    table.timestamps(true, true);
  });
};