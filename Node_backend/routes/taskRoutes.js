const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");

// ✅ Định nghĩa các route cho Tasks
router.get("/", taskController.getAll);
router.get("/:id", taskController.getById);
router.post("/", taskController.create);
router.put("/:id", taskController.update);
router.delete("/:id", taskController.deleteTask);

module.exports = router;
