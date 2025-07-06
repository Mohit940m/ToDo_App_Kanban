const express = require("express");
const { registerUser, loginUser, getAllUsers, getLeastBusyUser } = require("../controllers/userController");

const router = express.Router();

// Register new user
router.post("/register", registerUser);

// Login existing user
router.post("/login", loginUser);

// Get all users (for task assignment)
router.get("/", getAllUsers);

// Get least busy user (for task assignment)
router.get("/least-busy", getLeastBusyUser);

module.exports = router;