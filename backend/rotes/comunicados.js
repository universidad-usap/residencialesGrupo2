const express = require('express');
const router = express.Router();
const comunicadoscontroller = require('../controller/comunicados.controller');

// Obtener todos los comunicados
router.get('/', comunicadoscontroller.list);

// Publicar un nuevo comunicado
router.post('/', comunicadoscontroller.save);

// Eliminar un comunicado específico por ID
// Se utiliza el parámetro :id para que coincida con el controlador
router.delete('/:id', comunicadoscontroller.delete);

module.exports = router;