const express = require('express');
const router = express.Router();
const meetingController = require('../controllers/meetingController');
const authMiddleware = require('../middleware/authMiddleware');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Create new meeting with file upload
router.post('/', meetingController.createMeeting);

// Get all meetings
router.get('/', meetingController.getMeetings);

// Get meeting by ID
router.get('/:id', meetingController.getMeetingById);

module.exports = router; 