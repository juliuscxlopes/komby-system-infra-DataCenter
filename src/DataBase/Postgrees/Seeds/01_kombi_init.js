// seeds/01_kombi_init.js
const logger = require('../config/logger');

exports.seed = async function(knex) {
  try {
    // 1. Limpeza (Ordem reversa para não quebrar FK)
    await knex('carburacao_setup').del();
    await knex('motores').del();
    await knex('veiculos').del();
    
    logger.log('delete', '[SEED] Tabelas limpas para reinicialização.');

    // 2. VEÍCULO
    const [veiculo] = await knex('veiculos').insert({
      nome_apelido: "Margarida", 
      marca_modelo_ano: "Wolkswagen Kombi 1989",
      placa: "",
      chassi: "",
      cor: "Bege",
      peso_vazio_kg: 0,
      capacidade_carga_kg: 1000, // Capacidade de carga maxima da kombi
      dimensoes: JSON.stringify({ h: 190, w: 457, l: 175 }), // Dimensões aproximadas da Kombi em cm
      tipo_refrigeracao: "AR" // ou "AGUA"
    }).returning('*');

    logger.log('query', `[SEED] Veículo inserido: ${veiculo.nome_apelido}`);

    // 3. MOTOR
    const [motor] = await knex('motores').insert({
      veiculo_id: veiculo.id,
      codigo_motor: "0",
      cilindrada_cc: 1600,
      Hp_Horses: "56", // Potência do motor em cavalos
      Capacidade_Oleo_L: "2,5", // Capacidade de óleo do motor em litros
      viscosidade_oleo: "20w50", // Viscosidade Padrão para o Motor
      combustivel: "Alcool", // Combustivel Padrão para o Motor
      Capacidade_Combustivel_L: 0,
      bore_stroke: "",
      sistema_escape: "Original",
      ativo: true
    }).returning('*');

    logger.log('query', `[SEED] Motor inserido: ${motor.codigo_motor}`);

    // 4. CARBURAÇÃO
    await knex('carburacao_setup').insert({
      motor_id: motor.id,
      modelo_carburador: "Solex 32 PDSIT",
      venturi: 22, // Tamanho do venturi em mm
      gicle_principal: 157, 
      gicle_lenta: 60,
      corretor_ar: 0,
      tubo_misturador: "125",// Diâmetro do tubo misturador em mm
      injetor_rapida: 50, // Tamanho do injetor em mm
      is_active: true,
      motivo_ajuste: "Setup inicial de restauração"
    });

    logger.log('data', '[SEED] Setup de carburação vinculado ao motor com sucesso.');
    logger.log('info', '✅ [SEED] Base de dados da Kombi pronta para rodar!');

  } catch (err) {
    logger.error(`🚨 [SEED] Erro ao popular banco: ${err.message}`);
    throw err;
  }
};