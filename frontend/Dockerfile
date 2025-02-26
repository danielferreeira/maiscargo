# Use a imagem oficial do Node.js
FROM node:18-alpine

# Instalar curl para healthcheck
RUN apk add --no-cache curl

# Criar diretório da aplicação
WORKDIR /usr/src/app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar código fonte
COPY . .

# Dar permissão de execução ao script de inicialização
RUN chmod +x /usr/src/app/start.sh

# Expor porta
EXPOSE 5173

# Comando para iniciar a aplicação
CMD ["sh", "/usr/src/app/start.sh"] 