routes.get('/freights', authMiddleware, FreightController.index);
routes.get('/freights/available', authMiddleware, FreightController.available);
routes.get('/freights/financial', authMiddleware, FreightController.getFinancialData);
routes.get('/freights/:id', authMiddleware, FreightController.show);

// Rotas de usuário
routes.put('/users/preferences', authMiddleware, UserController.updatePreferences); 