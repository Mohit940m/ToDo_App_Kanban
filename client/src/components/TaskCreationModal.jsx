import React, { useState } from "react";
import "./TaskCreationModal.css";
import API from "../api/api";
import { toast } from "react-toastify";

function TaskCreationModal({ users, onClose, onSave, currentUser }) {
    const [newTask, setNewTask] = useState({
        title: "",
        description: "",
        assignedTo: "",
        status: "Todo",
        priority: "Medium"
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSave = async () => {
        if (!newTask.title.trim()) {
            toast.error("Task title is required");
            return;
        }

        setIsSubmitting(true);
        try {
            const taskData = {
                ...newTask,
                assignedTo: newTask.assignedTo || null
            };
            
            await onSave(taskData);
            onClose();
        } catch (error) {
            console.error("Error creating task:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle task smart assignment
    const handleSmartAssign = async () => {
        try {
            const res = await API.get("/api/users/least-busy");
            const leastBusyUser = res.data;

            setNewTask((prev) => ({
                ...prev,
                assignedTo: leastBusyUser._id,
            }));

            toast.success(`Task will be assigned to ${leastBusyUser.name}`);
        } catch (err) {
            toast.error("Smart assign failed");
        }
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

    // Get the user object for the assigned user
    const getAssignedUser = () => {
        if (!newTask.assignedTo) return null;
        return users.find(u => u._id === newTask.assignedTo);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                {/* Task Preview Card */}
                <div className="task-preview-card">
                    <div className="task-titlebar">
                        <span className="title-text">{newTask.title || "New Task"}</span>
                        <span
                            className="priority-dot"
                            style={{ backgroundColor: getPriorityColor(newTask.priority) }}
                        />
                    </div>
                    <div className="task-body">
                        <p>{newTask.description || "No description"}</p>
                        <small>
                            Assigned to: {getAssignedUser()?.name || "Unassigned"}
                        </small>
                    </div>
                </div>

                <div className="modal-header">
                    <h3>✨ Create New Task</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="modal-form">
                    {/* Title */}
                    <div className="form-group">
                        <label>Title *</label>
                        <input
                            type="text"
                            value={newTask.title}
                            onChange={(e) =>
                                setNewTask({ ...newTask, title: e.target.value })
                            }
                            placeholder="Enter task title"
                            autoFocus
                        />
                    </div>

                    {/* Description */}
                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            value={newTask.description}
                            onChange={(e) =>
                                setNewTask({ ...newTask, description: e.target.value })
                            }
                            placeholder="Enter task description (optional)"
                            rows="4"
                        />
                    </div>

                    {/* Assign To */}
                    <div className="form-group">
                        <label>Assign to</label>
                        <div className="assign-group">
                            <select
                                value={newTask.assignedTo || ""}
                                onChange={(e) => {
                                    setNewTask({
                                        ...newTask,
                                        assignedTo: e.target.value
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
                            <button 
                                onClick={handleSmartAssign} 
                                className="smart-assign-btn"
                                type="button"
                            >
                                ✨ Smart Assign
                            </button>
                        </div>
                    </div>

                    {/* Priority */}
                    <div className="form-group">
                        <label>Priority</label>
                        <select
                            value={newTask.priority}
                            onChange={(e) =>
                                setNewTask({ ...newTask, priority: e.target.value })
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
                            value={newTask.status}
                            onChange={(e) =>
                                setNewTask({ ...newTask, status: e.target.value })
                            }
                        >
                            <option value="Todo">📋 Todo</option>
                            <option value="In Progress">⚡ In Progress</option>
                            <option value="Done">✅ Done</option>
                        </select>
                    </div>
                </div>

                {/* Modal Actions */}
                <div className="modal-actions">
                    <button 
                        className="create-btn" 
                        onClick={handleSave}
                        disabled={isSubmitting || !newTask.title.trim()}
                    >
                        {isSubmitting ? "Creating..." : "✨ Create Task"}
                    </button>
                    <button className="cancel-btn" onClick={onClose}>
                        ❌ Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}

export default TaskCreationModal;