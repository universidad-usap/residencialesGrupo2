const express = require("express");
const router = express.Router();

const residentesController = require("../controller/residentes.controller");
router.get("/", residentesController.list);
router.post("/", residentesController.save);
router.put("/:id_residente", residentesController.update);
router.delete("/:id_residente", residentesController.delete);

module.exports = router;
