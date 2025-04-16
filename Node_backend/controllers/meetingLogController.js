const { MeetingLog, Task, User } = require('../models');
const nlpService = require('../services/nlpService');

class MeetingLogController {
    async create(req, res) {
        try {
            const { title, content, file_name } = req.body;
            const user_id = req.user.id;

            // Extract tasks and meeting date using NLP service
            const extractedData = await nlpService.extractTasks(content);

            // Create meeting log
            const meetingLog = await MeetingLog.create({
                title,
                content,
                file_name,
                meeting_date: extractedData.meeting_date,
                created_by: user_id,
                status: 'PENDING'
            });

            // Create tasks from extracted data
            if (extractedData.tasks && extractedData.tasks.length > 0) {
                const tasks = extractedData.tasks.map(task => ({
                    title: task.task_name,
                    description: task.task_name,
                    assignee_id: task.assignee,
                    deadline: task.due_date,
                    priority: 'MEDIUM',
                    status: 'NOT_STARTED',
                    meeting_id: meetingLog.id,
                    created_by: user_id
                }));

                await Task.bulkCreate(tasks);
            }

            res.status(201).json({
                success: true,
                data: meetingLog
            });
        } catch (error) {
            console.error('Error creating meeting log:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to create meeting log'
            });
        }
    }

    async getAll(req, res) {
        try {
            const meetingLogs = await MeetingLog.findAll({
                include: [
                    {
                        model: Task,
                        as: 'tasks',
                        attributes: ['id', 'title', 'status', 'priority', 'deadline'],
                        include: [
                            {
                                model: User,
                                as: 'assignee',
                                attributes: ['id', 'name', 'email']
                            }
                        ]
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
                                as: 'assignee',
                                attributes: ['id', 'name', 'email']
                            },
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
            if (content && content !== meetingLog.content) {
                const extractedData = await nlpService.extractTasks(content);
                
                // Update meeting date if extracted
                if (extractedData.meeting_date) {
                    meetingLog.meeting_date = extractedData.meeting_date;
                }

                // Delete existing tasks
                await Task.destroy({
                    where: { meeting_id: id }
                });

                // Create new tasks
                if (extractedData.tasks && extractedData.tasks.length > 0) {
                    const tasks = extractedData.tasks.map(task => ({
                        title: task.task_name,
                        description: task.task_name,
                        assignee_id: task.assignee,
                        deadline: task.due_date,
                        priority: 'MEDIUM',
                        status: 'NOT_STARTED',
                        meeting_id: id,
                        created_by: meetingLog.created_by
                    }));

                    await Task.bulkCreate(tasks);
                }
            }

            // Update meeting log
            await meetingLog.update({
                title: title || meetingLog.title,
                content: content || meetingLog.content,
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