#!/bin/sh
echo "Aguardando backend..."
while ! curl -s http://backend:3000/api/health > /dev/null; do
    sleep 1
done
echo "Backend está pronto!"
echo "Iniciando frontend..."
npm run dev -- --host 