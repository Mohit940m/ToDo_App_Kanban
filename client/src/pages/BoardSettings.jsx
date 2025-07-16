import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/api";
import "./BoardSettings.css";

const BoardSettings = ({ user }) => {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [boardName, setBoardName] = useState("");
  const [members, setMembers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);

  useEffect(() => {
    const fetchBoardDetails = async () => {
      try {
        const res = await API.get(`/api/boards/${boardId}`);
        setBoard(res.data);
        setBoardName(res.data.name);
        setMembers(res.data.members);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load board details:", err);
        setLoading(false);
        navigate("/dashboard");
      }
    };

    const fetchUsers = async () => {
      try {
        const res = await API.get("/api/users");
        setAllUsers(res.data);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      }
    };

    fetchBoardDetails();
    fetchUsers();
  }, [boardId, navigate]);

  useEffect(() => {
    if (inviteEmail) {
      const filtered = allUsers.filter(u => 
        (u.email.toLowerCase().includes(inviteEmail.toLowerCase()) ||
        u.name.toLowerCase().includes(inviteEmail.toLowerCase())) &&
        !members.some(member => member._id === u._id)
      );
      setFilteredUsers(filtered);
      setShowUserDropdown(filtered.length > 0);
    } else {
      setFilteredUsers([]);
      setShowUserDropdown(false);
    }
  }, [inviteEmail, allUsers, members]);

  const isCreator = () => {
    return board?.createdBy === user?._id;
  };

  const handleUpdateBoardName = async () => {
    if (!boardName.trim() || boardName === board.name) return;

    setUpdateLoading(true);
    try {
      const res = await API.put(`/api/boards/${boardId}`, { name: boardName });
      setBoard(res.data);
      alert("Board name updated successfully!");
    } catch (err) {
      console.error("Failed to update board name:", err);
      alert("Failed to update board name");
      setBoardName(board.name); // Reset to original name
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleInviteUser = async () => {
    if (!inviteEmail.trim()) return;

    setInviteLoading(true);
    try {
      await API.put(`/api/boards/${boardId}/add-user`, { 
        email: inviteEmail 
      });
      
      // Refresh board details to get updated members list
      const res = await API.get(`/api/boards/${boardId}`);
      setMembers(res.data.members);
      
      setInviteEmail("");
      setShowUserDropdown(false);
      alert(`Successfully invited ${inviteEmail} to the board`);
    } catch (err) {
      console.error("Failed to invite user:", err);
      alert(err.response?.data?.message || "Failed to invite user");
    } finally {
      setInviteLoading(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (memberId === board.createdBy) {
      alert("Cannot remove the board creator");
      return;
    }

    if (window.confirm("Are you sure you want to remove this member?")) {
      try {
        await API.delete(`/api/boards/${boardId}/members/${memberId}`);
        setMembers(members.filter(member => member._id !== memberId));
        alert("Member removed successfully");
      } catch (err) {
        console.error("Failed to remove member:", err);
        alert("Failed to remove member");
      }
    }
  };

  const handleDeleteBoard = async () => {
    if (window.confirm("Are you sure you want to delete this board? This action cannot be undone.")) {
      try {
        await API.delete(`/api/boards/${boardId}`);
        alert("Board deleted successfully");
        navigate("/dashboard");
      } catch (err) {
        console.error("Failed to delete board:", err);
        alert("Failed to delete board");
      }
    }
  };

  const selectUser = (user) => {
    setInviteEmail(user.email);
    setShowUserDropdown(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (e.target.name === 'boardName') {
        handleUpdateBoardName();
      } else if (inviteEmail.trim()) {
        handleInviteUser();
      }
    }
  };

  if (loading) {
    return (
      <div className="board-settings-container">
        <div className="loading-spinner">Loading board settings...</div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="board-settings-container">
        <div className="error-message">Board not found</div>
      </div>
    );
  }

  return (
    <div className="board-settings-container">
      <div className="settings-header">
        <button 
          onClick={() => navigate(`/board/${boardId}`)}
          className="back-btn"
        >
          ← Back to Board
        </button>
        <h2>Board Settings</h2>
      </div>

      <div className="settings-content">
        {/* Board Information */}
        <div className="settings-section">
          <h3>Board Information</h3>
          <div className="form-group">
            <label htmlFor="board-name">Board Name</label>
            <div className="input-group">
              <input
                id="board-name"
                name="boardName"
                type="text"
                value={boardName}
                onChange={(e) => setBoardName(e.target.value)}
                onKeyPress={handleKeyPress}
                className="board-name-input"
                disabled={!isCreator()}
              />
              {isCreator() && (
                <button
                  onClick={handleUpdateBoardName}
                  disabled={!boardName.trim() || boardName === board.name || updateLoading}
                  className="update-btn"
                >
                  {updateLoading ? "Updating..." : "Update"}
                </button>
              )}
            </div>
          </div>
          
          <div className="board-info">
            <p><strong>Created:</strong> {new Date(board.createdAt).toLocaleDateString()}</p>
            <p><strong>Creator:</strong> {board.createdBy?.name || "Unknown"}</p>
            <p><strong>Members:</strong> {members.length}</p>
          </div>
        </div>

        {/* Member Management */}
        <div className="settings-section">
          <h3>Members ({members.length})</h3>
          
          {isCreator() && (
            <div className="invite-section">
              <h4>Invite New Member</h4>
              <div className="invite-input-container">
                <input
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
                
                <button
                  onClick={handleInviteUser}
                  disabled={!inviteEmail.trim() || inviteLoading}
                  className="invite-btn"
                >
                  {inviteLoading ? "Inviting..." : "Invite"}
                </button>
              </div>
            </div>
          )}

          <div className="members-list">
            {members.map((member) => (
              <div key={member._id} className="member-item">
                <div className="member-info">
                  <span className="member-name">{member.name}</span>
                  <span className="member-email">{member.email}</span>
                  {member._id === board.createdBy && (
                    <span className="creator-badge">Creator</span>
                  )}
                </div>
                
                {isCreator() && member._id !== board.createdBy && (
                  <button
                    onClick={() => handleRemoveMember(member._id)}
                    className="remove-btn"
                    title="Remove member"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Danger Zone */}
        {isCreator() && (
          <div className="settings-section danger-zone">
            <h3>Danger Zone</h3>
            <div className="danger-actions">
              <div className="danger-item">
                <div className="danger-info">
                  <h4>Delete Board</h4>
                  <p>Permanently delete this board and all its tasks. This action cannot be undone.</p>
                </div>
                <button
                  onClick={handleDeleteBoard}
                  className="delete-board-btn"
                >
                  Delete Board
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BoardSettings;