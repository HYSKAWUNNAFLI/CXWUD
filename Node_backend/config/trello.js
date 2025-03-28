require("dotenv").config();

module.exports = {
  apiKey: process.env.TRELLO_API_KEY,
  token: process.env.TRELLO_TOKEN,
  // Em có thể định nghĩa sẵn boardId, listId ở đây
  // Hoặc dynamic => do user config
  defaultBoardId: "BOARD_ID_FROM_TRELLO",
  defaultListId: "LIST_ID_FROM_TRELLO"
};
