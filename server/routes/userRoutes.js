const express = require("express");
const { registerUser, loginUser, getAllUsers } = require("../controllers/userController");

const router = express.Router();

// Register new user
router.post("/register", registerUser);

// Login existing user
router.post("/login", loginUser);

// Get all users (for task assignment)
router.get("/", getAllUsers);

module.exports = router;