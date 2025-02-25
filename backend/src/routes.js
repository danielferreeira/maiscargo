// Rotas de fretes - Endpoints específicos primeiro
routes.get('/freights/data/financial', authMiddleware, FreightController.getFinancialData);
routes.get('/freights/data/available', authMiddleware, FreightController.available);

// Rotas de fretes - CRUD básico
routes.get('/freights', authMiddleware, FreightController.index);
routes.post('/freights', authMiddleware, FreightController.store);
routes.get('/freights/:id', authMiddleware, FreightController.show);
routes.put('/freights/:id', authMiddleware, FreightController.update);
routes.delete('/freights/:id', authMiddleware, FreightController.delete);

// Rotas de fretes - Ações específicas com ID
routes.post('/freights/:id/accept', authMiddleware, FreightController.accept);
routes.post('/freights/:id/start', authMiddleware, FreightController.startTransport);
routes.post('/freights/:id/finish', authMiddleware, FreightController.finishTransport);
routes.post('/freights/:id/cancel', authMiddleware, FreightController.cancel);
routes.put('/freights/:id/costs', authMiddleware, FreightController.updateCosts);

// Rotas de usuário
routes.put('/users/preferences', authMiddleware, UserController.updatePreferences); 