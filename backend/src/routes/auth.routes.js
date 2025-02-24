import { Router } from 'express';
import AuthController from '../controllers/AuthController.js';

const routes = Router();

routes.post('/login', AuthController.login);
routes.post('/register', AuthController.register);

export default routes; 