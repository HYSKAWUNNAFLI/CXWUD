require("dotenv").config(); // Đọc file .env
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 5432,
    dialect: "postgres",
    logging: false, // tắt console log SQL
  }
);

async function connectDB() {
  try {
    await sequelize.authenticate();
    console.log("✅ PostgreSQL connected successfully.");
  } catch (error) {
    console.error("❌ Unable to connect to PostgreSQL:", error);
  }
}

module.exports = { sequelize, connectDB };
