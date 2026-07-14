const express = require("express");
const router = express.Router();

const multer = require("multer");
const path = require("path");

const authenticateUser = require("../middleware/authenticateUser");
const workspaceController = require("../controllers/workspaceController");

const {
  generateMindMapFromText,
  getMindMap,
} = require("../controllers/workspaceController");

const storage = multer.diskStorage({
  destination: "src/uploads",

  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
});

// Semua endpoint workspace wajib login
router.use(authenticateUser);

// isyarat kamera
router.post("/gesture/translate", workspaceController.translateGesture);

// generate mind map
router.post("/generate-mindmap", workspaceController.generateMindMapFromText);

router.get("/ping", (req, res) => {
  res.json({ ok: true });
});

// upload file
router.post(
  "/upload",
  authenticateUser,
  upload.single("file"),
  workspaceController.uploadFile,
);

// edit mind map
router.put("/mindmap/update", workspaceController.updateMindMapManual);

// ambil mind map
router.get("/mindmap/:workspaceId", getMindMap);

// generate quiz
router.post("/generate-quiz", workspaceController.generateQuizFromText);

// ambil quiz
router.get("/:workspaceId/quiz", workspaceController.getQuizByWorkspace);

// submit quiz
router.post("/submit-quiz", workspaceController.submitQuiz);

module.exports = router;
