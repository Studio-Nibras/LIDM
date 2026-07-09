const express = require("express");

const router = express.Router();

const { getProfile } = require("../controllers/profileController");

router.get("/:userId", getProfile);

module.exports = router;
