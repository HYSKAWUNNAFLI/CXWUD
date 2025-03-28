const express = require("express");
const router = express.Router();
const { getAllUsers, updateUserRole } = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const { ADMIN } = require("../config/role");

router.get("/", authMiddleware, authorizeRoles([ADMIN]), getAllUsers);
router.put("/:id/role", authMiddleware, authorizeRoles([ADMIN]), updateUserRole);

module.exports = router;
