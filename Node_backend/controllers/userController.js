const { User } = require("../models");
const { PROJECT_MANAGER, TEAM_MEMBER } = require("../config/role");

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'can_upload_minutes', 'created_at']
    });
    res.render("admin/manage_users", { users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching users" });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, can_upload_minutes } = req.body;

    const allowedRoles = ['PROJECT_MANAGER', 'TEAM_MEMBER', 'VIEWER'];

    if (!allowedRoles.includes(role)) {
      return res.status(400).render('error', { title: 'Lỗi', message: 'Vai trò không hợp lệ' });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).render('error', { title: 'Không tìm thấy', message: 'Không tìm thấy người dùng' });
    }

    user.role = role;
    user.can_upload_minutes = can_upload_minutes === 'true';
    await user.save();

    res.render('users/roleUpdated', {
      title: 'Cập nhật thành công',
      user: user.get({ plain: true })
    });

  } catch (err) {
    console.error(err);
    res.status(500).render('error', {
      title: 'Lỗi server',
      message: 'Đã xảy ra lỗi khi cập nhật vai trò người dùng'
    });
  }
};


// Get user profile
exports.getProfile = async (req, res) => {
  try {
    // User is already attached to req by authMiddleware
    const user = req.user;
    
    res.render("users/profile", {
      title: "User Profile",
      user,
      success: req.query.success || null,
      error: req.query.error || null
    });
  } catch (error) {
    console.error("Profile error:", error);
    res.redirect('/?error=An error occurred while loading your profile');
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = req.user;
    
    // Check if email is already taken by another user
    if (email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.redirect('/users/profile?error=Email already in use');
      }
    }
    
    // Update user
    user.name = name;
    user.email = email;
    await user.save();
    
    res.redirect('/users/profile?success=Profile updated successfully');
  } catch (error) {
    console.error("Update profile error:", error);
    res.redirect('/users/profile?error=An error occurred while updating your profile');
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = req.user;
    
    // Check current password
    const isPasswordValid = await user.checkPassword(currentPassword);
    if (!isPasswordValid) {
      return res.redirect('/users/profile?error=Current password is incorrect');
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    res.redirect('/users/profile?success=Password changed successfully');
  } catch (error) {
    console.error("Change password error:", error);
    res.redirect('/users/profile?error=An error occurred while changing your password');
  }
};
