const ActionLog = require("../models/actionLogModel");
const Board = require("../models/boardModel");

const getRecentActions = async (req, res) => {
  try {
    const { boardId } = req.query;
    
    console.log("Fetching actions for user:", req.user._id, "boardId:", boardId);
    
    if (boardId) {
      // Check if user is a member of the board
      const boardDoc = await Board.findById(boardId);
      if (!boardDoc) {
        return res.status(404).json({ message: "Board not found" });
      }
      
      const isMember = boardDoc.members.some(member => member.toString() === req.user._id.toString());
      if (!isMember) {
        return res.status(403).json({ message: "You are not a member of this board" });
      }
    }

    const actions = await ActionLog.find()
      .sort({ createdAt: -1 })
      .limit(50) // Get more to filter later
      .populate("user", "name email")
      .populate({
        path: "task",
        select: "title board",
        populate: {
          path: "board",
          select: "name"
        }
      });

    console.log("Total actions found:", actions.length);

    // Get user's boards for filtering
    const userBoards = await Board.find({ members: req.user._id }).select('_id');
    const userBoardIds = userBoards.map(board => board._id.toString());
    
    console.log("User boards:", userBoardIds);

    // Filter actions based on board membership
    const filteredActions = actions.filter(action => {
      // If task is null or deleted, skip this action
      if (!action.task) {
        console.log("Skipping action with no task:", action._id);
        return false;
      }
      
      // If task has no board, skip this action
      if (!action.task.board) {
        console.log("Skipping action with task but no board:", action._id, action.task.title);
        return false;
      }
      
      const taskBoardId = action.task.board._id.toString();
      
      if (boardId) {
        return taskBoardId === boardId;
      } else {
        return userBoardIds.includes(taskBoardId);
      }
    }).slice(0, 20); // Limit to 20 after filtering

    console.log("Filtered actions:", filteredActions.length);
    return res.json(filteredActions);
  } catch (err) {
    console.error("Error fetching actions:", err);
    return res.status(500).json({ message: "Failed to fetch actions" });
  }
};

module.exports = { getRecentActions };
// This controller fetches the most recent actions logged in the ActionLog model.