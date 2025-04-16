const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const { PROJECT_MANAGER } = require("../config/role");

// Project Manager routes
router.get("/", authMiddleware, authorizeRoles([PROJECT_MANAGER]), userController.getAllUsers);
router.put("/:id/role", authMiddleware, authorizeRoles([PROJECT_MANAGER]), userController.updateUserRole);

// User profile routes
router.get("/profile", authMiddleware, userController.getProfile);
router.post("/profile", authMiddleware, userController.updateProfile);
router.post("/change-password", authMiddleware, userController.changePassword);

module.exports = router;
