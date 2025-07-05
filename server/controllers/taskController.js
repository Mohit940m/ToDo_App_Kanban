const Task = require("../models/Task");

// GET all tasks for the logged-in user (can filter later by status)
const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email");
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE a task
const createTask = async (req, res) => {
  const { title, description, assignedTo, status, priority } = req.body;

  try {
    const existing = await Task.findOne({ title });
    if (existing) {
      return res.status(400).json({ message: "Task title must be unique" });
    }

    const newTask = new Task({
      title,
      description,
      assignedTo,
      status,
      priority,
      createdBy: req.user._id,
    });

    const saved = await newTask.save();
    res.status(201).json(saved);
    console.log("Task created:", saved);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE a task
const updateTask = async (req, res) => {
  const { id } = req.params;

  try {
    const task = await Task.findById(id);

    if (!task) return res.status(404).json({ message: "Task not found" });

    // Optional: Only allow the creator to update
    if (task.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not allowed to update this task" });
    }

    const updated = await Task.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json(updated);
    console.log("Task updated:", updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.error("line. 59 Error updating task:", error);
  }
};

// DELETE a task
const deleteTask = async (req, res) => {
  const { id } = req.params;

  try {
    const task = await Task.findById(id);

    if (!task) return res.status(404).json({ message: "Task not found" });

    if (task.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not allowed to delete this task" });
    }

    await task.deleteOne();
    res.status(200).json({ message: "Task deleted" });
    console.log("Task deleted:", id);
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.error("line. 77 Error deleting task:", error);
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
};
