import React, { useState, useEffect } from "react";
import "./TaskModal.css";
import API from "../api/api";
import { toast } from "react-toastify";

function TaskModal({ task, users, onClose, onSave, onDelete, currentUser, boardId }) {
    const [editedTask, setEditedTask] = useState({ ...task });
    const [isEditingDescription, setIsEditingDescription] = useState(false);

    // Determine if the current user is the creator of the task
    const isCreator = task.createdBy?._id === currentUser?._id;
    const isAssigned = task.assignedTo?._id === currentUser?._id;

    // Define editing permissions based on user role
    const canEditTitle = isCreator;
    const canEditDescription = isCreator || isAssigned;
    const canEditAssignments = isCreator; // For Priority and Assignee
    const canTakeAction = isCreator || isAssigned;

    // Sync editedTask with initial task data when task prop changes
    useEffect(() => {
        setEditedTask({ ...task });
    }, [task]);

    const handleSave = () => {
        onSave(editedTask);
        onClose();
    };

    const handleDelete = () => {
        onDelete(task);
    };

    // Function to get priority color based on task priority
    const getPriorityColor = (priority) => {
        switch (priority) {
            case "High":
                return "#ff4444";
            case "Medium":
                return "#ff8800";
            case "Low":
                return "#00aa00";
            default:
                return "#888";
        }
    };

    // Format date to a readable string
    const formatDate = (dateString) => {
        if (!dateString) return "Unknown";
        const date = new Date(dateString);
        return date.toLocaleDateString() + " at " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Get the user object for the assigned user
    const getAssignedUser = () => {
        if (!editedTask.assignedTo) return null;
        if (typeof editedTask.assignedTo === 'object') {
            return editedTask.assignedTo;
        }
        return users.find(u => u._id === editedTask.assignedTo);
    };

    // Get the user object for the creator of the task
    const getCreatedByUser = () => {
        if (!task.createdBy) return null;
        if (typeof task.createdBy === 'object') {
            return task.createdBy;
        }
        return users.find(u => u._id === task.createdBy);
    };

    // Handle task smart assignment
    const handleSmartAssign = async () => {
        if (!boardId) {
            console.error("Board ID is missing!");
            toast.error("Board ID is missing!");
            return;
        }

        try {
            const res = await API.get(`/api/users/least-busy/${boardId}`);
            const leastBusyUser = res.data;

            // Assign the task to the least busy user
            setEditedTask({
                ...editedTask,
                assignedTo: leastBusyUser
            });

            toast.success(`Task assigned to ${leastBusyUser.name}`);
            console.log("Least busy user:", leastBusyUser);

        } catch (err) {
            console.error("Failed to find least busy user:", err);
            toast.error("Failed to find least busy user");
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                {/* Task Preview Card */}
                <div className="task-preview-card">
                    <div className="task-titlebar">
                        <span className="title-text">{editedTask.title}</span>
                        <span
                            className="priority-dot"
                            style={{ backgroundColor: getPriorityColor(editedTask.priority) }}
                        />
                    </div>
                    <div className="task-body">
                        <p>{editedTask.description || "No description"}</p>
                        <small>
                            Assigned to: {getAssignedUser()?.name || "Unassigned"}
                        </small>
                    </div>
                </div>

                <div className="modal-header">
                    <h3>Edit Task</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="modal-form">
                    {/* Title */}
                    <div className="form-group">
                        <label>Title</label>
                        <input
                            type="text"
                            value={editedTask.title}
                            onChange={(e) =>
                                setEditedTask({ ...editedTask, title: e.target.value })
                            }
                            placeholder="Enter task title"
                            disabled={!canEditTitle}
                        />
                    </div>

                    {/* Description */}
                    <div className="form-group">
                        <label>Description</label>
                        {isEditingDescription ? (
                            <div className="description-edit">
                                <textarea
                                    value={editedTask.description || ""}
                                    onChange={(e) =>
                                        setEditedTask({ ...editedTask, description: e.target.value })
                                    }
                                    placeholder="Enter task description"
                                    rows="4"
                                />
                                <div className="description-actions">
                                    <button
                                        className="save-desc-btn"
                                        onClick={() => setIsEditingDescription(false)}
                                    >
                                        Save
                                    </button>
                                    <button
                                        className="cancel-desc-btn"
                                        onClick={() => {
                                            setEditedTask({ ...editedTask, description: task.description });
                                            setIsEditingDescription(false);
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div
                                className={`description-display ${!canEditDescription ? 'disabled' : ''}`}
                                onClick={canEditDescription ? () => setIsEditingDescription(true) : undefined}
                            >
                                <p>{editedTask.description || (canEditDescription ? "Click to add description..." : "No description")}</p>
                                {canEditDescription && (
                                    <span className="edit-icon">✏️</span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Assign To */}
                    <div className="form-group">
                        <label>Assign to</label>
                        <div className="assign-group">
                            <select
                                disabled={!canEditAssignments}
                                value={editedTask.assignedTo?._id || editedTask.assignedTo || ""}
                                onChange={(e) => {
                                    const selectedUser = users.find(u => u._id === e.target.value);
                                    setEditedTask({
                                        ...editedTask,
                                        assignedTo: selectedUser || null
                                    });
                                }}
                            >
                                <option value="">👤 Unassigned</option>
                                {users.map((user) => (
                                    <option key={user._id} value={user._id}>
                                        👤 {user.name} ({user.email})
                                    </option>
                                ))}
                            </select>
                            <button onClick={() => handleSmartAssign(task)} className="smart-assign-btn" disabled={!canEditAssignments}>
                                ✨ Smart Assign
                            </button>
                        </div>
                    </div>

                    {/* Priority */}
                    <div className="form-group">
                        <label>Priority</label>
                        <select
                            disabled={!canEditAssignments}
                            value={editedTask.priority}
                            onChange={(e) =>
                                setEditedTask({ ...editedTask, priority: e.target.value })
                            }
                        >
                            <option value="Low">🟢 Low Priority</option>
                            <option value="Medium">🟡 Medium Priority</option>
                            <option value="High">🔴 High Priority</option>
                        </select>
                    </div>

                    {/* Status */}
                    <div className="form-group">
                        <label>Status</label>
                        <select
                            disabled={!canTakeAction}
                            value={editedTask.status}
                            onChange={(e) =>
                                setEditedTask({ ...editedTask, status: e.target.value })
                            }
                        >
                            <option value="Todo">📋 Todo</option>
                            <option value="In Progress">⚡ In Progress</option>
                            <option value="Done">✅ Done</option>
                        </select>
                    </div>
                </div>

                {/* Task Metadata */}
                <div className="task-metadata">
                    <div className="metadata-item">
                        <span className="metadata-label">Created:</span>
                        <span className="metadata-value">
                            {formatDate(task.createdAt)}
                            {getCreatedByUser() && ` by ${getCreatedByUser().name}`}
                        </span>
                    </div>
                    {task.updatedAt && task.updatedAt !== task.createdAt && (
                        <div className="metadata-item">
                            <span className="metadata-label">Last updated:</span>
                            <span className="metadata-value">{formatDate(task.updatedAt)}</span>
                        </div>
                    )}
                    <div className="metadata-item">
                        <span className="metadata-label">Task ID:</span>
                        <span className="metadata-value task-id">{task._id}</span>
                    </div>
                </div>

                {/* Modal Actions */}
                <div className="modal-actions">
                    {isCreator && (
                        <button className="delete-btn" onClick={handleDelete}>
                            🗑️ Delete Task
                        </button>
                    )}
                    {canTakeAction && (
                        <>
                            <button className="save-btn" onClick={handleSave}>
                                💾 Save Changes
                            </button>
                            <button className="cancel-btn" onClick={onClose}>
                                ❌ Cancel
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default TaskModal;