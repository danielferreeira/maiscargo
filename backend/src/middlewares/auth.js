import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import authConfig from '../config/auth.js';

export default async (req, res, next) => {
  try {
    console.log('=== Iniciando verificação de autenticação ===');
    console.log('URL requisitada:', req.method, req.originalUrl);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      console.log('Token não fornecido no header');
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const [, token] = authHeader.split(' ');
    
    if (!token) {
      console.log('Token inválido após split');
      return res.status(401).json({ error: 'Token mal formatado' });
    }

    console.log('Token extraído:', token.substring(0, 20) + '...');

    try {
      const decoded = await promisify(jwt.verify)(token, authConfig.secret);
      console.log('Token decodificado com sucesso:', {
        userId: decoded.id,
        exp: new Date(decoded.exp * 1000).toISOString()
      });
      
      req.userId = decoded.id;
      console.log('=== Autenticação concluída com sucesso ===');
      return next();
    } catch (err) {
      console.error('Erro ao verificar token:', {
        name: err.name,
        message: err.message,
        expiredAt: err.expiredAt
      });
      return res.status(401).json({ error: 'Token inválido' });
    }
  } catch (error) {
    console.error('Erro inesperado na autenticação:', error);
    return res.status(500).json({ error: 'Erro interno na autenticação' });
  }
}; 