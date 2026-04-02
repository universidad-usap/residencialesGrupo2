const express = require('express');
const router = express.Router();
const serviciosController = require('../controller/servicios.controller');

// ==========================================
// RUTAS PARA EL CATÁLOGO DE SERVICIOS
// ==========================================

// Obtener todos los servicios
router.get('/catalogo', serviciosController.listCatalog);

// Guardar un nuevo tipo de servicio
router.post('/catalogo', serviciosController.saveService);

// ACTUALIZAR datos de un servicio (Nombre, Descripción, Costo)
router.put('/catalogo/:id', serviciosController.updateService);

// CAMBIAR ESTADO de un servicio (Activo/Inactivo)
router.put('/estado/:id', serviciosController.updateServiceStatus);


// ==========================================
// RUTAS PARA GESTIÓN DE PAGOS
// ==========================================

// Obtener historial de pagos con JOIN
router.get('/pagos', serviciosController.listPagos);

// Registrar un nuevo cobro/pago
router.post('/pagos', serviciosController.savePago);

// Actualizar estado de un pago (Pendiente -> Pagado)
router.put('/pagos/:id', serviciosController.updatePagoStatus);


module.exports = router;