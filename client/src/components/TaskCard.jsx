import React from "react";
import "./TaskCard.css";
import deleteIcon from "../assets/close.svg";

function TaskCard({ task, onClick, currentUser, onDeleteClick }) {
  // Allow dragging only for the creator or the assigned user.
  const isCreator = task.createdBy?._id === currentUser._id;
  const isAssigned = task.assignedTo?._id === currentUser._id;
  const isDraggable = isCreator || isAssigned;

  const handleDelete = (e) => {
    e.stopPropagation(); // Prevent opening the edit modal
    onDeleteClick(task);
  };

  const handleDragStart = (e) => {
    console.log("Drag started for task:", task._id);
    e.dataTransfer.setData("taskId", task._id);
    e.dataTransfer.effectAllowed = "move";
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "red";
      case "Medium":
        return "orange";
      case "Low":
        return "green";
      default:
        return "gray";
    }
  };

  return (
    <div
      className="task-card"
      onClick={() => onClick(task)}
      draggable={isDraggable}
      onDragStart={handleDragStart}
      style={{
        cursor: isDraggable ? "grab" : "default",
        opacity: isDraggable ? 1 : 0.7
      }}
    >
      {/* 🔹 Title Bar */}
      <div className="task-titlebar">
        <span className="title-text">{task.title}</span>
        <span
          className="priority-dot"
          style={{ backgroundColor: getPriorityColor(task.priority) }}
        />
      </div>

      {/* 🔹 Body */}
      <div className="task-body">
        <p>{task.description || "No description"}</p>
        <small>
          Assigned to: {task.assignedTo?.name || "Unassigned"}
        </small>
      </div>

      {/* 🔹 Delete Button */}
      {isCreator && (
        <button className="delete-task-btn" onClick={handleDelete}>
          <img src={deleteIcon} alt="Delete Task" />
        </button>
      )}
    </div>
  );
}

export default TaskCard;