const express = require("express");
const router = express.Router();

const authenticateUser = require("../middleware/authenticateUser");

router.get("/me", authenticateUser, (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
});

module.exports = router;
