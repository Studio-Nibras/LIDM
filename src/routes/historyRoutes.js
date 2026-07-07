const express = require("express");

const router = express.Router();

const historyController = require("../controllers/historyController");

// const authMiddleware = require("../middlewares/authMiddleware");

router.get("/", historyController.getHistory);

router.post("/", historyController.createHistory);

module.exports = router;
