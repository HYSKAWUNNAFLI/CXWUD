require('dotenv').config();
const { sequelize } = require('../config/db');
const { User, Task, MeetingLog } = require('../models');

async function seedDatabase() {
  try {
    // Check if database is empty
    const userCount = await User.count();
    if (userCount > 0) {
      console.log('⚠️ Database already contains data. Skipping seed.');
      process.exit(0);
    }

    console.log('🌱 Starting database seeding...');

    // Create project managers
    const projectManager1 = await User.create({
      name: 'John Smith',
      email: 'john.smith@example.com',
      password: 'password123',
      role: 'PROJECT_MANAGER',
      can_upload_minutes: true
    });

    const projectManager2 = await User.create({
      name: 'Sarah Johnson',
      email: 'sarah.johnson@example.com',
      password: 'password123',
      role: 'PROJECT_MANAGER',
      can_upload_minutes: true
    });

    // Create team members
    const teamMembers = await Promise.all([
      User.create({
        name: 'Michael Brown',
        email: 'michael.brown@example.com',
        password: 'password123',
        role: 'TEAM_MEMBER',
        can_upload_minutes: false
      }),
      User.create({
        name: 'Emily Davis',
        email: 'emily.davis@example.com',
        password: 'password123',
        role: 'TEAM_MEMBER',
        can_upload_minutes: false
      }),
      User.create({
        name: 'David Wilson',
        email: 'david.wilson@example.com',
        password: 'password123',
        role: 'TEAM_MEMBER',
        can_upload_minutes: false
      }),
      User.create({
        name: 'Jennifer Taylor',
        email: 'jennifer.taylor@example.com',
        password: 'password123',
        role: 'TEAM_MEMBER',
        can_upload_minutes: false
      })
    ]);

    console.log('✅ Users created');

    // Create meeting logs for project 1
    const project1Meetings = await Promise.all([
      MeetingLog.create({
        title: 'Project Kickoff Meeting',
        meeting_date: new Date('2024-03-15T09:00:00'),
        content: 'Initial meeting to discuss project goals, timeline, and team assignments.',
        summary: 'Project scope defined, team roles assigned, and timeline established.',
        status: 'COMPLETED',
        created_by: projectManager1.id
      }),
      MeetingLog.create({
        title: 'Weekly Progress Update',
        meeting_date: new Date('2024-03-22T10:00:00'),
        content: 'Team members report on their progress and discuss any blockers.',
        summary: 'Good progress on frontend development, some challenges with API integration.',
        status: 'COMPLETED',
        created_by: projectManager1.id
      }),
      MeetingLog.create({
        title: 'Sprint Planning',
        meeting_date: new Date('2024-03-29T14:00:00'),
        content: 'Planning for the next sprint with task assignments and priorities.',
        summary: 'Sprint goals defined, tasks assigned to team members.',
        status: 'COMPLETED',
        created_by: projectManager1.id
      })
    ]);

    // Create meeting logs for project 2
    const project2Meetings = await Promise.all([
      MeetingLog.create({
        title: 'Client Requirements Meeting',
        meeting_date: new Date('2024-03-10T11:00:00'),
        content: 'Meeting with client to gather requirements and expectations.',
        summary: 'Client requirements documented, project scope defined.',
        status: 'COMPLETED',
        created_by: projectManager2.id
      }),
      MeetingLog.create({
        title: 'Design Review',
        meeting_date: new Date('2024-03-20T13:00:00'),
        content: 'Review of UI/UX designs with the team and client.',
        summary: 'Designs approved with minor changes requested.',
        status: 'COMPLETED',
        created_by: projectManager2.id
      })
    ]);

    console.log('✅ Meeting logs created');

    // Create tasks for project 1
    await Promise.all([
      Task.create({
        title: 'Set up project repository',
        description: 'Initialize Git repository and set up project structure',
        assignee_id: teamMembers[0].id,
        deadline: new Date('2024-03-18'),
        priority: 'HIGH',
        status: 'COMPLETED',
        meeting_id: project1Meetings[0].id,
        created_by: projectManager1.id
      }),
      Task.create({
        title: 'Design database schema',
        description: 'Create database schema for the application',
        assignee_id: teamMembers[1].id,
        deadline: new Date('2024-03-25'),
        priority: 'HIGH',
        status: 'COMPLETED',
        meeting_id: project1Meetings[0].id,
        created_by: projectManager1.id
      }),
      Task.create({
        title: 'Implement user authentication',
        description: 'Set up user authentication with JWT tokens',
        assignee_id: teamMembers[0].id,
        deadline: new Date('2024-04-01'),
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        meeting_id: project1Meetings[1].id,
        created_by: projectManager1.id
      }),
      Task.create({
        title: 'Create API endpoints',
        description: 'Develop RESTful API endpoints for the application',
        assignee_id: teamMembers[1].id,
        deadline: new Date('2024-04-05'),
        priority: 'MEDIUM',
        status: 'IN_PROGRESS',
        meeting_id: project1Meetings[1].id,
        created_by: projectManager1.id
      }),
      Task.create({
        title: 'Implement frontend dashboard',
        description: 'Create the main dashboard UI for the application',
        assignee_id: teamMembers[2].id,
        deadline: new Date('2024-04-08'),
        priority: 'MEDIUM',
        status: 'NOT_STARTED',
        meeting_id: project1Meetings[2].id,
        created_by: projectManager1.id
      }),
      Task.create({
        title: 'Set up CI/CD pipeline',
        description: 'Configure continuous integration and deployment',
        assignee_id: teamMembers[3].id,
        deadline: new Date('2024-04-12'),
        priority: 'LOW',
        status: 'NOT_STARTED',
        meeting_id: project1Meetings[2].id,
        created_by: projectManager1.id
      })
    ]);

    // Create tasks for project 2
    await Promise.all([
      Task.create({
        title: 'Create wireframes',
        description: 'Design wireframes for the application',
        assignee_id: teamMembers[2].id,
        deadline: new Date('2024-03-15'),
        priority: 'HIGH',
        status: 'COMPLETED',
        meeting_id: project2Meetings[0].id,
        created_by: projectManager2.id
      }),
      Task.create({
        title: 'Develop UI components',
        description: 'Create reusable UI components based on designs',
        assignee_id: teamMembers[3].id,
        deadline: new Date('2024-03-25'),
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        meeting_id: project2Meetings[1].id,
        created_by: projectManager2.id
      }),
      Task.create({
        title: 'Implement responsive design',
        description: 'Ensure the application is responsive on all devices',
        assignee_id: teamMembers[2].id,
        deadline: new Date('2024-04-05'),
        priority: 'MEDIUM',
        status: 'NOT_STARTED',
        meeting_id: project2Meetings[1].id,
        created_by: projectManager2.id
      })
    ]);

    console.log('✅ Tasks created');
    console.log('✅ Database seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase(); 