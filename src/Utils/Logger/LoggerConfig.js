const winston = require('winston');
const path = require('path');

// Definição de cores para o terminal
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'blue',
  ws: 'magenta',     // Cor para WebSockets
  data: 'green',     // Cor para Registros de Dados
  query: 'cyan',     // Cor para Consultas
  delete: 'red',      // Cor para Deletes (Alerta!)
  debug: 'gray'      // Cor para Debug (menos importante, mais discreto)
};

winston.addColors(colors);

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} [${info.level}]: ${info.message}`,
  ),
);

const logger = winston.createLogger({
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    ws: 3,
    data: 4,
    query: 5,
    delete: 6
  },
  format,
  transports: [
    // 1. Console para ver agora
    new winston.transports.Console(),
    // 2. Arquivo para erros críticos
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/error.log'),
      level: 'error',
    }),
    // 3. Arquivo para registros e operações (o "diário" da Kombi)
    new winston.transports.File({ 
        filename: path.join(__dirname, '../../logs/combined.log') 
    }),
  ],
});

module.exports = logger;