const { DataTypes } = require("sequelize");
const { ADMIN, MANAGER, MEMBER } = require("../config/role");

module.exports = (sequelize) => {
  const User = sequelize.define("User", {
    username: {
      type: DataTypes.STRING,
      unique: true
    },
    password: DataTypes.STRING,
    role: {
      type: DataTypes.STRING,
      defaultValue: MEMBER
    },
    // Thông tin cá nhân
    email: DataTypes.STRING
  });

  return User;
};
