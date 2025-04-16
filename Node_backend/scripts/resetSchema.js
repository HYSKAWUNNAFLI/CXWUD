require('dotenv').config();
const { sequelize } = require('../models');

async function resetSchema() {
  try {
    console.log('Dropping and recreating public schema...');
    
    // Drop and recreate the public schema
    await sequelize.query('DROP SCHEMA IF EXISTS public CASCADE;');
    await sequelize.query('CREATE SCHEMA public;');
    
    console.log('Public schema has been reset successfully.');
    
    // Sync all models to recreate tables
    console.log('Recreating database tables...');
    await sequelize.sync({ force: true });
    console.log('Database tables have been recreated successfully.');
    
    console.log('Schema reset completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error resetting schema:', error);
    process.exit(1);
  }
}

resetSchema(); 