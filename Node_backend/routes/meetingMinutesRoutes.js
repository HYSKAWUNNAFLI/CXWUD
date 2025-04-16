const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { 
  uploadMeetingMinutes, 
  saveMeetingMinutes,
  getMeetingMinutes,
  renderMeetingMinutesPage
} = require("../controllers/meetingMinutesController");

// Render meeting minutes page
router.get("/", authMiddleware, renderMeetingMinutesPage);

// Upload meeting minutes
router.post("/upload", authMiddleware, uploadMeetingMinutes, saveMeetingMinutes);

// Get all meeting minutes
router.get("/list", authMiddleware, getMeetingMinutes);

module.exports = router; 