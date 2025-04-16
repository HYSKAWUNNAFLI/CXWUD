require('dotenv').config();
const { sequelize } = require('../config/db');
const { User, Task, MeetingLog } = require('../models');

async function initDatabase() {
    try {
        // Force sync will drop all tables and recreate them
        // WARNING: This will delete all data in the database
        await sequelize.sync({ force: true });
        console.log('✅ Database tables created successfully');

        // Create default project manager user
        const projectManager = await User.create({
            name: 'Project Manager',
            email: 'pm@example.com',
            password: 'password123',
            role: 'PROJECT_MANAGER',
            can_upload_minutes: true
        });
        console.log('✅ Default project manager created');

        // Create some team members
        const teamMember1 = await User.create({
            name: 'Team Member 1',
            email: 'tm1@example.com',
            password: 'password123',
            role: 'TEAM_MEMBER',
            can_upload_minutes: false
        });

        const teamMember2 = await User.create({
            name: 'Team Member 2',
            email: 'tm2@example.com',
            password: 'password123',
            role: 'TEAM_MEMBER',
            can_upload_minutes: false
        });
        console.log('✅ Default team members created');

        // Create some meeting logs
        const meeting1 = await MeetingLog.create({
            title: 'Weekly Team Meeting',
            meeting_date: new Date('2024-04-01T10:00:00'),
            content: 'Discussion about project progress and upcoming tasks.',
            summary: 'Team discussed project timeline and assigned new tasks.',
            status: 'COMPLETED',
            created_by: projectManager.id
        });

        const meeting2 = await MeetingLog.create({
            title: 'Sprint Planning',
            meeting_date: new Date('2024-04-05T14:00:00'),
            content: 'Planning for the next sprint with task assignments.',
            summary: 'Sprint goals defined and tasks assigned to team members.',
            status: 'COMPLETED',
            created_by: projectManager.id
        });
        console.log('✅ Sample meeting logs created');

        // Create some tasks
        await Task.create({
            title: 'Implement user authentication',
            description: 'Set up user authentication with JWT tokens',
            assignee_id: teamMember1.id,
            deadline: new Date('2024-04-15'),
            priority: 'HIGH',
            status: 'IN_PROGRESS',
            meeting_id: meeting1.id,
            created_by: projectManager.id
        });

        await Task.create({
            title: 'Design database schema',
            description: 'Create database schema for the application',
            assignee_id: teamMember2.id,
            deadline: new Date('2024-04-10'),
            priority: 'MEDIUM',
            status: 'NOT_STARTED',
            meeting_id: meeting1.id,
            created_by: projectManager.id
        });

        await Task.create({
            title: 'Set up CI/CD pipeline',
            description: 'Configure continuous integration and deployment',
            assignee_id: teamMember1.id,
            deadline: new Date('2024-04-20'),
            priority: 'HIGH',
            status: 'NOT_STARTED',
            meeting_id: meeting2.id,
            created_by: projectManager.id
        });
        console.log('✅ Sample tasks created');

        console.log('✅ Database initialization completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Database initialization failed:', error);
        process.exit(1);
    }
}

initDatabase(); 