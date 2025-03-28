const multer = require("multer");
const path = require("path");
const { MeetingLog } = require("../models");
const { parseFileContent } = require("../utils/fileParser");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "public", "uploads"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  }
});

const upload = multer({ storage });

exports.uploadFile = upload.single("meetingFile");

exports.saveFileContent = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const filePath = req.file.path;
    const content = await parseFileContent(filePath);
    // Lưu log
    const meetingLog = await MeetingLog.create({
      file_name: req.file.originalname,
      content: content,
      userId: req.user.id // Ai upload
    });
    res.json({
      message: "File uploaded & content saved",
      meetingLog
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error uploading file" });
  }
};
