const ActionLog = require("../models/actionLogModel");

const logAction = async ({ userId, actionType, taskId, description }, io = null) => {
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
    if (io) {
      io.emit("activity-logged", populatedAction);
      console.log("Activity logged and broadcasted:", populatedAction.description);
    }

    return populatedAction;
  } catch (err) {
    console.error("Failed to log action:", err.message);
    throw err;
  }
};

module.exports = logAction;
