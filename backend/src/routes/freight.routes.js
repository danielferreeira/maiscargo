import { Router } from 'express';
import FreightController from '../controllers/FreightController.js';
import authMiddleware from '../middlewares/auth.js';

const routes = Router();

// Aplica o middleware de autenticação em todas as rotas
routes.use(authMiddleware);

// Rotas específicas primeiro
routes.get('/data/financial', FreightController.getFinancialData);
routes.get('/data/available', FreightController.available);
routes.get('/', FreightController.index);

// Rotas com parâmetros depois
routes.post('/', FreightController.store);
routes.get('/:id', FreightController.show);
routes.put('/:id', FreightController.update);
routes.delete('/:id', FreightController.delete);
routes.post('/:id/accept', FreightController.accept);
routes.post('/:id/start', FreightController.startTransport);
routes.post('/:id/finish', FreightController.finishTransport);
routes.post('/:id/cancel', FreightController.cancel);
routes.put('/:id/costs', FreightController.updateCosts);

export default routes; 