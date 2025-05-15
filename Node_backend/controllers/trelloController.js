// controllers/trelloController.js

const trelloService = require('../services/trelloService');
const { MeetingLog, Task } = require("../models")

exports.getBoards = async (req, res) => {
  try {
    const boards = await trelloService.getBoards();

    // ✅ Kiểm tra nếu yêu cầu là JSON (API)
    if (req.headers.accept && req.headers.accept.includes("application/json")) {
      return res.status(200).json({
        success: true,
        data: boards
      });
    }

    // ✅ Render HTML cho các yêu cầu từ trình duyệt
    res.render("trello/index", {
      title: "Trello Boards",
      boards: boards
    });

  } catch (error) {
    console.error("Error getting Trello boards:", error);
    res.status(500).render("error", {
      title: "Error",
      message: "Failed to fetch Trello boards"
    });
  }
};




// ✅ Lấy danh sách list trong board

exports.getListsInBoard = async (req, res) => {
  try {
    const lists = await trelloService.getListsInBoard(req.params.boardId);

    // Kiểm tra nếu yêu cầu là JSON (API)
    if (req.headers.accept && req.headers.accept.includes("application/json")) {
      return res.status(200).json({
        success: true,
        data: lists
      });
    }

    // ✅ Render template nếu yêu cầu từ trình duyệt
    res.render("trello/lists", {
      title: "Trello Lists",
      lists: lists,
      board: { name: `Board ID: ${req.params.boardId}` } // Thêm thông tin board nếu cần
    });

  } catch (error) {
    console.error("Error getting Trello lists:", error);
    res.status(500).render("error", {
      title: "Error",
      message: "Failed to fetch Trello lists"
    });
  }
};


// ✅ Tạo task (card) mới
exports.createCard = async (req, res) => {
  try {
    const { title, description, deadline } = req.body;
    const card = await trelloService.createCard(req.params.listId, title, description, deadline);
    res.status(201).json({
      success: true,
      data: card
    });
  } catch (error) {
    console.error('Error creating Trello card:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create Trello card',
      error: error.message,
    });
  }
};
// ✅ Lấy danh sách cards trong list
exports.getCardsInList = async (req, res) => {
  try {
    const cards = await trelloService.getCardsInList(req.params.listId);

    // Kiểm tra nếu yêu cầu là JSON (API)
    if (req.headers.accept && req.headers.accept.includes("application/json")) {
      return res.status(200).json({
        success: true,
        data: cards
      });
    }

    // ✅ Render template nếu yêu cầu từ trình duyệt
    res.render("trello/cards", {
      title: "Trello Cards",
      cards: cards,
      list: { name: `List ID: ${req.params.listId}` }
    });

  } catch (error) {
    console.error("Error getting Trello cards:", error);
    res.status(500).render("error", {
      title: "Error",
      message: "Failed to fetch Trello cards"
    });
  }
};


