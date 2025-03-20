const Task = require('../models/Task');

const createTask = async (req, res) => {
  try {
    const { task_name, assignee, deadline } = req.body;
    const newTask = await Task.create({ task_name, assignee, deadline });
    return res.status(201).json(newTask);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Create task failed' });
  }
};

const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.findAll();
    return res.json(tasks);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Fetch tasks failed' });
  }
};

module.exports = { createTask, getAllTasks };
