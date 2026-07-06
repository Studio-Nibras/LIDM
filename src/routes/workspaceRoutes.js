const express = require("express");
const router = express.Router();
const workspaceController = require("../controllers/workspaceController");

const {
  generateMindMapFromText,
  getMindMap,
} = require("../controllers/workspaceController");

// isyarat kamera
router.post("/gesture/translate", workspaceController.translateGesture);

// generate mind map
router.post("/generate-mindmap", workspaceController.generateMindMapFromText);

// edit mind map
router.put("/mindmap/update", workspaceController.updateMindMapManual);

router.get("/mindmap/:workspaceId", getMindMap);

// generate kuis
router.post("/generate-quiz", workspaceController.generateQuizFromText);
router.get("/:workspaceId/quiz", workspaceController.getQuizByWorkspace);

// submit kuis
router.post("/submit-quiz", workspaceController.submitQuiz);

module.exports = router;
