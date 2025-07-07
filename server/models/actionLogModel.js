const mongoose = require("mongoose");

const actionLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  actionType: {
    type: String,
    enum: ["create", "edit", "delete", "assign", "move"],
    required: true,
  },
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Task",
  },
  description: {
    type: String,
    required: true,
    }
}, { timestamps: { createdAt: true, updatedAt: false } });


module.exports = mongoose.model("ActionLog", actionLogSchema);
