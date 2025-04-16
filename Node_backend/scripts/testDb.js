require('dotenv').config();
const { sequelize } = require('../models');
const { User } = require('../models');

async function testDatabaseConnection() {
  try {
    // Test the database connection
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    // Get database information
    const [results] = await sequelize.query('SELECT version()');
    console.log('PostgreSQL version:', results[0].version);

    // Get table information
    const tables = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('\nTables in database:');
    tables[0].forEach(table => console.log(`- ${table.table_name}`));

    // Get user count
    const [userCount] = await sequelize.query('SELECT COUNT(*) as count FROM "Users"');
    console.log('\nNumber of users:', userCount[0].count);

    // Get meeting logs count
    const [meetingCount] = await sequelize.query('SELECT COUNT(*) as count FROM "MeetingLogs"');
    console.log('Number of meeting logs:', meetingCount[0].count);

    // Get tasks count
    const [taskCount] = await sequelize.query('SELECT COUNT(*) as count FROM "Tasks"');
    console.log('Number of tasks:', taskCount[0].count);

    process.exit(0);
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
}

testDatabaseConnection(); 