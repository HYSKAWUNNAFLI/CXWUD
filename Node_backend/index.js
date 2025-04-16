require("dotenv").config();
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const exphbs = require("express-handlebars");
const cookieParser = require("cookie-parser");
const { connectDB, sequelize } = require("./config/db");
const handlebarsHelpers = require("./utils/handlebarsHelpers");
const authMiddleware = require("./middleware/authMiddleware");
const localsMiddleware = require("./middleware/localsMiddleware");

// Connect to database
connectDB();

// Sync models
sequelize.sync({ alter: false }).then(() => {
  console.log("✅ Sequelize sync done.");
});

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(localsMiddleware);

// Setup Handlebars
app.engine("handlebars", exphbs.engine({ 
  defaultLayout: "main", 
  layoutsDir: path.join(__dirname, "views", "layouts"),
  helpers: handlebarsHelpers,
  runtimeOptions: {//hhhhh
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true
  }
}));
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

// Import routes
const authRoutes = require("./routes/authRoutes");
const meetingLogRoutes = require("./routes/meetingLogRoutes");
const taskRoutes = require("./routes/taskRoutes");
const uploadRouters = require("./routes/uploadRouters");
const userRouters = require("./routes/userRouters");
const legalRouters = require("./routes/legalRouters");
const meetingMinutesRoutes = require("./routes/meetingMinutesRoutes");

// Public routes
app.use("/auth", authRoutes);
app.use("/", legalRouters);

// Protected routes
app.use("/meetings", authMiddleware, meetingLogRoutes);
app.use("/tasks", authMiddleware, taskRoutes);
app.use("/upload", authMiddleware, uploadRouters);
app.use("/users", authMiddleware, userRouters);
app.use("/meeting-minutes", authMiddleware, meetingMinutesRoutes);

// Main route
app.get("/", async (req, res) => {
  try {
    // Get user data if logged in
    let user = null;
    if (req.cookies.token) {
      const jwt = require("jsonwebtoken");
      const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET || "your-secret-key");
      const { User } = require("./models");
      user = await User.findByPk(decoded.id);
    }

    // Get recent meetings and tasks if user is logged in
    let recentMeetings = [];
    let recentTasks = [];
    if (user) {
      const { MeetingLog, Task } = require("./models");
      recentMeetings = await MeetingLog.findAll({
        where: { created_by: user.id },
        order: [["created_at", "DESC"]],
        limit: 5
      });
      recentTasks = await Task.findAll({
        where: { created_by: user.id },
        order: [["created_at", "DESC"]],
        limit: 5
      });

      // Convert to plain objects
      recentMeetings = recentMeetings.map(m => m.get({ plain: true }));
      recentTasks = recentTasks.map(t => t.get({ plain: true }));
    }

    res.render("home", {
      title: "Meeting Minutes Auto Generator",
      user: user ? user.get({ plain: true }) : null,
      recentMeetings,
      recentTasks
    });
  } catch (error) {
    console.error("Home route error:", error);
    res.render("home", {
      title: "Meeting Minutes Auto Generator",
      error: "An error occurred while loading the page"
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render("error", {
    title: "Error",
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err : {}
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
