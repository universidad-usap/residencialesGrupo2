const express = require('express');
const router = express.Router();
const casascontroller = require('../controller/casas.controller');

router.get('/', casascontroller.list);
router.post('/', casascontroller.save);
router.put('/:id_casa', casascontroller.update);

module.exports = router;
router.get('/pagos/casa/:id', (req, res) => {

  const { id } = req.params;

  const query = `
    SELECT 
      p.id_pago,
      s.nombre AS servicio,
      p.monto,
      p.fecha_pago AS fecha,
      p.estado
    FROM pagos p
    JOIN servicios s ON p.id_servicio = s.id_servicio
    WHERE p.id_casa = ?
  `;

  connection.query(query, [id], (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });

});