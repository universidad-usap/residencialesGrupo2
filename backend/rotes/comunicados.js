const express = require('express');
const router = express.Router();
const comunicadoscontroller = require('../controller/comunicados.controller');

router.get('/', comunicadoscontroller.list);
router.post('/', comunicadoscontroller.save);

module.exports = router;