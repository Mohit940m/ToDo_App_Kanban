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
    const users = await User.find({}, "_id name");

    // Get task counts per user
    const taskCounts = await Promise.all(
      users.map(async (user) => {
        const count = await Task.countDocuments({
          assignedTo: user._id,
          status: { $ne: "Done" },
        });
        return { user, count };
      })
    );

    // Sort by fewest active tasks
    taskCounts.sort((a, b) => a.count - b.count);

    res.json(taskCounts[0].user); // return the least busy user
  } catch (err) {
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

  const boards = await Board.find({ members: req.user._id }).select("name _id");

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