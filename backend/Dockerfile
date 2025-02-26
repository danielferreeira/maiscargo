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

# Criar script de inicialização
RUN echo '#!/bin/sh\n\
echo "Aguardando PostgreSQL..."\n\
sleep 10\n\
echo "Executando migrações..."\n\
npm run migrate\n\
echo "Iniciando servidor..."\n\
npm run dev' > /usr/src/app/start.sh && chmod +x /usr/src/app/start.sh

# Expor porta
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["/usr/src/app/start.sh"] 