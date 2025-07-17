const express = require("express");
const { registerUser, loginUser, getAllUsers, getLeastBusyUser, setLastActiveBoard, getUserDashboard } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Register new user
router.post("/register", registerUser);

// Login existing user
router.post("/login", loginUser);

// Get all users (for task assignment)
router.get("/", getAllUsers);

// Get least busy user (for task assignment)
router.get("/least-busy", getLeastBusyUser);

// save last active board
router.put("/last-active-board", protect, setLastActiveBoard); // chack for bugs in future 

router.get("/dashboard", protect, getUserDashboard);

module.exports = router;