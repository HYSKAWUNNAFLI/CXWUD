const { Task, User, MeetingLog } = require('../models');

class TaskController {
    async create(req, res) {
        try {
            const { task_name, description, assignee_name, deadline, priority, meeting_id } = req.body;
            const user_id = req.user.id;

            const task = await Task.create({
                task_name,
                description,
                assignee_name,
                deadline,
                priority: priority || 'MEDIUM',
                status: 'PENDING',
                meeting_id,
                created_by: user_id
            });

            res.status(201).json({
                success: true,
                data: task
            });
        } catch (error) {
            console.error('Error creating task:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to create task'
            });
        }
    }

    async getAll(req, res) {
        try {
            const tasks = await Task.findAll({
                include: [
                    {
                        model: MeetingLog,
                        as: 'meetingLog',
                        attributes: ['id', 'title', 'meeting_date']
                    },
                    
                    {
                        model: User,
                        as: 'creator',
                        attributes: ['id', 'name', 'email']
                    }
                ],
                order: [['created_at', 'DESC']]
            });

            // Get all users for the assignee dropdown
            const users = await User.findAll({
                attributes: ['id', 'name', 'email']
            });

            // Get all meetings for the meeting dropdown
            const meetings = await MeetingLog.findAll({
                attributes: ['id', 'title', 'meeting_date'],
                order: [['meeting_date', 'DESC']]
            });

            // Convert to plain objects
            const plainTasks = tasks.map(task => task.get({ plain: true }));
            const plainUsers = users.map(user => user.get({ plain: true }));
            const plainMeetings = meetings.map(meeting => meeting.get({ plain: true }));

            if (req.headers.accept && req.headers.accept.includes('application/json')) {
                return res.json({
                    success: true,
                    data: plainTasks
                });
            }

            res.render('tasks/index', {
                title: 'Tasks',
                tasks: plainTasks,
                users: plainUsers,
                meetings: plainMeetings
            });
        } catch (error) {
            console.error('Error getting tasks:', error);
            if (req.headers.accept && req.headers.accept.includes('application/json')) {
                return res.status(500).json({
                    success: false,
                    error: 'Failed to get tasks'
                });
            }
            res.render('tasks/index', {
                title: 'Tasks',
                error: 'Failed to load tasks'
            });
        }
    }

    async getById(req, res) {
        try {
            const task = await Task.findByPk(req.params.id, {
                include: [
                    {
                        model: MeetingLog,
                        as: 'meetingLog',
                        attributes: ['id', 'title', 'meeting_date', 'content']
                    },
                 
                    {
                        model: User,
                        as: 'creator',
                        attributes: ['id', 'name', 'email']
                    }
                ]
            });

            if (!task) {
                if (req.headers.accept && req.headers.accept.includes('application/json')) {
                    return res.status(404).json({
                        success: false,
                        error: 'Task not found'
                    });
                }
                return res.render('error', {
                    title: 'Task Not Found',
                    message: 'The requested task could not be found'
                });
            }

            const users = await User.findAll({
                attributes: ['id', 'name', 'email']
            });

            const plainTask = task.get({ plain: true });
            const plainUsers = users.map(user => user.get({ plain: true }));

            if (req.headers.accept && req.headers.accept.includes('application/json')) {
                return res.json({
                    success: true,
                    data: plainTask
                });
            }

            res.render('tasks/show', {
                title: plainTask.title,
                task: plainTask,
                users: plainUsers
            });
        } catch (error) {
            console.error('Error getting task:', error);
            if (req.headers.accept && req.headers.accept.includes('application/json')) {
                return res.status(500).json({
                    success: false,
                    error: 'Failed to get task'
                });
            }
            res.render('error', {
                title: 'Error',
                message: 'Failed to load task'
            });
        }
    }

    async update(req, res) {
        try {
            const { id } = req.params;
            const { task_name, description, assignee, deadline, priority, status } = req.body;

            const task = await Task.findByPk(id);
            if (!task) {
                return res.status(404).json({
                    success: false,
                    message: 'Task not found'
                });
            }

            await task.update({
                task_name: task_name || task.task_name,
                description: description || task.description,
                assignee_name: assignee || task.assignee,
                deadline: deadline || task.deadline,
                priority: priority || task.priority,
                status: status || task.status
            });

            res.status(200).json({
                success: true,
                data: task
            });
        } catch (error) {
            console.error('Error updating task:', error);
            res.status(500).json({
                success: false,
                message: 'Server Error',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    async deleteTask(req, res) {
        try {
            const { id } = req.params;
            const task = await Task.findByPk(id);

            if (!task) {
                return res.status(404).json({
                    success: false,
                    message: 'Task not found'
                });
            }

            await task.destroy();

            res.status(200).json({
                success: true,
                message: 'Task deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting task:', error);
            res.status(500).json({
                success: false,
                message: 'Server Error',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    async getByMeeting(req, res) {
        try {
            const { meeting_id } = req.params;
            const tasks = await Task.findAll({
                where: { meeting_id },
                order: [['created_at', 'DESC']]
            });

            res.json({
                success: true,
                data: tasks
            });
        } catch (error) {
            console.error('Error fetching tasks by meeting:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch tasks by meeting'
            });
        }
    }
}

module.exports = new TaskController();
