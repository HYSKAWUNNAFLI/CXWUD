-- Create database
CREATE DATABASE CXWUD;

-- Connect to the database
\c CXWUD;

-- Create enum types
CREATE TYPE user_role AS ENUM ('PROJECT_MANAGER', 'TEAM_MEMBER');
CREATE TYPE meeting_status AS ENUM ('UPLOADED', 'PROCESSING', 'COMPLETED', 'FAILED');
CREATE TYPE task_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH');
CREATE TYPE task_status AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');

-- Create Users table
CREATE TABLE "Users" (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role user_role DEFAULT 'TEAM_MEMBER',
  can_upload_minutes BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create MeetingLogs table
CREATE TABLE "MeetingLogs" (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  meeting_date TIMESTAMP WITH TIME ZONE NOT NULL,
  file_name VARCHAR(255),
  file_path VARCHAR(255),
  content TEXT NOT NULL,
  summary TEXT,
  status meeting_status DEFAULT 'UPLOADED',
  processing_error TEXT,
  created_by INTEGER NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Tasks table
CREATE TABLE "Tasks" (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  assignee_id INTEGER REFERENCES "Users"(id) ON DELETE SET NULL,
  deadline TIMESTAMP WITH TIME ZONE,
  priority task_priority DEFAULT 'MEDIUM',
  status task_status DEFAULT 'NOT_STARTED',
  meeting_id INTEGER NOT NULL REFERENCES "MeetingLogs"(id) ON DELETE CASCADE,
  created_by INTEGER NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE,
  trello_card_id VARCHAR(255),
  trello_list_id VARCHAR(255),
  last_synced_with_trello TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON "Users"(email);
CREATE INDEX idx_meeting_logs_created_by ON "MeetingLogs"(created_by);
CREATE INDEX idx_meeting_logs_meeting_date ON "MeetingLogs"(meeting_date);
CREATE INDEX idx_tasks_assignee_id ON "Tasks"(assignee_id);
CREATE INDEX idx_tasks_meeting_id ON "Tasks"(meeting_id);
CREATE INDEX idx_tasks_created_by ON "Tasks"(created_by);
CREATE INDEX idx_tasks_status ON "Tasks"(status);
CREATE INDEX idx_tasks_deadline ON "Tasks"(deadline);

-- Create trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for each table
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON "Users"
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meeting_logs_updated_at
BEFORE UPDATE ON "MeetingLogs"
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
BEFORE UPDATE ON "Tasks"
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default project manager
INSERT INTO "Users" (name, email, password, role, can_upload_minutes)
VALUES ('Project Manager', 'pm@example.com', '$2a$10$X7UrE9N9ZqX9ZqX9ZqX9ZqX9ZqX9ZqX9ZqX9ZqX9ZqX9ZqX9ZqX9Zq', 'PROJECT_MANAGER', TRUE);

-- Insert default team members
INSERT INTO "Users" (name, email, password, role, can_upload_minutes)
VALUES 
  ('Team Member 1', 'tm1@example.com', '$2a$10$X7UrE9N9ZqX9ZqX9ZqX9ZqX9ZqX9ZqX9ZqX9ZqX9ZqX9ZqX9ZqX9Zq', 'TEAM_MEMBER', FALSE),
  ('Team Member 2', 'tm2@example.com', '$2a$10$X7UrE9N9ZqX9ZqX9ZqX9ZqX9ZqX9ZqX9ZqX9ZqX9ZqX9ZqX9ZqX9Zq', 'TEAM_MEMBER', FALSE);

-- Insert sample meeting logs
INSERT INTO "MeetingLogs" (title, meeting_date, content, summary, status, created_by)
VALUES 
  ('Weekly Team Meeting', '2024-04-01 10:00:00', 'Discussion about project progress and upcoming tasks.', 'Team discussed project timeline and assigned new tasks.', 'COMPLETED', 1),
  ('Sprint Planning', '2024-04-05 14:00:00', 'Planning for the next sprint with task assignments.', 'Sprint goals defined and tasks assigned to team members.', 'COMPLETED', 1);

-- Insert sample tasks
INSERT INTO "Tasks" (title, description, assignee_id, deadline, priority, status, meeting_id, created_by)
VALUES 
  ('Implement user authentication', 'Set up user authentication with JWT tokens', 2, '2024-04-15', 'HIGH', 'IN_PROGRESS', 1, 1),
  ('Design database schema', 'Create database schema for the application', 3, '2024-04-10', 'MEDIUM', 'NOT_STARTED', 1, 1),
  ('Set up CI/CD pipeline', 'Configure continuous integration and deployment', 2, '2024-04-20', 'HIGH', 'NOT_STARTED', 2, 1); 