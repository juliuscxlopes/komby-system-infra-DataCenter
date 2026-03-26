exports.up = function (knex) {
    return knex.schema.createTable('google_tokens', (table) => {
        table.increments('id').primary();
        table.integer('user_id')
            .unsigned()
            .notNullable()
            .references('id')
            .inTable('user')
            .onDelete('CASCADE');

        table.string('service', 100).notNullable();
        table.string('refresh_token', 500).notNullable();
        table.string('access_token', 500).nullable(); 
        table.timestamp('token_expiry').nullable();
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
        table.unique(['user_id', 'service']); 
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('google_tokens');
};