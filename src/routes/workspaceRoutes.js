const express = require("express");
const router = express.Router();

const authenticateUser = require("../middleware/authenticateUser");
const workspaceController = require("../controllers/workspaceController");

const {
  generateMindMapFromText,
  getMindMap,
} = require("../controllers/workspaceController");

// Semua endpoint workspace wajib login
router.use(authenticateUser);

// isyarat kamera
router.post("/gesture/translate", workspaceController.translateGesture);

// generate mind map
router.post("/generate-mindmap", workspaceController.generateMindMapFromText);

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
