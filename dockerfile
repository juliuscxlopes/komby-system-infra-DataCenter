FROM node:18-slim
WORKDIR /app

# Copia os arquivos de dependência
COPY package*.json ./

# Instala apenas o necessário
RUN npm install --production

# Copia o resto do código
COPY . .

# Expõe as portas que você configurou (Auth e WS)
EXPOSE 3000 8080

CMD ["node", "App.js"]