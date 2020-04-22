const express = require("express");

const router = express.Router();

const comunas = require("../controllers/comunas.controller");
const regiones = require("../controllers/regiones.controller");

router.get("/test", regiones.test);
//router.get("/comunas", comunas.getAll);
//router.get("/comunas/:codigoComuna", comunas.getOne);
/*
router.get("/provincias", provincias.getAll);
router.get("/provincias/:codigoProvincia", provincias.getOne);
router.get("/provincias/comunas", comunas.getAllByProvincia);
router.get("/provincias/comunas/:codigoComuna", comunas.getOneByProvincia);

router.get("/regiones", regiones.getAll);
router.get("/regiones/:codigoRegion", regiones.getOne);
router.get("/regiones/:codigoRegion/provincias", provincias.getAllByRegion);
router.get("/regiones/:codigoRegion/provincias/:codigoProvincia", provincias.getOneByRegion);
router.get("/regiones/:codigoRegion/provincias/:codigoProvincia/comunas", comunas.getAllByRegionAndProvincia);
router.get("/regiones/:codigoRegion/provincias/:codigoProvincia/comunas/:codigoComuna", comunas.getAllByRegionAndProvincia);
router.get("/regiones/:codigoRegion/comunas", comunas.getAllByRegion);
router.get("/regiones/:codigoRegion/comunas/:codigoComuna", comunas.getOneByRegion);
*/

module.exports = router;