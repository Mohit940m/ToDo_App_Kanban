const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const generateToken = require('../utils/jwtHelper');
const Task = require("../models/Task");
const Board = require("../models/boardModel");


// Register a new user
const registerUser = async (req, res) => {
    const { name, username, email, password } = req.body;

    try {
        let userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        userExists = await User.findOne({ username });
        if (userExists) {
            return res.status(400).json({ message: 'Username is already taken' });
        }


        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(password, salt);


        const user = await User.create({ name, username, email, password: hashed });

        const token = generateToken(user._id);

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token,
        });
    } catch (error) {
        console.error("Register error:", error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// Login user
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user)
            return res.status(400).json({ message: "Invalid email or password" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            return res.status(400).json({ message: "Invalid email or password" });

        const token = generateToken(user._id);


        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all users (for task assignment)
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}, 'name email username').sort({ name: 1 });
        res.json(users);
    } catch (error) {
        console.error("Get users error:", error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

const getLeastBusyUser = async (req, res) => {
  try {
    // 1. Get the boardId from the URL
    const { boardId } = req.params;

    // 2. Find the board and populate its members
    const board = await Board.findById(boardId).populate('members', '_id name');
    
    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }
    
    const usersOnBoard = board.members;

    if (usersOnBoard.length === 0) {
        return res.status(404).json({ message: "No users found on this board" });
    }

    // 3. Get task counts for each user on this specific board
    const taskCounts = await Promise.all(
      usersOnBoard.map(async (user) => {
        const count = await Task.countDocuments({
          assignedTo: user._id,
          status: { $ne: "Done" },
          board: boardId // 🎯 The crucial filter!
        });
        return { user, count };
      })
    );

    // 4. Sort by fewest active tasks
    taskCounts.sort((a, b) => a.count - b.count);

    // 5. Return the least busy user
    res.json(taskCounts[0].user);
    
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(500).json({ message: "Failed to calculate workload" });
  }
};

// set the last active user board
const setLastActiveBoard = async (req, res) => {
  const { boardId } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ message: "User not found" });

  user.lastActiveBoard = boardId;
  await user.save();

  res.status(200).json({ message: "Last active board updated" });
};

//  
const getUserDashboard = async (req, res) => {
  const user = await User.findById(req.user._id).populate("lastActiveBoard", "name _id");
  if (!user) return res.status(404).json({ message: "User not found" });

  const boards = await Board.find({ members: req.user._id })
    .populate("createdBy", "_id name")
    .lean();

  res.status(200).json({
    boards,
    lastActiveBoard: user.lastActiveBoard,
  });
};


module.exports = {
    registerUser, 
    loginUser, 
    getAllUsers, 
    getLeastBusyUser, 
    setLastActiveBoard, 
    getUserDashboard 
};