// migrations/xxxx-add-assignee-id.js
module.exports = {
  up: async (qi, Sequelize) => {
    await qi.addColumn("Tasks", "assignee_id", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: "Users", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL"
    });
  },
  down: async (qi) => {
    await qi.removeColumn("Tasks", "assignee_id");
  }
};
