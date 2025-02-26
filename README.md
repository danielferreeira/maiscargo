# MaisCargo - Sistema de Gerenciamento de Fretes

Sistema completo para gerenciamento de fretes, conectando embarcadores e transportadores.

## Estrutura do Projeto

```
maiscargo/
├── backend/           # API REST em Node.js
│   ├── src/
│   │   ├── controllers/  # Controladores da aplicação
│   │   ├── models/       # Modelos do Sequelize
│   │   ├── database/     # Configurações do banco de dados
│   │   │   ├── migrations/  # Migrações do banco
│   │   │   └── backup.sql  # Backup do banco de dados
│   │   └── routes/      # Rotas da API
│   └── .env.example     # Exemplo de variáveis de ambiente
└── frontend/         # Interface React
    ├── src/
    │   ├── components/  # Componentes React
    │   ├── pages/      # Páginas da aplicação
    │   └── services/   # Serviços e integrações
    └── .env.example    # Exemplo de variáveis de ambiente
```

## Pré-requisitos

- Node.js (v16 ou superior)
- PostgreSQL (v12 ou superior)
- NPM ou Yarn

## Instalação

### 1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/maiscargo.git
cd maiscargo
```

### 2. Configure o Banco de Dados:

a. Crie um novo banco de dados PostgreSQL:
```bash
psql -U postgres
CREATE DATABASE maiscargo;
\q
```

b. Restaure o backup do banco de dados:
```bash
psql -U postgres -d maiscargo -f backend/src/database/backup.sql
```

### 3. Configure o Backend:

a. Instale as dependências:
```bash
cd backend
npm install
```

b. Configure as variáveis de ambiente:
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

c. Execute as migrations (se não restaurou o backup):
```bash
npm run migrate
```

d. Inicie o servidor:
```bash
npm run dev
```

### 4. Configure o Frontend:

a. Instale as dependências:
```bash
cd ../frontend
npm install
```

b. Configure as variáveis de ambiente:
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

c. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

## Configuração do Ambiente

### Backend (.env)
```env
# Configurações do Banco de Dados
DB_HOST=localhost
DB_USER=postgres
DB_PASS=sua_senha
DB_NAME=maiscargo
DB_PORT=5432

# Configurações do Servidor
PORT=3000
NODE_ENV=development

# Frontend URL (para CORS)
FRONTEND_URL=http://localhost:5173

# JWT
JWT_SECRET=sua_chave_secreta_jwt
JWT_EXPIRES_IN=7d
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000/api
```

## Comandos Úteis

### Backend

```bash
# Iniciar em desenvolvimento
npm run dev

# Iniciar em produção
npm start

# Executar migrations
npm run migrate

# Desfazer última migration
npm run migrate:undo

# Desfazer todas as migrations
npm run migrate:undo:all

# Criar dados de teste
npm run seed:freights
```

### Frontend

```bash
# Iniciar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview
```

## Estrutura do Banco de Dados

O sistema utiliza três tabelas principais:

1. `users` - Armazena informações dos usuários (embarcadores e transportadores)
2. `vehicles` - Cadastro de veículos dos transportadores
3. `freights` - Registro de fretes

O esquema completo pode ser encontrado no arquivo `backend/src/database/backup.sql`

## Funcionalidades Principais

- Cadastro e autenticação de usuários (Embarcadores e Transportadores)
- Gerenciamento de fretes
- Cálculo de custos e rotas
- Gestão financeira para transportadores
- Sistema de notificações
- Dashboard com métricas

## Tecnologias Utilizadas

### Backend
- Node.js
- Express
- Sequelize (ORM)
- PostgreSQL
- JWT para autenticação
- Socket.IO para comunicação em tempo real

### Frontend
- React
- Material-UI para interface
- Vite para build e desenvolvimento
- Axios para requisições HTTP
- React Router para navegação

## Solução de Problemas

### Erro de conexão com o banco
1. Verifique se o PostgreSQL está rodando
2. Confira as credenciais no arquivo `.env`
3. Certifique-se que o banco de dados existe

### Erro no frontend
1. Verifique se a URL da API está correta no `.env`
2. Limpe o cache do navegador
3. Delete a pasta `node_modules` e reinstale as dependências

## Contribuição

1. Faça o fork do projeto
2. Crie sua feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes. 