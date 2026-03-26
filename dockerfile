# Estágio de Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Estágio de Produção
FROM node:20-alpine
WORKDIR /app
# Copia apenas o que foi instalado/preparado no builder
COPY --from=builder /app ./

# AQUI ESTAVA O ERRO - Removi o comando apk problemático
# Se o seu projeto precisar de python no futuro, o comando correto é:
# RUN apk add --no-cache python3 make g++

EXPOSE 3000 8080
CMD ["node", "App.js"]