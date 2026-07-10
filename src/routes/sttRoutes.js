const express = require("express");
const multer = require("multer");

const { transcribe } = require("../controllers/sttController");

const router = express.Router();

const upload = multer({
  dest: "src/uploads/",
});

router.post("/transcribe", upload.single("audio"), transcribe);

module.exports = router;
