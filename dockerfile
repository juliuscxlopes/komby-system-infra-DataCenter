# Estágio de Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Estágio de Produção
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app ./

# Instalando dependências de sistema necessárias (ex: para node-gyp se tiver)
RUN apk add --no-null-cache python3 make g++

EXPOSE 3000 8080
CMD ["node", "App.js"]