const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');

router.get('/', profileController.getUserProfile);
router.put('/settings', profileController.updateAccountSettings);
router.put('/security', profileController.updateSecuritySettings);
router.get('/faq', profileController.getHelpCenterFAQs);

module.exports = router;