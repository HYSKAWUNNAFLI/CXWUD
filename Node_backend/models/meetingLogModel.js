const { DataTypes } = require("sequelize");
const sequelize = require('../config/db').sequelize;

const MeetingLog = sequelize.define("MeetingLog", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  meeting_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  file_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  file_path: {
    type: DataTypes.STRING,
    allowNull: true
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  summary: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('UPLOADED', 'PROCESSING', 'COMPLETED', 'FAILED'),
    defaultValue: 'UPLOADED'
  },
  processing_error: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'MeetingLogs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

MeetingLog.associate = (models) => {
  MeetingLog.hasMany(models.Task, {
    foreignKey: 'meeting_id',
    as: 'tasks'
  });
  
  MeetingLog.belongsTo(models.User, {
    foreignKey: 'created_by',
    as: 'creator'
  });
};

module.exports = MeetingLog;
