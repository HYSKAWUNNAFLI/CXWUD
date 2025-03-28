const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Task = sequelize.define("Task", {
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
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "TODO"
    }
  });

  return Task;
};
