import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import authConfig from '../config/auth.js';

export default async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2) {
      return res.status(401).json({ error: 'Token mal formatado' });
    }

    const [scheme, token] = parts;

    if (!/^Bearer$/i.test(scheme)) {
      return res.status(401).json({ error: 'Token mal formatado' });
    }

    try {
      const decoded = await promisify(jwt.verify)(token, authConfig.secret);
      
      if (!decoded || !decoded.id) {
        return res.status(401).json({ error: 'Token inválido' });
      }

      const now = Date.now().valueOf() / 1000;
      if (typeof decoded.exp !== 'undefined' && decoded.exp < now) {
        return res.status(401).json({ error: 'Token expirado' });
      }
      
      req.userId = decoded.id;
      return next();
    } catch (err) {
      if (err instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({ error: 'Token inválido' });
      }
      if (err instanceof jwt.TokenExpiredError) {
        return res.status(401).json({ error: 'Token expirado' });
      }
      throw err;
    }
  } catch (error) {
    return res.status(500).json({ error: 'Erro interno na autenticação' });
  }
}; 