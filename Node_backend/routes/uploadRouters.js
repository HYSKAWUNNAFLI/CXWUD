const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { uploadFile, saveFileContent } = require("../controllers/fileUploadController");

router.post("/", authMiddleware, uploadFile, saveFileContent);

module.exports = router;
