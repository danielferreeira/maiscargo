import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import routes from './routes/index.js';
import './database/index.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  }
});

const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// Rota de health check (sem autenticação)
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Demais rotas da API (com autenticação)
app.use('/api', routes);

// Socket.IO
io.on('connection', (socket) => {
  console.log('Usuário conectado:', socket.id);

  socket.on('disconnect', () => {
    console.log('Usuário desconectado:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
}); 