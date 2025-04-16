const { MeetingLog, Task, User } = require('../models');
const nlpService = require('../services/nlpService');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/meetings');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.txt', '.doc', '.docx', '.pdf'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
}).single('meeting_file');

class MeetingController {
  async createMeeting(req, res) {
    try {
      upload(req, res, async (err) => {
        if (err) {
          return res.status(400).json({ error: err.message });
        }

        if (!req.file) {
          return res.status(400).json({ error: 'No file uploaded' });
        }

        // Read file content
        const content = await fs.readFile(req.file.path, 'utf8');

        // Process content with NLP service
        const processedData = await nlpService.processMeetingContent(content);

        // Create meeting log
        const meeting = await MeetingLog.create({
          title: req.body.title || 'Untitled Meeting',
          meeting_date: processedData.meetingDate || new Date(),
          file_name: req.file.filename,
          content: content,
          status: 'PROCESSING',
          created_by: req.user.id
        });

        // Create tasks
        const tasks = await Promise.all(
          processedData.tasks.map(task =>
            Task.create({
              ...task,
              meeting_id: meeting.id
            })
          )
        );

        // Update meeting status
        await meeting.update({ status: 'COMPLETED' });

        res.json({
          success: true,
          meeting,
          tasks
        });
      });
    } catch (error) {
      console.error('Error creating meeting:', error);
      res.status(500).json({ error: 'Failed to create meeting' });
    }
  }

  async getMeetings(req, res) {
    try {
      const meetings = await MeetingLog.findAll({
        include: [{
          model: Task,
          as: 'tasks'
        }, {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'email']
        }],
        order: [['meeting_date', 'DESC']]
      });

      res.json(meetings);
    } catch (error) {
      console.error('Error fetching meetings:', error);
      res.status(500).json({ error: 'Failed to fetch meetings' });
    }
  }

  async getMeetingById(req, res) {
    try {
      const meeting = await MeetingLog.findByPk(req.params.id, {
        include: [{
          model: Task,
          as: 'tasks'
        }, {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'email']
        }]
      });

      if (!meeting) {
        return res.status(404).json({ error: 'Meeting not found' });
      }

      res.json(meeting);
    } catch (error) {
      console.error('Error fetching meeting:', error);
      res.status(500).json({ error: 'Failed to fetch meeting' });
    }
  }
}

module.exports = new MeetingController(); 