// models/index.js
const { sequelize } = require("../config/db");
const User = require("./userModel");
const Task = require("./taskModel");
const MeetingLog = require("./meetingLogModel");

// Initialize associations
const models = {
  User,
  Task,
  MeetingLog
};

// Call associate methods if they exist
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

// Export models
module.exports = {
  sequelize,
  User,
  Task,
  MeetingLog,
};
