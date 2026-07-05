const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');

// menu kuis
router.get('/', quizController.getQuizMenu);

// submit kuis
router.post('/submit-mandiri', quizController.submitQuizMandiri);

// lawan battle
router.post('/battle-match', quizController.findBattleOpponent);

// teman di kolom search
router.get('/battle/search', quizController.searchUsersForBattle);

// daftar teman online
router.get('/battle/friends-online', quizController.getOnlineFriendsList);

// undang battle
router.post('/battle/invite', quizController.sendBattleInvitation);

module.exports = router;