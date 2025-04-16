const { User, Task, MeetingLog } = require('../models');

// Get all users with related data
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      include: [
        {
          model: MeetingLog,
          as: 'meetingLogs',
          attributes: ['id', 'title', 'meeting_date', 'status']
        },
        {
          model: Task,
          as: 'assignedTasks',
          attributes: ['id', 'title', 'status', 'priority']
        }
      ]
    });
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get a single user by ID with related data
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: MeetingLog,
          as: 'meetingLogs',
          attributes: ['id', 'title', 'meeting_date', 'status'],
          include: [
            {
              model: Task,
              as: 'tasks',
              attributes: ['id', 'title', 'status', 'priority']
            }
          ]
        },
        {
          model: Task,
          as: 'assignedTasks',
          attributes: ['id', 'title', 'status', 'priority', 'deadline'],
          include: [
            {
              model: MeetingLog,
              as: 'meeting',
              attributes: ['id', 'title', 'meeting_date']
            }
          ]
        },
        {
          model: Task,
          as: 'createdTasks',
          attributes: ['id', 'title', 'status', 'priority', 'deadline'],
          include: [
            {
              model: MeetingLog,
              as: 'meeting',
              attributes: ['id', 'title', 'meeting_date']
            }
          ]
        }
      ]
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Create a new user
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, can_upload_minutes } = req.body;
    
    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }
    
    // Create the user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'TEAM_MEMBER',
      can_upload_minutes: can_upload_minutes || false
    });
    
    // Remove password from response
    const userResponse = user.toJSON();
    delete userResponse.password;
    
    res.status(201).json({
      success: true,
      data: userResponse
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update a user
exports.updateUser = async (req, res) => {
  try {
    const { name, email, password, role, can_upload_minutes } = req.body;
    
    // Find the user
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if email is being changed and if it already exists
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        });
      }
    }
    
    // Update the user
    await user.update({
      name: name || user.name,
      email: email || user.email,
      password: password || user.password,
      role: role || user.role,
      can_upload_minutes: can_upload_minutes !== undefined ? can_upload_minutes : user.can_upload_minutes
    });
    
    // Remove password from response
    const userResponse = user.toJSON();
    delete userResponse.password;
    
    res.status(200).json({
      success: true,
      data: userResponse
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Delete a user
exports.deleteUser = async (req, res) => {
  try {
    // Find the user
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Delete the user
    await user.destroy();
    
    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}; 