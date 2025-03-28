const { Task } = require("../models");

exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.findAll();
    // Nếu render view:
    res.render("users/task_list", { tasks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching tasks" });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { task_name, assignee, deadline, status } = req.body;
    const task = await Task.findByPk(id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    await task.update({ task_name, assignee, deadline, status });
    res.json({ message: "Task updated", task });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating task" });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findByPk(id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    await task.destroy();
    res.json({ message: "Task deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting task" });
  }
};
