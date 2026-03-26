exports.up = function(knex) {
  return knex.schema
    // 1. LIMITES DO MOTOR (O Coração da Telemetria)
    .createTable('limites_operacionais_motor', table => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('motor_id').references('id').inTable('motores').onDelete('CASCADE');
      
      // Temperaturas de Óleo
      table.float('status_oleo_pronto_min').defaultTo(60); 
      table.float('t_oil_min').defaultTo(70); 
      table.float('t_oil_max').defaultTo(110); 
      table.float('t_oil_critica').defaultTo(120); 

      // Pressões de Óleo (Dinâmicas)
      table.float('p_oil_lenta_quente_min').defaultTo(0.5); 
      table.float('p_oil_lenta_fria_min').defaultTo(1.5);
      table.float('p_oil_carga_min').defaultTo(2.8);

      // Térmica do Ar e Cabeçote
      table.float('cht_max').defaultTo(210); // Cilindro
      table.float('temp_cofre_max').defaultTo(65); 
      table.float('temp_admissao_min').defaultTo(15); 
      table.float('temp_admissao_max').defaultTo(55);

      // Elétrica e Mistura
      table.float('lambda_cruzeiro').defaultTo(1.0);
      table.float('lambda_potencia').defaultTo(0.88);
      table.float('tensao_bateria_min').defaultTo(11.5);
      table.float('tensao_alternador_max').defaultTo(14.5);

      table.boolean('is_active').defaultTo(true);
      table.timestamps(true, true);
    })

    // 2. CONFIGURAÇÕES DE MANUTENÇÃO E RODAGEM
    .createTable('configuracoes_veiculo', table => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('veiculo_id').references('id').inTable('veiculos').onDelete('CASCADE');
      
      table.float('pneu_frente_psi').defaultTo(30);
      table.float('pneu_tras_psi').defaultTo(40);
      
      table.string('viscosidade_oleo').defaultTo('20W50');
      table.integer('intervalo_oleo_km').defaultTo(5000);
      table.integer('alerta_revisao_antes_km').defaultTo(500);

      table.boolean('is_active').defaultTo(true);
      table.timestamps(true, true);
    });
};