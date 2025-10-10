const ActionLog = require("../models/actionLogModel");

const logAction = async ({ userId, actionType, taskId, description, boardId }, io = null) => {
  try {
    const newAction = await ActionLog.create({
      user: userId,
      actionType,
      task: taskId,
      description,
    });

    // Populate the action with user and task details
    const populatedAction = await ActionLog.findById(newAction._id)
      .populate("user", "name email")
      .populate("task", "title");

    // Emit socket event if io instance is provided
    if (io && boardId) {
      // Convert boardId to string to ensure room name matches
      const roomId = boardId.toString();
      // Use io.in() to emit to ALL clients in the room (including sender)
      io.in(roomId).emit("activity-logged", populatedAction);
      console.log("✅ Activity logged and broadcasted to room:", roomId, "Description:", populatedAction.description);
      console.log("📊 Rooms in server:", io.sockets.adapter.rooms);
    } else if (io) {
      io.emit("activity-logged", populatedAction);
      console.log("Activity logged and broadcasted globally:", populatedAction.description);
    } else {
      console.warn("⚠️ No io instance provided to logAction");
    }

    return populatedAction;
  } catch (err) {
    console.error("Failed to log action:", err.message);
    throw err;
  }
};

module.exports = logAction;
