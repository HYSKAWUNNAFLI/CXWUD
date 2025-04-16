const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { PROJECT_MANAGER } = require('../config/role');
const { User } = require('../models');

// View routes
router.get('/login', authController.getLoginPage);
router.get('/register', authController.getRegisterPage);

// API routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);

// Protected routes
router.get('/profile', authMiddleware, authController.getProfile);

// Project Manager routes
router.get('/admin/users', authMiddleware, authorizeRoles([PROJECT_MANAGER]), async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'name', 'email', 'role', 'created_at']
        });

        res.json({
            success: true,
            data: users
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get users'
        });
    }
});

module.exports = router; 