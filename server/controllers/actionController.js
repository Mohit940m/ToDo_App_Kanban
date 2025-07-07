const ActionLog = require("../models/actionLogModel");

const getRecentActions = async (req, res) => {
  try {
    const actions = await ActionLog.find()
      .sort({ timestamp: -1 })
      .limit(20)
      .populate("user", "name email")
      .populate("task", "title");

    res.json(actions);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch actions" });
  }
};

module.exports = { getRecentActions };
// This controller fetches the most recent actions logged in the ActionLog model.