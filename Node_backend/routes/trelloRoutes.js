// routes/trelloRoutes.js
const express = require('express');
const router = express.Router();
const trelloController = require('../controllers/trelloController');

// ✅ Route gốc trả về danh sách board
router.get('/', trelloController.getBoards);

// ✅ Lấy danh sách boards
router.get('/boards', trelloController.getBoards);

// ✅ Lấy danh sách list trong board
router.get('/boards/:boardId/lists', trelloController.getListsInBoard);

// ✅ Lấy danh sách cards trong list
router.get('/lists/:listId/cards', trelloController.getCardsInList);

// ✅ Tạo card mới
router.post('/lists/:listId/cards', trelloController.createCard);


module.exports = router;
