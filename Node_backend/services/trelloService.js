// services/trelloService.js
const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.TRELLO_API_KEY?.trim();
const API_TOKEN = process.env.TRELLO_API_TOKEN?.trim();
const BASE_URL = 'https://api.trello.com/1';

if (!API_KEY || !API_TOKEN) {
  console.error('❌ Missing TRELLO_API_KEY or TRELLO_API_TOKEN in .env');
  throw new Error('❌ Missing TRELLO_API_KEY or TRELLO_API_TOKEN in .env');
}

/**
 * Gửi request tới Trello API
 * @param {string} method - Phương thức HTTP (GET, POST, PUT, DELETE)
 * @param {string} endpoint - Đường dẫn endpoint của Trello API
 * @param {object} [data={}] - Dữ liệu gửi lên (body hoặc query)
 * @param {object} [config={}] - Cấu hình Axios bổ sung
 * @returns {Promise<any>} - Kết quả từ Trello API
 */
const trelloRequest = async (method, endpoint, data = {}, config = {}) => {
  const url = `${BASE_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}key=${API_KEY}&token=${API_TOKEN}`;
  try {
    const response = await axios({
      method,
      url,
      timeout: 15000,
      ...(method === 'get' ? { params: data } : { data }),
      ...config
    });
    return response.data;
  } catch (error) {
    console.error(`❌ Trello API ${method.toUpperCase()} ${endpoint} error:`, error.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.message || 'Trello API error');
  }
};

// -----------------------------------------------------------------------------
//  Boards
// -----------------------------------------------------------------------------
exports.getBoards = async () => {
  return trelloRequest('get', '/members/me/boards');
};

exports.createBoard = async (name, opts = { defaultLists: false }) => {
  if (!name) throw new Error('❌ Board name is required');
  return trelloRequest('post', '/boards', { name, ...opts });
};

// -----------------------------------------------------------------------------
//  Lists
// -----------------------------------------------------------------------------
exports.getListsInBoard = async (boardId) => {
  if (!boardId) throw new Error('❌ Board ID is required');
  return trelloRequest('get', `/boards/${boardId}/lists`);
};

exports.createList = async (boardId, name) => {
  if (!boardId || !name) throw new Error('❌ Board ID và List name là bắt buộc');
  return trelloRequest('post', `/boards/${boardId}/lists`, { name });
};

// -----------------------------------------------------------------------------
//  Cards
// -----------------------------------------------------------------------------
exports.getCardsInList = async (listId) => {
  if (!listId) throw new Error('❌ List ID là bắt buộc');
  return trelloRequest('get', `/lists/${listId}/cards`);
};

exports.createCard = async (listId, title, description = '', deadline = null) => {
  if (!listId || !title) throw new Error('❌ List ID và Card name là bắt buộc');
  return trelloRequest('post', '/cards', {
    idList: listId,
    name: title,
    desc: description,
    due: deadline
  });
};

exports.updateCard = async (cardId, fields) => {
  if (!cardId) throw new Error('❌ Card ID là bắt buộc');
  return trelloRequest('put', `/cards/${cardId}`, fields);
};

exports.archiveCard = async (cardId) => {
  if (!cardId) throw new Error('❌ Card ID là bắt buộc');
  return trelloRequest('put', `/cards/${cardId}/closed`, { value: true });
};
