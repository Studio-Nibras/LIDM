const express = require("express");
const router = express.Router();

const historyController = require("../controllers/historyController");
const authenticateUser = require("../middleware/authenticateUser");

router.get("/", authenticateUser, historyController.getHistory);

router.post("/", authenticateUser, historyController.createHistory);

module.exports = router;
