import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import "./Dashboard.css";
import settingsIcon from "../assets/settings.svg";

const Dashboard = ({ user }) => {
  const [boards, setBoards] = useState([]);
  const [lastActiveBoard, setLastActiveBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newBoardName, setNewBoardName] = useState("");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await API.get("/api/users/dashboard");
        setBoards(res.data.boards);
        setLastActiveBoard(res.data.lastActiveBoard);
        setLoading(false);

        // Don't auto redirect - let user choose which board to open
      } catch (err) {
        console.error("Failed to load dashboard:", err);
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await API.get("/api/users");
        setAllUsers(res.data);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    if (inviteEmail) {
      const filtered = allUsers.filter(u => 
        u.email.toLowerCase().includes(inviteEmail.toLowerCase()) ||
        u.name.toLowerCase().includes(inviteEmail.toLowerCase())
      );
      setFilteredUsers(filtered);
      setShowUserDropdown(filtered.length > 0);
    } else {
      setFilteredUsers([]);
      setShowUserDropdown(false);
    }
  }, [inviteEmail, allUsers]);

  const handleCreateBoard = async () => {
    if (!newBoardName.trim()) return;

    try {
      const res = await API.post("/api/boards", { name: newBoardName });
      // Update user last active board immediately
      await API.put("/api/users/last-active-board", { boardId: res.data._id });
      
      // Update local state
      setBoards(prev => [...prev, res.data]);
      setLastActiveBoard(res.data);
      setNewBoardName("");
      
      navigate(`/board/${res.data._id}`);
    } catch (err) {
      console.error("Failed to create board:", err);
      alert("Error creating board. Try a different name.");
    }
  };

  const handleOpenBoard = async (boardId) => {
    try {
      await API.put("/api/users/last-active-board", { boardId });
      navigate(`/board/${boardId}`);
    } catch (err) {
      console.error("Failed to update last active board:", err);
      navigate(`/board/${boardId}`);
    }
  };

  const handleInviteUser = async () => {
    if (!inviteEmail.trim() || !selectedBoard) return;

    setInviteLoading(true);
    try {
      await API.put(`/api/boards/${selectedBoard._id}/add-user`, { 
        email: inviteEmail 
      });
      
      alert(`Successfully invited ${inviteEmail} to ${selectedBoard.name}`);
      setShowInviteModal(false);
      setInviteEmail("");
      setSelectedBoard(null);
      setShowUserDropdown(false);
    } catch (err) {
      console.error("Failed to invite user:", err);
      alert(err.response?.data?.message || "Failed to invite user");
    } finally {
      setInviteLoading(false);
    }
  };

  const openInviteModal = (board) => {
    setSelectedBoard(board);
    setShowInviteModal(true);
    setInviteEmail("");
  };

  const closeInviteModal = () => {
    setShowInviteModal(false);
    setSelectedBoard(null);
    setInviteEmail("");
    setShowUserDropdown(false);
  };

  const selectUser = (user) => {
    setInviteEmail(user.email);
    setShowUserDropdown(false);
  };

  const isCreator = (board) => {
    return board.createdBy === user?._id;
  };

  const handleBoardSettings = (board) => {
    navigate(`/board/${board._id}/settings`);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (newBoardName.trim()) {
        handleCreateBoard();
      } else if (inviteEmail.trim() && selectedBoard) {
        handleInviteUser();
      }
    }
  };

  if (loading) return (
    <div className="dashboard-container">
      <div className="loading-spinner">Loading dashboard...</div>
    </div>
  );

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Welcome back, {user?.username || "User"}!</h2>
        <p className="dashboard-subtitle">Manage your boards and collaborate with your team</p>
      </div>

      <div className="create-board-section">
        <h3>Create New Board</h3>
        <div className="create-board">
          <input
            type="text"
            placeholder="Enter board name"
            value={newBoardName}
            onChange={(e) => setNewBoardName(e.target.value)}
            onKeyPress={handleKeyPress}
            className="board-name-input"
          />
          <button 
            onClick={handleCreateBoard}
            disabled={!newBoardName.trim()}
            className="create-board-btn"
          >
            Create Board
          </button>
        </div>
      </div>

      <div className="boards-section">
        <h3>Your Boards ({boards.length})</h3>
        {boards.length === 0 ? (
          <div className="empty-state">
            <p>You haven't joined or created any boards yet.</p>
            <p>Create your first board above to get started!</p>
          </div>
        ) : (
          <div className="board-list">
            {boards.map((board) => (
              <div key={board._id} className="board-card">
                <div 
                  className="board-card-content"
                  onClick={() => handleOpenBoard(board._id)}
                >
                  <div className="board-header">
                    <h4>{board.name}</h4>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBoardSettings(board);
                      }}
                      className="settings-btn"
                      title="Board settings"
                    >
                      <img src={settingsIcon} alt="Settings" />
                    </button>
                  </div>
                  <div className="board-meta">
                    <span className="board-role">
                      {isCreator(board) ? "Creator" : "Member"}
                    </span>
                    {lastActiveBoard?._id === board._id && (
                      <span className="active-badge">Last Opened</span>
                    )}
                  </div>
                </div>
                
                {isCreator(board) && (
                  <div className="board-actions">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openInviteModal(board);
                      }}
                      className="invite-btn"
                      title="Invite members"
                    >
                      + Invite
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="modal-overlay" onClick={closeInviteModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Invite Member to "{selectedBoard?.name}"</h3>
              <button 
                className="modal-close"
                onClick={closeInviteModal}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="invite-input-container">
                <label htmlFor="invite-email">User Email</label>
                <input
                  id="invite-email"
                  type="email"
                  placeholder="Enter user email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="invite-email-input"
                  autoComplete="off"
                />
                
                {showUserDropdown && (
                  <div className="user-dropdown">
                    {filteredUsers.slice(0, 5).map((user) => (
                      <div
                        key={user._id}
                        className="user-option"
                        onClick={() => selectUser(user)}
                      >
                        <div className="user-info">
                          <span className="user-name">{user.name}</span>
                          <span className="user-email">{user.email}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                onClick={closeInviteModal}
                className="cancel-btn"
              >
                Cancel
              </button>
              <button
                onClick={handleInviteUser}
                disabled={!inviteEmail.trim() || inviteLoading}
                className="invite-submit-btn"
              >
                {inviteLoading ? "Inviting..." : "Send Invite"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
