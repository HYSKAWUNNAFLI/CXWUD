const { MeetingLog, User, Task } = require('../models');

// Get all meeting logs with related data
exports.getAllMeetingLogs = async (req, res) => {
  try {
    const meetingLogs = await MeetingLog.findAll({
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Task,
          as: 'tasks',
          attributes: ['id', 'title', 'status', 'priority'],
          include: [
            {
              model: User,
              as: 'assignee',
              attributes: ['id', 'name', 'email']
            }
          ]
        }
      ],
      order: [['meeting_date', 'DESC']]
    });
    
    res.status(200).json({
      success: true,
      count: meetingLogs.length,
      data: meetingLogs
    });
  } catch (error) {
    console.error('Error fetching meeting logs:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get a single meeting log by ID with related data
exports.getMeetingLogById = async (req, res) => {
  try {
    const meetingLog = await MeetingLog.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email', 'role']
        },
        {
          model: Task,
          as: 'tasks',
          include: [
            {
              model: User,
              as: 'assignee',
              attributes: ['id', 'name', 'email', 'role']
            },
            {
              model: User,
              as: 'creator',
              attributes: ['id', 'name', 'email', 'role']
            }
          ]
        }
      ]
    });
    
    if (!meetingLog) {
      return res.status(404).json({
        success: false,
        message: 'Meeting log not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: meetingLog
    });
  } catch (error) {
    console.error('Error fetching meeting log:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Create a new meeting log
exports.createMeetingLog = async (req, res) => {
  try {
    const { title, meeting_date, content, summary } = req.body;
    
    // Validate required fields
    if (!title || !meeting_date || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title, meeting_date, and content are required'
      });
    }
    
    // Check if user has permission to create meeting logs
    if (!req.user.can_upload_minutes) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to create meeting logs'
      });
    }
    
    // Create the meeting log
    const meetingLog = await MeetingLog.create({
      title,
      meeting_date,
      content,
      summary,
      status: 'UPLOADED',
      created_by: req.user.id // Assuming user is authenticated and req.user contains the user info
    });
    
    res.status(201).json({
      success: true,
      data: meetingLog
    });
  } catch (error) {
    console.error('Error creating meeting log:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update a meeting log
exports.updateMeetingLog = async (req, res) => {
  try {
    const { title, meeting_date, content, summary, status } = req.body;
    
    // Find the meeting log
    const meetingLog = await MeetingLog.findByPk(req.params.id);
    
    if (!meetingLog) {
      return res.status(404).json({
        success: false,
        message: 'Meeting log not found'
      });
    }
    
    // Check if user has permission to update this meeting log
    if (meetingLog.created_by !== req.user.id && req.user.role !== 'PROJECT_MANAGER') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this meeting log'
      });
    }
    
    // Update the meeting log
    await meetingLog.update({
      title: title || meetingLog.title,
      meeting_date: meeting_date || meetingLog.meeting_date,
      content: content || meetingLog.content,
      summary: summary || meetingLog.summary,
      status: status || meetingLog.status
    });
    
    res.status(200).json({
      success: true,
      data: meetingLog
    });
  } catch (error) {
    console.error('Error updating meeting log:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Delete a meeting log
exports.deleteMeetingLog = async (req, res) => {
  try {
    // Find the meeting log
    const meetingLog = await MeetingLog.findByPk(req.params.id);
    
    if (!meetingLog) {
      return res.status(404).json({
        success: false,
        message: 'Meeting log not found'
      });
    }
    
    // Check if user has permission to delete this meeting log
    if (meetingLog.created_by !== req.user.id && req.user.role !== 'PROJECT_MANAGER') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this meeting log'
      });
    }
    
    // Delete the meeting log
    await meetingLog.destroy();
    
    res.status(200).json({
      success: true,
      message: 'Meeting log deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting meeting log:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}; 