import { Router } from 'express';
import UserController from '../controllers/UserController.js';

const routes = Router();

routes.get('/profile', UserController.getProfile);
routes.put('/profile', UserController.updateProfile);
routes.get('/stats', UserController.getStats);
routes.get('/:id', UserController.show);

export default routes; 