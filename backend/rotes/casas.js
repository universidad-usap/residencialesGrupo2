const express = require('express');
const router = express.Router();
const casascontroller = require('../controller/casas.controller');

router.get('/', casascontroller.list);
router.post('/', casascontroller.save);
router.put('/:id_casa', casascontroller.update);

module.exports = router;