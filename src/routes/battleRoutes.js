const express = require("express");
const router = express.Router();

const authenticateUser = require("../middleware/authenticateUser");

const {
  searchUsers,
  getQuizList,
  createBattle,
  getPendingBattles,
  acceptBattle,
  getBattleSession,
  submitBattle,
} = require("../controllers/battleController");

// ==================== QUIZ ====================

router.get("/quiz-list", authenticateUser, getQuizList);

// ==================== USER ====================

router.get("/users", authenticateUser, searchUsers);

// ==================== BATTLE ====================

router.post("/create", authenticateUser, createBattle);

router.get("/pending", authenticateUser, getPendingBattles);

router.post("/accept/:sessionId", authenticateUser, acceptBattle);

router.get("/session/:sessionId", authenticateUser, getBattleSession);

router.post("/submit/:sessionId", authenticateUser, submitBattle);

module.exports = router;
