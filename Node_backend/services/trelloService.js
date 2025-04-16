const axios = require('axios');

class TrelloService {
    constructor() {
        this.apiKey = process.env.TRELLO_API_KEY;
        this.token = process.env.TRELLO_TOKEN;
        this.baseUrl = 'https://api.trello.com/1';
    }

    async createCard(task) {
        try {
            const response = await axios.post(`${this.baseUrl}/cards`, {
                key: this.apiKey,
                token: this.token,
                idList: task.trello_list_id,
                name: task.title,
                desc: task.description,
                due: task.deadline ? new Date(task.deadline).toISOString() : null
            });

            return response.data;
        } catch (error) {
            console.error('Error creating Trello card:', error);
            throw new Error('Failed to create Trello card');
        }
    }

    async updateCard(task) {
        try {
            const response = await axios.put(`${this.baseUrl}/cards/${task.trello_card_id}`, {
                key: this.apiKey,
                token: this.token,
                name: task.title,
                desc: task.description,
                due: task.deadline ? new Date(task.deadline).toISOString() : null,
                idList: task.trello_list_id
            });

            return response.data;
        } catch (error) {
            console.error('Error updating Trello card:', error);
            throw new Error('Failed to update Trello card');
        }
    }

    async deleteCard(cardId) {
        try {
            await axios.delete(`${this.baseUrl}/cards/${cardId}`, {
                params: {
                    key: this.apiKey,
                    token: this.token
                }
            });
        } catch (error) {
            console.error('Error deleting Trello card:', error);
            throw new Error('Failed to delete Trello card');
        }
    }

    async getBoards() {
        try {
            const response = await axios.get(`${this.baseUrl}/members/me/boards`, {
                params: {
                    key: this.apiKey,
                    token: this.token
                }
            });

            return response.data;
        } catch (error) {
            console.error('Error getting Trello boards:', error);
            throw new Error('Failed to get Trello boards');
        }
    }

    async getLists(boardId) {
        try {
            const response = await axios.get(`${this.baseUrl}/boards/${boardId}/lists`, {
                params: {
                    key: this.apiKey,
                    token: this.token
                }
            });

            return response.data;
        } catch (error) {
            console.error('Error getting Trello lists:', error);
            throw new Error('Failed to get Trello lists');
        }
    }
}

module.exports = new TrelloService(); 