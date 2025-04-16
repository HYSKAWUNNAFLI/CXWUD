const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Create a new task
router.post('/', taskController.create);

// Get all tasks
router.get('/', taskController.getAll);

// Get tasks by meeting
router.get('/meeting/:meeting_id', taskController.getByMeeting);

// Get a specific task
router.get('/:id', taskController.getById);

// Update a task
router.put('/:id', taskController.update);

// Delete a task
router.delete('/:id', taskController.delete);

module.exports = router; 