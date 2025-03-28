require("dotenv").config();
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const exphbs = require("express-handlebars");
const cookieParser = require("cookie-parser");
const { connectDB, sequelize } = require("./config/db");

// Kết nối DB
connectDB();

// Đồng bộ model
sequelize.sync({ alter: false }).then(() => {
  console.log("✅ Sequelize sync done.");
});

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Setup Handlebars
app.engine("handlebars", exphbs.engine({ defaultLayout: "main", layoutsDir: path.join(__dirname, "views", "layouts") }));
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

// Import routes
const authRouters = require("./routes/authRouters");
const meetingTasksRouters = require("./routes/meetingTasksRouters");
const taskRouters = require("./routes/taskRouters");
const uploadRouters = require("./routes/uploadRouters");
const userRouters = require("./routes/userRouters");

// Sử dụng routes
app.use("/auth", authRouters);
app.use("/meeting-tasks", meetingTasksRouters);
app.use("/tasks", taskRouters);
app.use("/upload", uploadRouters);
app.use("/users", userRouters);

// Trang chủ
app.get("/", (req, res) => {
  res.render("users/dashboard", { username: "TestUser" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
