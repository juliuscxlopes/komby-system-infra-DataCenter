// src/infrastructure/RedisConfig.js
require('dotenv').config();
const Redis = require('ioredis');

class RedisService {
constructor() {
    this.client = new Redis({
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || undefined, // ioredis prefere undefined se não houver senha
      // Dica: Adicione um retryStrategy para não derrubar o DataCenter se o Redis oscilar
      retryStrategy: (times) => Math.min(times * 50, 2000)
    });
    
    // Alinhado com o StreamRules do Controller
    this.STREAMS = {
      LOG:      'kombi:stream:log',
      ELECTRIC: 'kombi:stream:electric',
      ENGINE:   'kombi:stream:engine',
      THERMAL:  'kombi:stream:thermal',
      HEALTH:   'kombi:stream:health',
      ALERTS:   'kombi:stream:alerts',
      GPS:     'kombi:stream:gps' // Adicionamos a via para o Banco
    };
  }

  // O publish agora carimba o dado para o Controller/DataCenter entender
  async publish(streamName, sensorName, data) {
    // Garantimos que o payload sempre tenha o timestamp do Core
    const payload = {
        ...data,
        ts: Date.now()
    };


    
    // Escreve na stream principal (ex: engine)
    // Usamos o padrão: 'sensor', [NOME], 'data', [JSON]
    return await this.client.xadd(
        streamName, 
        '*', 
        'sensor', sensorName, 
        'data', JSON.stringify(payload)
    );
  }
  async readStream(streamName, lastId = '$') {
    return await this.client.xread('BLOCK', 0, 'STREAMS', streamName, lastId);
  }
  
}


module.exports = new RedisService();