const axios = require("axios");
const trelloConfig = require("../config/trello");

const TRELLO_BASE_URL = "https://api.trello.com/1";

exports.createTrelloCard = async (taskName, assignee, dueDate) => {
  try {
    const { apiKey, token, defaultBoardId, defaultListId } = trelloConfig;
    // TODO: Tìm listId (vd "To Do") => Giả sử defaultListId

    const res = await axios.post(`${TRELLO_BASE_URL}/cards`, null, {
      params: {
        name: taskName,
        desc: `Assigned to ${assignee} - Deadline: ${dueDate}`,
        idList: defaultListId,
        key: apiKey,
        token: token
      }
    });
    return res.data;
  } catch (err) {
    console.error("Error creating Trello card:", err.response?.data || err.message);
    throw err;
  }
};
