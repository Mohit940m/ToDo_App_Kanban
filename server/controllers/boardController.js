const Board = require("../models/boardModel");
const User = require('../models/User');

const createBoard = async (req, res) => {
  try {
    const board = await Board.create({
      name: req.body.name,
      createdBy: req.user._id,
      members: [req.user._id],
    });
    res.status(201).json(board);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserBoards = async (req, res) => {
  try {
    const boards = await Board.find({ members: req.user._id })
      .populate("createdBy", "name email")
      .select("name createdBy members createdAt updatedAt");
    res.json(boards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getBoardDetails = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id)
      .populate("members", "name email")
      .populate("createdBy", "name email");
    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }
    
    const isMember = board.members.some(member => member._id.toString() === req.user._id.toString());
    if (!isMember) {
      return res.status(403).json({ message: "Access denied" });
    }
    res.json(board);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateBoard = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) return res.status(404).json({ message: "Board not found" });

    if (String(board.createdBy) !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the creator can update the board" });
    }

    const { name } = req.body;
    if (name) {
      board.name = name;
    }

    await board.save();
    const updatedBoard = await Board.findById(board._id)
      .populate("createdBy", "name email")
      .populate("members", "name email");

    res.json(updatedBoard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addUserToBoard = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const removeMemberFromBoard = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) return res.status(404).json({ message: "Board not found" });

    if (String(board.createdBy) !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the creator can remove members" });
    }

    const memberIdToRemove = req.params.memberId;
    
    // Prevent removing the creator
    if (String(board.createdBy) === memberIdToRemove) {
      return res.status(400).json({ message: "Cannot remove the board creator" });
    }

    board.members = board.members.filter(memberId => memberId.toString() !== memberIdToRemove);
    await board.save();

    res.json({ message: "Member removed from board" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteBoard = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) return res.status(404).json({ message: "Board not found" });

    if (String(board.createdBy) !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the creator can delete the board" });
    }

    // Also delete all tasks associated with this board
    const Task = require("../models/Task");
    await Task.deleteMany({ board: req.params.id });

    await board.deleteOne();
    res.json({ message: "Board and all associated tasks deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createBoard,
  getUserBoards,
  getBoardDetails,
  updateBoard,
  addUserToBoard,
  removeMemberFromBoard,
  deleteBoard,
};
