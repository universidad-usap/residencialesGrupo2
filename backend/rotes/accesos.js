const express = require('express');
const router = express.Router();

const accesosController = require('../controller/accesos.controller');

router.post('/validar', accesosController.validar);
router.get('/', accesosController.list);

module.exports = router;
