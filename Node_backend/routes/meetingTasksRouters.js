const express = require("express");
const router = express.Router();
const { analyzeMeeting } = require("../controllers/meetingTasksController");

// GET form
router.get("/", (req, res) => {
  res.render("users/meeting_tasks");
});

// POST text -> NLP
router.post("/", analyzeMeeting);

module.exports = router;
