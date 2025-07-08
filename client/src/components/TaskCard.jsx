import React from "react";
import "./TaskCard.css";
import deleteIcon from "../assets/close.svg";

function TaskCard({
  task,
  onClick,
  currentUser,
  onDeleteClick,
  onTouchStart,
  isMobileDragging,
  isPressing,
}) {
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
    // Use a timeout to ensure the browser has created the drag image
    // before we change the original element's style.
    setTimeout(() => {
      e.target.classList.add("dragging");
    }, 0);
  };

  const handleDragEnd = (e) => {
    e.target.classList.remove("dragging");
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

  const classNames = [
    "task-card",
    isMobileDragging && "mobile-dragging",
    isPressing && "mobile-pressing",
    !isDraggable && "not-draggable",
  ].filter(Boolean).join(" ");

  return (
    <div
      className={classNames}
      onClick={() => onClick(task)}
      draggable={isDraggable}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onTouchStart={(e) => onTouchStart(e, task)}
      style={{
        cursor: isDraggable ? "grab" : "default"
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