const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  createBoard,
  getUserBoards,
  getBoardDetails,
  updateBoard,
  addUserToBoard,
  removeMemberFromBoard,
  renameBoard,
  deleteBoard,
} = require("../controllers/boardController");

const router = express.Router();

router.post("/", protect, createBoard);
router.get("/", protect, getUserBoards);
router.get("/:id", protect, getBoardDetails);
router.put("/:id", protect, updateBoard);
router.put("/:id/rename", protect, renameBoard);
router.put("/:id/add-user", protect, addUserToBoard);
router.delete("/:id/members/:memberId", protect, removeMemberFromBoard);
router.delete("/:id", protect, deleteBoard);

module.exports = router;
