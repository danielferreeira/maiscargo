#!/bin/sh
echo "Aguardando PostgreSQL..."
sleep 10
echo "Executando migrações..."
npm run migrate
echo "Iniciando servidor..."
npm run dev 