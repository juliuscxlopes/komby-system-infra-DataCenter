// src/workers/TelemetryWorker.js
const subscriber = require('../infra/RedisStreamController/StreamSubscriber');
const influxController = require('../database/influx/InfluxController');
const logger = require('../config/logger');

class TelemetryWorker {
  async start() {
    logger.info('📥 [WORKER] GPS inicializado. Monitorando stream: GPS');

    // O papel deste worker é descarregar o "pulmão" do Redis no InfluxDB
    // 'GPS' é o alias definido no seu StreamRules
    subscriber.listen('GPS', async (payload) => {
      try {
        // payload esperado: {  } Londitude e latitude {  }
        
        // Chamamos o método save do nosso InfluxConfig padronizado
        await influxController.save(payload);
        
        //const sensorName = payload.sensor || 'general_gps';
        logger.log('GPS', `✅ [WORKER] Persistido no Influx: ${sensorName}`);

      } catch (err) {
        // Log de erro (vermelho) com detalhes do que falhou
        logger.error(`🚨 [WORKER] Falha ao processar GPS (${payload.sensor || 'unknown'}): ${err.message}`);
      }
    });
  }
}

module.exports = new TelemetryWorker();