const express = require("express");
const router = express.Router();

const agendaController = require("../controllers/agendaController");
const authenticateUser = require("../middleware/authenticateUser");

router.use(authenticateUser);

router.get("/", agendaController.getAgenda);

router.post("/", agendaController.createAgenda);

router.delete("/:id", agendaController.deleteAgenda);

module.exports = router;
