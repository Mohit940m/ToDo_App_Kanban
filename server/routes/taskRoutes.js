const express = require("express");
const { getTasks, createTask, updateTask, deleteTask } = require("../controllers/taskController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Get tasks (can be filtered by boardId via query parameter)
router.get("/", protect, getTasks);

// Create a new task
router.post("/", protect, createTask);

// Update a task
router.put("/:id", protect, updateTask);

// Delete a task
router.delete("/:id", protect, deleteTask);

module.exports = router;
