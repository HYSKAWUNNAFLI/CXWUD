const { DataTypes } = require('sequelize');
const { sequelize } = require('./db');

const Task = sequelize.define('Task', {
  task_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  assignee: {
    type: DataTypes.STRING,
    allowNull: true
  },
  deadline: {
    type: DataTypes.DATE,
    allowNull: true
  }
});

module.exports = Task;
