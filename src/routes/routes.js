const express = require('express');
const AuthController = require('../Controller/API/AuthController');
const AuthGoogleController = require('../Controller/API/AuthGoogleController');
const routes = express.Router();

// NOVAS ROTAS DE LOGIN/REGISTRO DIRETO
routes.post('/auth/register', AuthController.register); 

routes.post('/auth/login', AuthController.login);



// Rota 1: Iniciar o fluxo OAuth (Frontend busca o URL do Google)
routes.get('/auth/google', AuthGoogleController.googleAuth);

// Rota 2: Endpoint para receber o código de autorização do Frontend
routes.all('/auth/google/callback', AuthGoogleController.googleAuthCallback);



module.exports = routes;