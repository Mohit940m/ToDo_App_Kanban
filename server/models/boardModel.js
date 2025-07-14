const mongoose = require("mongoose");

const boardSchema = new mongoose.Schema({
  name: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true });

boardSchema.index({ name: 1, createdBy: 1 }, { unique: true });

module.exports = mongoose.model("Board", boardSchema);
