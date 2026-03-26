// src/config/InfluxConfig.js
require('dotenv').config();
const { InfluxDB, Point } = require('@influxdata/influxdb-client');
const logger = require('../../Utils/Logger/LoggerConfig');

class InfluxConfig {
  constructor() {

    // Agora o process.env deve estar populado
    if (!process.env.INFLUX_URL) {
      throw new Error("Variável INFLUX_URL não definida no .env");
    }

    this.client = new InfluxDB({ 
      url: process.env.INFLUX_URL, 
      token: process.env.INFLUX_TOKEN 
    });
    
    this.org = process.env.INFLUX_ORG;
    this.writeApis = new Map(); // Mapa para gerenciar múltiplos buckets
  }

  /**
   * Obtém ou cria uma WriteApi para um bucket específico
   */
  getWriteApi(bucketName) {
    if (!this.writeApis.has(bucketName)) {
      const api = this.client.getWriteApi(this.org, bucketName, 'ns', {
        batchSize: 50,
        flushInterval: 1000
      });


      this.writeApis.set(bucketName, api);
      logger.info(`✅ [INFLUX] WriteAPI inicializada para o bucket: ${bucketName}`);
    }
    return this.writeApis.get(bucketName);
  }
  
  initDefaultBuckets() {
    const telemetry = process.env.INFLUX_BUCKET_TELEMETRY || 'Log-Telemetry';
    const geo = process.env.INFLUX_BUCKET_GEO || 'Log-Geolocation';
    
    this.getWriteApi(telemetry);
    this.getWriteApi(geo);
  }

  async save(bucket, measurement, payload, tags = {}) {
    try {
      const api = this.getWriteApi(bucket);
      const point = new Point(measurement);

      // Aplica tags dinâmicas (ex: sensor: engine_temp, host: mikrotik)
      Object.entries(tags).forEach(([key, value]) => point.tag(key, value));

      let hasData = false;

      // Mapeamento dinâmico (sua lógica original aprimorada)
      const dataToProcess = payload.data && typeof payload.data === 'object' ? payload.data : payload;

      Object.entries(dataToProcess).forEach(([key, value]) => {
        if (typeof value === 'number') {
          point.floatField(key, value);
          hasData = true;
        } else if (typeof value === 'string') {
          point.stringField(key, value);
          hasData = true;
        }
      });

      if (hasData) {
        const timestamp = payload.ts ? new Date(payload.ts) : new Date();
        point.timestamp(timestamp);
        api.writePoint(point);
      }
    } catch (err) {
      logger.error(`❌ [INFLUX] Erro ao salvar no bucket ${bucket}: ${err.message}`);
    }
  }
}

module.exports = new InfluxConfig();