const express = require('express');
const router = express.Router();
const lectureController = require('../controllers/lectureController'); 
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); 
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// rute transkrip
router.post('/create-note', lectureController.createNote);
router.post('/transcript', upload.single('file'), lectureController.saveTranscript);
router.post('/stream-audio', upload.single('audio'), lectureController.processMicAudio);
router.get('/', lectureController.getAllLectures); 

// rute download
router.get('/mindmap/:mindMapId/download', lectureController.downloadMindMap);

// rute Kuis
router.post('/generate-quiz', lectureController.generateQuiz);
router.post('/submit-quiz', lectureController.submitQuizAnswers);

module.exports = router;