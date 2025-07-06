const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const generateToken = require('../utils/jwtHelper');

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

module.exports = {registerUser, loginUser, getAllUsers};