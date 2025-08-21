# Use uma imagem oficial do Node.js como base
FROM node:18

# Cria e define o diretório de trabalho
WORKDIR /app

# Copia apenas os arquivos necessários para o build
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia a pasta prisma
COPY prisma prisma/

# Gera o cliente Prisma (ESSENCIAL)
RUN npx prisma generate

# Copia o restante do código para o container
COPY . .

# faz build
RUN npx tsc

# Expõe a porta onde o servidor estará rodando
EXPOSE 3333

# Comando padrão do container (não precisa no docker-compose)
CMD ["npm", "start"]
