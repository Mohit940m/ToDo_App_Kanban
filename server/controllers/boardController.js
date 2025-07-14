const Board = require("../models/boardModel");
const User = require('../models/User');

const createBoard = async (req, res) => {
  const board = await Board.create({
    name: req.body.name,
    createdBy: req.user._id,
    members: [req.user._id],
  });
  res.status(201).json(board);
};

const getUserBoards = async (req, res) => {
  const boards = await Board.find({ members: req.user._id });
  res.json(boards);
};

const getBoardDetails = async (req, res) => {
  const board = await Board.findById(req.params.id).populate("members", "username email");
  if (!board.members.includes(req.user._id)) {
    return res.status(403).json({ message: "Access denied" });
  }
  res.json(board);
};

const addUserToBoard = async (req, res) => {
  const board = await Board.findById(req.params.id);
  if (!board) return res.status(404).json({ message: "Board not found" });

  if (String(board.createdBy) !== req.user._id.toString()) {
    return res.status(403).json({ message: "Only the creator can add users" });
  }

  const userToAdd = await User.findOne({ email: req.body.email });
  if (!userToAdd) return res.status(404).json({ message: "User not found" });

  if (!board.members.includes(userToAdd._id)) {
    board.members.push(userToAdd._id);
    await board.save();
  }

  res.json({ message: "User added to board" });
};

module.exports = {
  createBoard,
  getUserBoards,
  getBoardDetails,
  addUserToBoard,
};
