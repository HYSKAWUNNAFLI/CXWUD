const axios = require('axios');

class NLPService {
  constructor() {
    this.pythonServiceUrl = process.env.PYTHON_SERVICE_URL || 'http://localhost:5000';
  }

  async extractTasks(text) {
    try {
      const response = await axios.post(`${this.pythonServiceUrl}/api/extract-tasks`, {
        text: text
      });

      return response.data;
    } catch (error) {
      console.error('Error extracting tasks:', error);
      throw new Error('Failed to extract tasks from text');
    }
  }

  async extractDates(text) {
    try {
      const response = await axios.post(`${this.pythonServiceUrl}/api/extract-dates`, {
        text: text
      });

      return response.data;
    } catch (error) {
      console.error('Error extracting dates:', error);
      throw new Error('Failed to extract dates from text');
    }
  }

  async extractAssignees(text) {
    try {
      const response = await axios.post(`${this.pythonServiceUrl}/api/extract-assignees`, {
        text: text
      });

      return response.data;
    } catch (error) {
      console.error('Error extracting assignees:', error);
      throw new Error('Failed to extract assignees from text');
    }
  }

  async processMeetingContent(content) {
    try {
      const extractedData = await this.extractTasks(content);
      return {
        meetingDate: extractedData.meeting_date,
        tasks: extractedData.tasks.map(task => ({
          task_name: task.task_name,
          assignee: task.assignee,
          deadline: task.due_date,
          priority: this.determinePriority(task.task_name),
          description: task.task_name // Using task name as description for now
        }))
      };
    } catch (error) {
      console.error('Error processing meeting content:', error);
      throw error;
    }
  }

  determinePriority(taskName) {
    const lowerTaskName = taskName.toLowerCase();
    if (lowerTaskName.includes('urgent') || lowerTaskName.includes('critical')) {
      return 'HIGH';
    } else if (lowerTaskName.includes('important')) {
      return 'MEDIUM';
    }
    return 'LOW';
  }
}

module.exports = new NLPService(); 