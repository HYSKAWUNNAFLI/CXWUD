const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const meetingLogController = require('../controllers/meetingLogController');

// All routes require authentication
router.use(authMiddleware);
router.post('/', meetingLogController.uploadMiddleware, meetingLogController.create);



// Get all meeting logs
router.get('/', meetingLogController.getAll);

// Get a specific meeting log
router.get('/:id', meetingLogController.getById);

// Update a meeting log
router.put('/:id', meetingLogController.update);

// Delete a meeting log
router.delete('/:id', meetingLogController.delete);

module.exports = router; 