const express = require('express');
const router = express.Router();

const visitasController = require('../controller/visitas.controller');

router.get('/', visitasController.list);
router.post('/', visitasController.save);
router.delete('/:id_visita', visitasController.delete);
router.get('/tipos', visitasController.listTipos);
router.put('/:id_visita/regenerar-qr', visitasController.regenerarQR);

module.exports = router;
