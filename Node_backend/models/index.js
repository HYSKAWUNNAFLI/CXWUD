const { sequelize } = require("../config/db");
const User = require("./userModel")(sequelize);
const Task = require("./taskModel")(sequelize);
const MeetingLog = require("./meetingLogModel")(sequelize);

// Associations (quan hệ bảng)
User.hasMany(MeetingLog, { foreignKey: "userId" });
MeetingLog.belongsTo(User, { foreignKey: "userId" });

User.hasMany(Task, { foreignKey: "assignedById" });
Task.belongsTo(User, { foreignKey: "assignedById" });

// v.v. tuỳ ý em

module.exports = {
  sequelize,
  User,
  Task,
  MeetingLog
};
