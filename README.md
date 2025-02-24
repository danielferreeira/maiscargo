# MaisCargo - Sistema de Gerenciamento de Fretes

Sistema completo para gerenciamento de fretes, conectando embarcadores e transportadores.

## Estrutura do Projeto

```
maiscargo/
├── backend/           # API REST em Node.js
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── database/
│   │   │   └── migrations/
│   │   └── routes/
│   └── .env.example
└── frontend/         # Interface React
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   └── services/
    └── public/
```

## Pré-requisitos

- Node.js (v16 ou superior)
- PostgreSQL (v12 ou superior)
- NPM ou Yarn

## Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/maiscargo.git
cd maiscargo
```

2. Configure o Backend:
```bash
cd backend
cp .env.example .env  # Configure suas variáveis de ambiente
npm install
npm run migrate       # Execute as migrations
npm run dev          # Inicie o servidor de desenvolvimento
```

3. Configure o Frontend:
```bash
cd ../frontend
npm install
npm run dev          # Inicie o servidor de desenvolvimento
```

## Configuração do Ambiente

### Backend (.env)
```
# Banco de Dados
DB_HOST=localhost
DB_USER=seu_usuario
DB_PASS=sua_senha
DB_NAME=maiscargo

# JWT
JWT_SECRET=seu_secret_jwt

# Servidor
PORT=3000
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:3000
```

## Migrations

O sistema usa Sequelize para gerenciamento do banco de dados. As migrations estão localizadas em `backend/src/database/migrations/`.

Para executar as migrations:
```bash
cd backend
npm run migrate
```

## Funcionalidades Principais

- Cadastro e autenticação de usuários (Embarcadores e Transportadores)
- Gerenciamento de fretes
- Cálculo de custos e rotas
- Gestão financeira para transportadores
- Sistema de notificações
- Dashboard com métricas

## Tecnologias Utilizadas

- Backend:
  - Node.js
  - Express
  - Sequelize
  - PostgreSQL
  - JWT

- Frontend:
  - React
  - Material-UI
  - Vite
  - Axios

## Contribuição

1. Faça o fork do projeto
2. Crie sua feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request 