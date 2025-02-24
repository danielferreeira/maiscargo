import { Router } from 'express';
import userRoutes from './user.routes.js';
import freightRoutes from './freight.routes.js';
import vehicleRoutes from './vehicle.routes.js';
import authRoutes from './auth.routes.js';
import authMiddleware from '../middlewares/auth.js';

const routes = Router();

// Rotas públicas
routes.use('/auth', authRoutes);

// Rotas protegidas
routes.use(authMiddleware);
routes.use('/freights', freightRoutes);
routes.use('/vehicles', vehicleRoutes);
routes.use('/users', userRoutes);

export default routes; 