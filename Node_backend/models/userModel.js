const { DataTypes } = require("sequelize");
const sequelize = require('../config/db').sequelize;
const crypto = require('crypto');

const User = sequelize.define("User", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('PROJECT_MANAGER', 'TEAM_MEMBER'),
    defaultValue: 'TEAM_MEMBER'
  },
  can_upload_minutes: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'Users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = crypto.createHash('md5').update(user.password).digest('hex');
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = crypto.createHash('md5').update(user.password).digest('hex');
      }
    }
  }
});

// Instance method to check password
User.prototype.checkPassword = async function(password) {
  const hashedPassword = crypto.createHash('md5').update(password).digest('hex');
  return hashedPassword === this.password;
};

// 🔗 Associations
User.associate = (models) => {
  User.hasMany(models.MeetingLog, {
    foreignKey: 'created_by',
    as: 'meetingLogs',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  });
  
  User.hasMany(models.Task, {
    foreignKey: 'created_by',
    as: 'createdTasks',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  });
  
  User.hasMany(models.Task, {
    foreignKey: 'assignee_name',
    sourceKey: 'name',  // Liên kết với 'name' thay vì 'id'
    as: 'assignedTasks',
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  });
};

module.exports = User;
