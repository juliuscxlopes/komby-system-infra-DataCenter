// src/workers/TelemetryWorker.js
const subscriber = require('../infra/RedisStreamController/StreamSubscriber');
const influxController = require('../database/influx/InfluxController');
const logger = require('../config/logger');

class TelemetryWorker {
  async start() {
    logger.info('📥 [WORKER] TelemetryWorker inicializado. Monitorando stream: log');

    // O papel deste worker é descarregar o "pulmão" do Redis no InfluxDB
    // 'log' é o alias definido no seu StreamRules
    subscriber.listen('log', async (payload) => {
      try {
        // payload esperado: { sensor, data, ts } ou campos soltos { rpm, p_oil, ts }
        
        // Chamamos o método save do nosso InfluxConfig padronizado
        await influxController.save(payload);
        
        // Logamos com o nível 'data' (verde)
        // Se o payload tiver o nome do sensor, usamos, senão indicamos telemetria geral
        const sensorName = payload.sensor || 'general_telemetry';
        logger.log('data', `✅ [WORKER] Persistido no Influx: ${sensorName}`);

      } catch (err) {
        // Log de erro (vermelho) com detalhes do que falhou
        logger.error(`🚨 [WORKER] Falha ao processar telemetria (${payload.sensor || 'unknown'}): ${err.message}`);
      }
    });
  }
}

module.exports = new TelemetryWorker();