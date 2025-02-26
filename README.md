# MaisCargo

Sistema de gerenciamento de fretes e transportes.

## Requisitos

- Docker
- Docker Compose

## Configuração Inicial

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/maiscargo.git
cd maiscargo
```

2. Copie o arquivo de exemplo de variáveis de ambiente:
```bash
cp .env.example .env
```

3. (Opcional) Ajuste as variáveis no arquivo `.env` conforme necessário.

## Executando o Projeto

1. Inicie os containers:
```bash
docker-compose up -d
```

2. Aguarde todos os serviços iniciarem. Você pode acompanhar os logs com:
```bash
docker-compose logs -f
```

3. Acesse a aplicação:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000/api
   - Documentação API: http://localhost:3000/api/docs

## Estrutura do Projeto

```
maiscargo/
├── backend/               # API Node.js
│   ├── src/
│   │   ├── config/       # Configurações
│   │   ├── controllers/  # Controladores
│   │   ├── database/     # Migrations e seeds
│   │   ├── middlewares/  # Middlewares
│   │   ├── models/       # Modelos
│   │   ├── routes/       # Rotas
│   │   └── utils/        # Utilitários
│   └── Dockerfile
├── frontend/             # Interface React
│   ├── src/
│   │   ├── assets/      # Recursos estáticos
│   │   ├── components/  # Componentes React
│   │   ├── contexts/    # Contextos React
│   │   ├── hooks/       # Hooks personalizados
│   │   ├── pages/       # Páginas
│   │   ├── services/    # Serviços e API
│   │   └── utils/       # Utilitários
│   └── Dockerfile
├── docker-compose.yml    # Configuração Docker
└── .env                 # Variáveis de ambiente
```

## Desenvolvimento

### Comandos Úteis

- **Iniciar containers:**
```bash
docker-compose up -d
```

- **Parar containers:**
```bash
docker-compose down
```

- **Visualizar logs:**
```bash
docker-compose logs -f [serviço]
```

- **Acessar shell do container:**
```bash
docker-compose exec [serviço] sh
```

### Serviços Disponíveis

- **postgres**: Banco de dados PostgreSQL
- **backend**: API Node.js
- **frontend**: Interface React

## Contribuindo

1. Crie uma branch para sua feature:
```bash
git checkout -b feature/nome-da-feature
```

2. Faça commit das mudanças:
```bash
git commit -m 'feat: Adiciona nova funcionalidade'
```

3. Faça push para a branch:
```bash
git push origin feature/nome-da-feature
```

4. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes. 