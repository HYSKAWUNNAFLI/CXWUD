const express = require('express');
const router = express.Router();

const taskRoutes = require('./taskRoutes');  // Đường dẫn phải chính xác

router.get('/', (req, res) => {
  res.json({ message: 'Welcome to API' });
});

router.use('/tasks', taskRoutes);  // Gọi taskRoutes

module.exports = router;
