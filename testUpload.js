const express = require("express");
const multer = require("multer");

const app = express();

const upload = multer({
  dest: "uploads/",
});

app.post("/hello", (req, res) => {
  console.log("HELLO");
  res.json({ ok: true });
});

app.post("/upload", upload.single("file"), (req, res) => {
  console.log(req.file);

  res.json({
    success: true,
  });
});

app.listen(5000, () => {
  console.log("jalan");
});
