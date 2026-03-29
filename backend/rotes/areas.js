const express = require('express');
const router = express.Router();
const areascontroller = require('../controller/areas.controller');

// 1. Listar todas las áreas
router.get('/', areascontroller.list);

// 2. Guardar nueva área
router.post('/', areascontroller.save);

// 3. Actualizar área (o reactivar estado)
router.put('/:id_area', areascontroller.update);

// 4. ELIMINAR LÓGICO (Desactivar)
router.delete('/:id_area', areascontroller.delete);

module.exports = router;