const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// All routes here require authentication and Admin role
router.use(authMiddleware);
router.use(adminMiddleware);

router.post('/create', adminController.createAdmin);

module.exports = router;
