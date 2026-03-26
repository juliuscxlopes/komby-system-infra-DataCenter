// migrations/20260318_create_network_tables.js
exports.up = function(knex) {
  return knex.schema
    .createTable('users', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('google_id').unique().notNullable();
      table.string('email').notNullable();
      table.string('name');
      table.string('picture');
      table.enum('role', ['ADMIN', 'USER', 'GUEST']).defaultTo('GUEST');
      table.jsonb('metadata').defaultTo('{}'); // Idade, peso, etc.
      table.timestamps(true, true);
    })
    .createTable('devices', (table) => {
      table.string('mac_address').primary(); // Ex: AA:BB:CC...
      table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.string('device_name');
      table.timestamp('last_seen').defaultTo(knex.fn.now());
      table.boolean('is_blocked').defaultTo(false);
      table.timestamps(true, true);
    });
};

exports.down = function(knex) {
  return knex.schema.dropTable('devices').dropTable('users');
};