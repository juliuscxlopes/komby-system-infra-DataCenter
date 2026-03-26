exports.up = function (knex) {
  return knex.schema.createTable('user', (table) => {
    table.increments('id').primary();

    table.string('nome', 100).notNullable();
    table.string('email', 150).notNullable().unique();

    table.string('password', 255);
    table.string('google_id', 255).unique();
    table.string('avatar_url', 500);
    table.string('telefone', 20);

    table.enu('status', ['ativo', 'desativado']).defaultTo('ativo');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('user');
};