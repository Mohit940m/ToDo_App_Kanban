const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  createBoard,
  getUserBoards,
  getBoardDetails,
  addUserToBoard,
} = require("../controllers/boardController");

const router = express.Router();

router.post("/", protect, createBoard);
router.get("/", protect, getUserBoards);
router.get("/:id", protect, getBoardDetails);
router.put("/:id/add-user", protect, addUserToBoard);

module.exports = router;
