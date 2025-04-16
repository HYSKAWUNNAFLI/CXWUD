const express = require('express');
const router = express.Router();
const meetingLogController = require('../controllers/meetingLogController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Create a new meeting log
router.post('/', meetingLogController.create);

// Get all meeting logs
router.get('/', meetingLogController.getAll);

// Get a specific meeting log
router.get('/:id', meetingLogController.getById);

// Update a meeting log
router.put('/:id', meetingLogController.update);

// Delete a meeting log
router.delete('/:id', meetingLogController.delete);

module.exports = router; 