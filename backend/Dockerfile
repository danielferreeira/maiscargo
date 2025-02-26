# Use a imagem oficial do Node.js
FROM node:16

# Instalar curl para healthcheck
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

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
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["sh", "/usr/src/app/start.sh"] 