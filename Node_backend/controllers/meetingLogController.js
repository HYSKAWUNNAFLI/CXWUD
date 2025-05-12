const { MeetingLog, Task, User } = require('../models');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const multer = require('multer');
const axios = require('axios');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const geminiService = require('../services/geminiService');



// Multer setup
const upload = multer({ dest: 'uploads/' });

async function extractTextFromFile(filePath, mimetype) {
    if (mimetype === 'application/pdf') {
      const data = await readFile(filePath);
      const pdf = await pdfParse(data);
      return pdf.text;
    }
  
    if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const data = await readFile(filePath);
      const result = await mammoth.extractRawText({ buffer: data });
      return result.value;
    }
  
    if (mimetype === 'text/plain') {
      return await readFile(filePath, 'utf-8');
    }
  
    throw new Error('Unsupported file type');
  }
// Read file content depending on type
async function extractTextFromFile(filePath, mimetype) {
  if (mimetype === 'application/pdf') {
    const data = await readFile(filePath);
    const pdf = await pdfParse(data);
    return pdf.text;
  }

  if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const data = await readFile(filePath);
    const result = await mammoth.extractRawText({ buffer: data });
    return result.value;
  }

  if (mimetype === 'text/plain') {
    const data = await readFile(filePath, 'utf-8');
    return data;
  }

  throw new Error('Unsupported file format');
}
function determinePriority(taskName = '') {
    const lower = taskName.toLowerCase();
    if (lower.includes('urgent') || lower.includes('critical')) return 'HIGH';
    if (lower.includes('important') || lower.includes('optimize')) return 'MEDIUM';
    return 'LOW';
  }
  

class MeetingLogController {
    uploadMiddleware = upload.single('meeting_file'); // thêm ở trong class
    async create(req, res) {
        try {
          const { title, content } = req.body;
          const user_id = req.user.id;
      
          let text = content;
          if (!text && req.file) {
            text = await extractTextFromFile(req.file.path, req.file.mimetype);
          }
      
          if (!text || !title) {
            return res.status(400).json({ message: 'Thiếu tiêu đề hoặc nội dung cuộc họp' });
          }
      
          // ✅ Gọi Gemini để trích xuất
          const { summary, tasks } = await geminiService.callGemini(text);
      
          // ✅ Tạo meeting log
          const log = await MeetingLog.create({
            title,
            content: text,
            file_name: req.file?.originalname || null,
            meeting_date: new Date(),
            created_by: user_id,
            status: 'PENDING'
          });
      
          // ✅ Ghi tasks vào DB nếu có
          if (tasks?.length > 0) {
            const formattedTasks = tasks.map(t => ({
              title: t.task_name,
              description: t.task_name,
              assignee_name: t.assignee_name || t.assignee || 'Unassigned',
              deadline: t.deadline || null,
              priority: t.priority || 'MEDIUM',
              status: 'NOT_STARTED',
              meeting_id: log.id,
              created_by: user_id
            }));
      
            await Task.bulkCreate(formattedTasks);
          }
      
          res.redirect('/meetings');
      
        } catch (err) {
          console.error('❌ Error creating meeting log:', err);
          res.status(500).render('error', { title: 'Lỗi', message: 'Không thể xử lý nội dung' });
        }
      }
      
      
    async getAll(req, res) {
        try {
            const meetingLogs = await MeetingLog.findAll({
                include: [
                    {
                        model: Task,
                        as: 'tasks',
                        attributes: ['id', 'title', 'status', 'priority', 'deadline','assignee_name'],
                        
                        
                    },
                    {
                        model: User,
                        as: 'creator',
                        attributes: ['id', 'name', 'email']
                    }
                ],
                order: [['meeting_date', 'DESC']]
            });

            // Convert to plain objects
            const plainMeetingLogs = meetingLogs.map(meeting => meeting.get({ plain: true }));

            // Check if the request is expecting JSON (API call)
            if (req.headers.accept && req.headers.accept.includes('application/json')) {
                return res.json({
                    success: true,
                    data: plainMeetingLogs
                });
            }

            // Render the Handlebars template
            res.render('meetings/index', {
                title: 'Meetings',
                meetings: plainMeetingLogs
            });
        } catch (error) {
            console.error('Error getting meeting logs:', error);
            
            // Check if the request is expecting JSON (API call)
            if (req.headers.accept && req.headers.accept.includes('application/json')) {
                return res.status(500).json({
                    success: false,
                    error: 'Failed to get meeting logs'
                });
            }
            
            // Render the Handlebars template with error
            res.render('meetings/index', {
                title: 'Meetings',
                error: 'Failed to load meetings'
            });
        }
    }

    async getById(req, res) {
        try {
            const meetingLog = await MeetingLog.findByPk(req.params.id, {
                include: [
                    {
                        model: Task,
                        as: 'tasks',
                        attributes: ['id', 'title', 'description', 'status', 'priority', 'deadline', 'created_at'],
                        include: [
                            
                            {
                                model: User,
                                as: 'creator',
                                attributes: ['id', 'name', 'email']
                            }
                        ]
                    },
                    {
                        model: User,
                        as: 'creator',
                        attributes: ['id', 'name', 'email']
                    }
                ]
            });

            if (!meetingLog) {
                // Check if the request is expecting JSON (API call)
                if (req.headers.accept && req.headers.accept.includes('application/json')) {
                    return res.status(404).json({
                        success: false,
                        error: 'Meeting log not found'
                    });
                }
                
                // Render the Handlebars template with error
                return res.render('error', {
                    title: 'Meeting Not Found',
                    message: 'The requested meeting could not be found'
                });
            }

            // Get all users for the assignee dropdown
            const users = await User.findAll({
                attributes: ['id', 'name', 'email']
            });

            // Convert to plain objects
            const plainMeetingLog = meetingLog.get({ plain: true });
            const plainUsers = users.map(user => user.get({ plain: true }));

            // Check if the request is expecting JSON (API call)
            if (req.headers.accept && req.headers.accept.includes('application/json')) {
                return res.json({
                    success: true,
                    data: plainMeetingLog
                });
            }

            // Render the Handlebars template
            res.render('meetings/show', {
                title: plainMeetingLog.title,
                meeting: plainMeetingLog,
                users: plainUsers
            });
        } catch (error) {
            console.error('Error getting meeting log:', error);
            
            // Check if the request is expecting JSON (API call)
            if (req.headers.accept && req.headers.accept.includes('application/json')) {
                return res.status(500).json({
                    success: false,
                    error: 'Failed to get meeting log'
                });
            }
            
            // Render the Handlebars template with error
            res.render('error', {
                title: 'Error',
                message: 'Failed to load meeting'
            });
        }
    }

    async update(req, res) {
        try {
            const { id } = req.params;
            const { title, content, status } = req.body;

            const meetingLog = await MeetingLog.findByPk(id);
            if (!meetingLog) {
                return res.status(404).json({
                    success: false,
                    error: 'Meeting log not found'
                });
            }

            // If content is updated, re-extract tasks
            let newContent = content || meetingLog.content;
            let tasks = [];
            
            if (content && content !== meetingLog.content) {
              const extracted = await geminiService.callGemini(content);
              tasks = extracted.tasks || [];
            
              await Task.destroy({ where: { meeting_id: id } });
            
              const users = await User.findAll({ attributes: ['id', 'name'] });
            
              const newTasks = tasks.map(t => {
                const matchedUser = users.find(
                  u => u.name.toLowerCase() === (t.assignee || '').toLowerCase()
                );
                return {
                  title: t.task_name,
                  description: t.task_name,
                  deadline: t.deadline || null,
                  priority: t.priority || determinePriority(t.task_name),
                  status: t.status === 'TODO' ? 'NOT_STARTED' : (t.status || 'NOT_STARTED'),
                  assignee_name: matchedUser ? matchedUser.id : null,
                  meeting_id: id,
                  created_by: meetingLog.created_by
                };
              });
            
              await Task.bulkCreate(newTasks);
            }
            

            // Update meeting log
            await meetingLog.update({
                title: title || meetingLog.title,
                content: newContent,
                status: status || meetingLog.status
              });
              

            res.json({
                success: true,
                data: meetingLog
            });
        } catch (error) {
            console.error('Error updating meeting log:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to update meeting log'
            });
        }
    }

    async delete(req, res) {
        try {
            const { id } = req.params;
            const meetingLog = await MeetingLog.findByPk(id);

            if (!meetingLog) {
                return res.status(404).json({
                    success: false,
                    error: 'Meeting log not found'
                });
            }

            // Delete associated tasks first
            await Task.destroy({
                where: { meeting_id: id }
            });

            // Delete meeting log
            await meetingLog.destroy();

            res.json({
                success: true,
                message: 'Meeting log deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting meeting log:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to delete meeting log'
            });
        }
    }

    async getAllMeetingLogs(req, res) {
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
    }

    async getMeetingLogById(req, res) {
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
    }

    async createMeetingLog(req, res) {
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
    }

    async updateMeetingLog(req, res) {
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
    }

    async deleteMeetingLog(req, res) {
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
    }
}

module.exports = new MeetingLogController(); 