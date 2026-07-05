const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// registrasi: POST http://localhost:3000/api/auth/register
router.post('/register', authController.registerUser);

// login: POST http://localhost:3000/api/auth/login
router.post('/login', authController.loginUser);

module.exports = router;