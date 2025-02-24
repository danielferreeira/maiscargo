import { Router } from 'express';
import VehicleController from '../controllers/VehicleController.js';

const routes = Router();

routes.get('/', VehicleController.index);
routes.post('/', VehicleController.store);
routes.get('/:id', VehicleController.show);
routes.put('/:id', VehicleController.update);
routes.delete('/:id', VehicleController.delete);
routes.get('/:id/freights', VehicleController.getFreights);

export default routes; 