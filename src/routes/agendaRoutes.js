const express = require("express");

const router = express.Router();

const { createAgenda, getAgenda } = require("../controllers/agendaController");

router.post("/", createAgenda);

router.get("/", getAgenda);

module.exports = router;
