const express = require('express');
const router = express.Router();

const taskController = require('../controllers/taskController');

// Route lấy danh sách tasks
router.get('/', taskController.getAllTasks);

// Route tạo task mới
router.post('/', taskController.createTask);

module.exports = router;
