# Meeting Minutes Auto Generator

A web application that automatically extracts tasks from meeting minutes using NLP. The application allows users to upload meeting minutes, automatically extracts tasks, and optionally syncs them with Trello.

## Features

- User authentication with role-based access control
- Meeting minutes upload and processing
- Automatic task extraction using NLP
- Task management with status tracking
- Trello integration for task synchronization
- Dashboard with task statistics and reports

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- Python 3.8+ (for NLP service)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd meeting-minutes-auto-generator
```

2. Install Node.js dependencies:
```bash
cd Node_backend
npm install
```

3. Install Python dependencies:
```bash
cd ../Python_NLP
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

4. Configure environment variables:
   - Copy `.env.example` to `.env` in both Node_backend and Python_NLP directories
   - Update the variables with your configuration

## Database Setup

1. Create a PostgreSQL database
2. Update the database configuration in `.env`
3. Initialize the database:
```bash
cd Node_backend
npm run init-db
```

4. (Optional) Seed sample data:
```bash
npm run seed
```

## Running the Application

1. Start the Node.js backend:
```bash
cd Node_backend
npm start
```

2. Start the Python NLP service:
```bash
cd Python_NLP
python main.py
```

The application will be available at `http://localhost:3000`

## Default Users


- Project Managers:
    Email: pm1@example.com
    Password: Password123!
    
    Email: pm2@example.com
    Password: Password123!
- Team Members:
    Email: tm1@example.com
    Password: Password123!
    Email: tm2@example.com
    Password: Password123!
    Email: tm3@example.com
    Password: Password123!

## API Documentation

### Authentication
- POST /api/auth/register - Register a new user
- POST /api/auth/login - Login user
- POST /api/auth/logout - Logout user

### Meeting Logs
- GET /api/meetings - List all meeting logs
- POST /api/meetings - Create a new meeting log
- GET /api/meetings/:id - Get meeting log details
- PUT /api/meetings/:id - Update meeting log
- DELETE /api/meetings/:id - Delete meeting log

### Tasks
- GET /api/tasks - List all tasks
- POST /api/tasks - Create a new task
- GET /api/tasks/:id - Get task details
- PUT /api/tasks/:id - Update task
- DELETE /api/tasks/:id - Delete task

### Trello Integration
- GET /api/trello/boards - List Trello boards
- GET /api/trello/lists/:boardId - List Trello lists
- POST /api/trello/sync/:taskId - Sync task with Trello

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 