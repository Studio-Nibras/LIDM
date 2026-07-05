const express = require('express');
const router = express.Router();
const workspaceController = require('../controllers/workspaceController');

// isyarat kamera
router.post('/gesture/translate', workspaceController.translateGesture);

// generate mind map
router.post('/generate-mindmap', workspaceController.generateMindMapFromText);

// edit mind map
router.put('/mindmap/update', workspaceController.updateMindMapManual);

// generate kuis
router.post('/generate-quiz', workspaceController.generateQuizFromText);

// submit kuis
router.post('/submit-quiz', workspaceController.submitQuiz);

module.exports = router;