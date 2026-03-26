require('dotenv').config();
const WebSocket = require('ws');
const express = require('express');
const db = require('./src/DataBase/Postgrees/PgConfig/PgConfig');
const { connectMongo } = require('./src/DataBase/Mongo/MongoConfig');
const { initBuckets } = require('./src/DataBase/Mongo/GridFsConfig');
const influx = require('./src/DataBase/Influx/InfluxConfig');
const redis = require('./src/DataBase/Redis/Config/RedisConfig'); // Instância limpa do Redis
const wsRouter = require('./src/WebSocket/WsRouter');
const logger = require('./src/Utils/Logger/LoggerConfig');
const Routes = require('./src/routes/routes');
const corsMiddleware = require('./src/Utils/Cors/cors');
const bodyParser = require('body-parser');

async function startDataCenter() {
  console.log("🏢 [DATACENTER] Iniciando Hub de Persistência...");

  const app = express();
    app.use(corsMiddleware);
    app.use(express.json());
    app.use(bodyParser.json());
    app.use(Routes);
  

  try {
    // 1. Bancos Relacionais 
    await db.raw('SELECT 1');
    console.log("🐘 [POSTGRES] Conexão ativa.");
    
    // 2. MongoDB & GridFS
    await connectMongo();
    console.log("🍃 [MONGODB] Cluster pronto.");
    initBuckets(['kombi_Assets','User_Assets']); // Inicializa os buckets necessários

    // 3. InfluxDB (Telemetria)
    // Inicializamos as WriteAPIs para os dois buckets específicos
    influx.getWriteApi('Log-Telemetry');
    influx.getWriteApi('Log-Geolocation');

    console.log("🛢️  [INFLUXDB] Pipeline configurado (Telemetry & Geolocation).");

    // 4. Redis (O ioredis conecta automaticamente no constructor)
    // Apenas verificamos se o status está 'ready' ou 'connecting'
    console.log(`🔴 [REDIS] Status da conexão: ${redis.client.status}`);

    // Se quiser um log de confirmação real:
    redis.client.on('connect', () => {
        console.log("🔴 [REDIS] Pool de conexão estabelecido e pronto.");
    });

    // 5. Inicialização do Servidor WebSocket (Porta 8080 ou via ENV)
    const wss = new WebSocket.Server({ port: process.env.WS_PORT || 8080 });

    wss.on('connection', (ws, req) => {
      const ip = req.socket.remoteAddress;
      logger.log('ws', `🔌 [WS] Novo dispositivo conectado: ${ip}`);

      ws.on('message', async (message) => {
        // O Roteador assume o controle a partir daqui
        await wsRouter.handle(ws, message);
      });

      ws.on('close', () => logger.log('ws', `❌ [WS] Conexão encerrada: ${ip}`));
    });

    // 6. Http Server (Opcional, para APIs REST futuras)
    const httpPort = process.env.PORT || 3000;
    app.listen(httpPort, () => {
      console.log(`🌐 [HTTP] Servidor Express rodando na porta ${httpPort} (Auth API)`);
    });

    console.log(`🚀 [DATACENTER] WS Server rodando na porta ${process.env.WS_PORT || 8080}`);
    console.log("✅ [DATACENTER] Todos os serviços operacionais.");

  } catch (err) {
    console.error("💥 [FATAL] Erro na inicialização:", err.stack);
    process.exit(1);
  }
}

// Graceful Shutdown
process.on('SIGINT', async () => {
  console.log("\n🛑 [DATACENTER] Encerrando conexões...");
  await knex.destroy();
  await redis.quit();
  process.exit(0);
});

startDataCenter();