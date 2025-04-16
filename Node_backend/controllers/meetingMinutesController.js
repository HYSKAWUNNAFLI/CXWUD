const multer = require("multer");
const path = require("path");
const { MeetingLog, Meeting } = require("../models");
const { parseFileContent } = require("../utils/fileParser");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "public", "uploads", "meeting-minutes"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only text files
  if (file.mimetype === 'text/plain' || file.mimetype === 'application/msword' || 
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    cb(null, true);
  } else {
    cb(new Error('Only text and Word documents are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

exports.uploadMeetingMinutes = upload.single("meetingMinutes");

exports.saveMeetingMinutes = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const filePath = req.file.path;
    const content = await parseFileContent(filePath);

    const meetingLog = await MeetingLog.create({
      file_name: req.file.originalname,
      content: content,
      userId: req.user.id,
      type: 'MEETING_MINUTES',
      meetingId: req.body.meetingId // Optional: link to specific meeting
    });

    res.json({
      message: "Meeting minutes uploaded successfully",
      meetingLog
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      message: "Error uploading meeting minutes",
      error: err.message 
    });
  }
};

exports.getMeetingMinutes = async (req, res) => {
  try {
    const meetingLogs = await MeetingLog.findAll({
      where: {
        type: 'MEETING_MINUTES'
      },
      order: [['createdAt', 'DESC']]
    });

    res.json(meetingLogs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching meeting minutes" });
  }
};

exports.renderMeetingMinutesPage = async (req, res) => {
  try {
    // Get all meetings for the dropdown
    const meetings = await Meeting.findAll({
      order: [['date', 'DESC']]
    });

    // Get recent meeting minutes
    const meetingLogs = await MeetingLog.findAll({
      where: {
        type: 'MEETING_MINUTES'
      },
      order: [['createdAt', 'DESC']],
      limit: 10
    });

    res.render("meeting-minutes", {
      title: "Meeting Minutes",
      meetings: meetings.map(m => m.get({ plain: true })),
      meetingLogs: meetingLogs.map(log => log.get({ plain: true }))
    });
  } catch (err) {
    console.error(err);
    res.status(500).render("error", {
      title: "Error",
      message: "Error loading meeting minutes page"
    });
  }
}; 