const express = require('express');
const router = express.Router();
const gestureController = require('../controllers/gestureController');

// kosa kata yang didefinisikan app
router.get('/library', gestureController.getGestureLibrary);

//rute kamera fe saat mendeteksi
router.post('/translate', gestureController.translateGesture);

module.exports = router;