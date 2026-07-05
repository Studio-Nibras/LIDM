const express = require('express');
const router = express.Router();
const historyController = require('../controllers/historyController');

// GET untuk menampilkan dashboard riwayat belajar dan kalender
router.get('/', historyController.getHistoryDashboard);

// aktivitas kalender
router.post('/log-activity', historyController.logActivity);

module.exports = router;