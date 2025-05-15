const { DataTypes } = require('sequelize');
const sequelize = require('../config/db').sequelize;

const Task = sequelize.define('Task', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    assignee_name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    deadline: {
        type: DataTypes.DATE,
        allowNull: true
    },
    priority: {
        type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH'),
        defaultValue: 'MEDIUM'
    },
    status: {
        type: DataTypes.ENUM('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'TODO'),
        defaultValue: 'NOT_STARTED'
    },
    meeting_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'MeetingLogs',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    trello_card_id: {
        type: DataTypes.STRING,
        allowNull: true
    },
    trello_list_id: {
        type: DataTypes.STRING,
        allowNull: true
    },
    last_synced_with_trello: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'Tasks',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

// 🔗 Associations
Task.associate = (models) => {
    Task.belongsTo(models.MeetingLog, {
        foreignKey: 'meeting_id',
        as: 'meetingLog'
    });

    Task.belongsTo(models.User, {
        foreignKey: 'created_by',
        as: 'creator'
    });

    Task.belongsTo(models.User, {
        foreignKey: 'assignee_name',
        targetKey: 'name',
        as: 'assignee'
    });
};

module.exports = Task;
