const express = require('express');
const router = express.Router();
const loginController = require('../controller/login.controller');

// Ruta para el Login (POST porque enviamos datos sensibles)
router.post('/', loginController.login);

// Ruta para crear usuarios (Opcional, si quieres hacer un CRUD de usuarios)
router.post('/save', loginController.save);

// Ruta para listar usuarios
router.get('/list', loginController.list);

module.exports = router;