# Database Setup and Management

This directory contains scripts for setting up and managing the database for the Meeting Minutes Auto Generator application.

## Database Schema

The application uses a PostgreSQL database with the following tables:

### Users
- Stores user information including name, email, password, role, and permissions
- Roles: PROJECT_MANAGER, TEAM_MEMBER
- Project managers can upload meeting minutes, team members cannot

### MeetingLogs
- Stores meeting information including title, date, content, and status
- Each meeting log is created by a user (created_by)
- Status: UPLOADED, PROCESSING, COMPLETED, FAILED

### Tasks
- Stores tasks extracted from meeting minutes
- Each task is associated with a meeting (meeting_id)
- Tasks can be assigned to users (assignee_id)
- Tasks have priority (LOW, MEDIUM, HIGH) and status (NOT_STARTED, IN_PROGRESS, COMPLETED)
- Tasks can be synced with Trello (trello_card_id, trello_list_id)

## Database Relationships

- Users can create many MeetingLogs (one-to-many)
- Users can be assigned many Tasks (one-to-many)
- MeetingLogs can have many Tasks (one-to-many)
- Tasks belong to one MeetingLog (many-to-one)
- Tasks can be assigned to one User (many-to-one)

## Setup Instructions

### Prerequisites

- PostgreSQL installed and running
- Node.js and npm installed
- Environment variables configured in `.env` file

### Initial Setup

1. Create the database and tables:

```bash
# Using Sequelize (recommended)
npm run init-db

# Or manually using SQL script
psql -U postgres -f scripts/createDatabase.sql
```

2. Seed the database with sample data:

```bash
npm run seed
```

### Testing the Database Connection

To test if the database connection is working properly:

```bash
npm run test-db
```

### Resetting the Database Schema

If you need to completely reset the database (this will delete all data):

```bash
npm run reset-schema
```

This will:
1. Drop the public schema
2. Recreate an empty public schema
3. Recreate all tables using Sequelize models

## Database Management

### Backup and Restore

To backup the database:

```bash
pg_dump -U postgres CXWUD > backup.sql
```

To restore from a backup:

```bash
psql -U postgres CXWUD < backup.sql
```

### Troubleshooting

If you encounter issues with the database:

1. Check the PostgreSQL service is running
2. Verify the connection details in `.env` file
3. Ensure the database exists and is accessible
4. Check for any error messages in the console

## Database Indexes

The following indexes are created for better performance:

- Users: email
- MeetingLogs: created_by, meeting_date
- Tasks: assignee_id, meeting_id, created_by, status, deadline

## Triggers

The following triggers are set up:

- update_updated_at_column: Automatically updates the updated_at timestamp when a record is modified 