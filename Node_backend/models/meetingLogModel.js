const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const MeetingLog = sequelize.define("MeetingLog", {
    file_name: DataTypes.STRING,
    content: DataTypes.TEXT,  // lưu nội dung text trích ra
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  });

  return MeetingLog;
};
