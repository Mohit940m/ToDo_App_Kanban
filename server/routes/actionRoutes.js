const express = require("express");
const router = express.Router();
const { getRecentActions } = require("../controllers/actionController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, getRecentActions);

module.exports = router;
