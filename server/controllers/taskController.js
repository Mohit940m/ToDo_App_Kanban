const Task = require("../models/Task");
const Board = require("../models/boardModel");
const logAction = require("../utils/logAction");

// GET all tasks for the logged-in user (can filter by board and status)
const getTasks = async (req, res) => {
  try {
    const { boardId } = req.query;
    let filter = {};
    
    if (boardId) {
      // Check if user is a member of the board
      const boardDoc = await Board.findById(boardId);
      if (!boardDoc) {
        return res.status(404).json({ message: "Board not found" });
      }
      
      const isMember = boardDoc.members.some(member => member.toString() === req.user._id.toString());
      if (!isMember) {
        return res.status(403).json({ message: "You are not a member of this board" });
      }
      
      filter.board = boardId;
    } else {
      // If no boardId specified, only return tasks from boards the user is a member of
      const userBoards = await Board.find({ members: req.user._id }).select('_id');
      const boardIds = userBoards.map(board => board._id);
      filter.board = { $in: boardIds };
    }
    
    const tasks = await Task.find(filter)
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .populate("board", "name");
    return res.status(200).json(tasks);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// CREATE a task
const createTask = async (req, res) => {
  const { title, description, assignedTo, status, priority, board } = req.body;

  try {
    if (!board) {
      return res.status(400).json({ message: "Board ID is required" });
    }

    // Check if user is a member of the board
    const boardDoc = await Board.findById(board);
    if (!boardDoc) {
      return res.status(404).json({ message: "Board not found" });
    }
    
    const isMember = boardDoc.members.some(member => member.toString() === req.user._id.toString());
    if (!isMember) {
      return res.status(403).json({ message: "You are not a member of this board" });
    }

    const existing = await Task.findOne({ title, board });
    if (existing) {
      return res.status(400).json({ message: "Task title must be unique within the board" });
    }

    const newTask = new Task({
      title,
      description,
      assignedTo,
      status: status || "Todo",
      priority: priority || "Medium",
      createdBy: req.user._id,
      board,
    });

    const saved = await newTask.save();
    const populatedTask = await Task.findById(saved._id)
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .populate("board", "name");

    await logAction({
      userId: req.user._id,
      actionType: "create",
      taskId: newTask._id,
      description: `Created task "${newTask.title}"`,
      boardId: board,
    }, global.io);
    return res.status(201).json(populatedTask);
    // console.log("Task created:", populatedTask);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// UPDATE a task
const updateTask = async (req, res) => {
  const { id } = req.params;
  const { force, ...updatePayload } = req.body; // Separate force flag from payload

  try {
    const taskOnServer = await Task.findById(id);

    if (!taskOnServer) return res.status(404).json({ message: "Task not found" });

    // Allow creator or assigned user to update the task
    const isCreator = taskOnServer.createdBy && taskOnServer.createdBy.toString() === req.user._id.toString();
    const isAssigned = taskOnServer.assignedTo && taskOnServer.assignedTo.toString() === req.user._id.toString();

    if (!isCreator && !isAssigned) {
      return res.status(403).json({ message: "Not allowed to update this task" });
    }

    // --- Conflict Detection ---
    // If the client sends an `updatedAt` and is not forcing the update, check for conflicts.
    if (updatePayload.updatedAt && !force) {
      const clientLastUpdate = new Date(updatePayload.updatedAt).getTime();
      const serverLastUpdate = new Date(taskOnServer.updatedAt).getTime();

      // If the server version is newer, there's a conflict.
      if (serverLastUpdate > clientLastUpdate) {
        const populatedTask = await Task.findById(id)
          .populate("createdBy", "name email")
          .populate("assignedTo", "name email");
        return res.status(409).json({
          message: "Conflict: This task has been updated by someone else.",
          serverTask: populatedTask,
        });
      }
    }

    const updated = await Task.findByIdAndUpdate(id, updatePayload, { new: true })
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email");

    // Log different types of updates
    let actionType = "edit";
    let description = `Updated task "${updated.title}"`;

    // Check if status was changed (task moved)
    if (updatePayload.status && taskOnServer.status !== updatePayload.status) {
      actionType = "move";
      description = `Moved task "${updated.title}" from ${taskOnServer.status} to ${updatePayload.status}`;
    }
    // Check if assignedTo was changed
    else if (updatePayload.assignedTo && taskOnServer.assignedTo?.toString() !== updatePayload.assignedTo) {
      actionType = "assign";
      description = `Assigned task "${updated.title}" to ${updated.assignedTo?.name || 'someone'}`;
    }

    await logAction({
      userId: req.user._id,
      actionType,
      taskId: updated._id,
      description,
      boardId: updated.board,
    }, global.io);

    return res.status(200).json(updated);
    console.log("Task updated:", updated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
    console.error("Error updating task:", error);
  }
};

// DELETE a task
const deleteTask = async (req, res) => {
  const { id } = req.params;

  try {
    const task = await Task.findById(id);

    if (!task) return res.status(404).json({ message: "Task not found" });

    // Allow creator or assigned user to delete the task
    const isCreator = task.createdBy && task.createdBy.toString() === req.user._id.toString();
    const isAssigned = task.assignedTo && task.assignedTo.toString() === req.user._id.toString();

    if (!isCreator && !isAssigned) {
      return res.status(403).json({ message: "Not allowed to delete this task" });
    }

    // Log the delete action before deleting the task
    await logAction({
      userId: req.user._id,
      actionType: "delete",
      taskId: task._id,
      description: `Deleted task "${task.title}"`,
      boardId: task.board,
    }, global.io);

    await task.deleteOne();
    return res.status(200).json({ message: "Task deleted" });
    console.log("Task deleted:", id);
  } catch (error) {
    return res.status(500).json({ message: error.message });
    console.error("Error deleting task:", error);
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
};