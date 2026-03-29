const express = require('express');
const router = express.Router();
const servicioscontroller = require('../controller/servicios.controller');

router.get('/', servicioscontroller.list);
router.post('/', servicioscontroller.save);

module.exports = router;