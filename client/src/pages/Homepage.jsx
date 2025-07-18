import React, { useState, useEffect, useRef } from "react";
import API from "../api/api"; // Adjust the path as necessary
import { useMediaQuery } from 'react-responsive';
import { useParams } from "react-router-dom";
import NavBar from "../components/navBar"; // Ensure the path is correct
import "./Homepage.css"; // optional if you want to add styles
import { toast } from "react-toastify";
import { io } from "socket.io-client";
import TaskCard from "../components/TaskCard"; // Ensure the path is correct
import TaskModal from "../components/TaskModal";
import TaskCreationModal from "../components/TaskCreationModal";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";
import ConflictResolutionModal from "../components/ConflictResolutionModal";
import ActivityLogContainer from '../components/ActivityLog/ActivityLogContainer';


const socket = io(import.meta.env.VITE_API_URL);

function Homepage() {
  // State to manage desktop activity log visibility
  const [isActivityLogVisible, setIsActivityLogVisible] = useState(true);
  const isDesktop = useMediaQuery({ query: '(min-width: 769px)' });

  const user = JSON.parse(localStorage.getItem("user"));
  const [tasks, setTasks] = useState([]);
  const [newTitle, setNewTitle] = useState("");

  const [selectedTask, setSelectedTask] = useState(null);
  const [users, setUsers] = useState([]); // Board members only
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [conflict, setConflict] = useState(null);
  const [showTaskCreationModal, setShowTaskCreationModal] = useState(false);

  // State for mobile drag and drop
  const [draggingTask, setDraggingTask] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const [pressingTask, setPressingTask] = useState(null); // For hold-to-drag visual feedback
  const dragStartTimer = useRef(null);
  const lastHoveredColumn = useRef(null);

  const { boardId } = useParams();

  // Fetch board members only
  const getBoardMembers = async () => {
    try {
      const res = await API.get(`/api/boards/${boardId}`);
      setUsers(res.data.members || []);
    } catch (error) {
      console.error("Error fetching board members", error.message);
    }
  };

  // Fetch tasks for the current board
  const getTasks = async () => {
    try {
      const res = await API.get(`/api/tasks?boardId=${boardId}`);
      setTasks(res.data);
    } catch (error) {
      console.error("Error fetching tasks", error.message);
    }
  };

  // Quick add task (from input field)
  const quickAddTask = async () => {
    try {
      if (!newTitle.trim()) return;

      const res = await API.post("/api/tasks", {
        title: newTitle,
        description: "",
        status: "Todo",
        board: boardId,
      });

      setTasks((prev) => [...prev, res.data]);
      // 🔊 Emit socket event for other users
      socket.emit("task-added", {task: res.data, boardId});

      setNewTitle("");
      toast.success("Task added successfully!");
    } catch (error) {
      console.error("Error adding task", error.message);
      toast.error("Failed to add task. Please try again.");
    }
  };

  // Create task from modal
  const createTask = async (taskData) => {
    try {
      const res = await API.post("/api/tasks", {
        ...taskData,
        board: boardId,
      });

      setTasks((prev) => [...prev, res.data]);
      // 🔊 Emit socket event for other users
      socket.emit("task-added", {task: res.data, boardId});

      toast.success("Task created successfully!");
    } catch (error) {
      console.error("Error creating task", error.message);
      toast.error("Failed to create task. Please try again.");
      throw error;
    }
  };

  // Delete task
  const deleteTask = async (id) => {
    try {
      await API.delete(`/api/tasks/${id}`);
      setTasks(prevTasks => prevTasks.filter((task) => task._id !== id));

      // 🔊 Emit socket event
      socket.emit("task-deleted", {taskId: id, boardId});
      toast.success("Task deleted successfully.");
    } catch (err) {
      console.error("Failed to delete task", err);
      toast.error("Failed to delete task. Please try again.");
    }
  };

  const handleDeleteConfirm = () => {
    if (taskToDelete) {
      deleteTask(taskToDelete._id);
      setTaskToDelete(null);
    }
  };

  const handleModalDelete = (task) => {
    setSelectedTask(null); // Close the edit modal
    setTaskToDelete(task); // Open the confirmation modal
  };

  // --- Conflict Resolution Handlers ---
  const handleOverwrite = () => {
    if (conflict) {
      handleTaskUpdate(conflict.localTask, { force: true });
    }
  };

  const handleDiscard = () => {
    if (conflict) {
      // Update local state with server's version
      setTasks(prev => prev.map(t => t._id === conflict.serverTask._id ? conflict.serverTask : t));
      setConflict(null);
      toast.info("Your changes have been discarded.");
    }
  };

  useEffect(() => {
    getTasks();
    getBoardMembers();

    // --- Socket.io event listeners for real-time updates ---
    const handleTaskAdded = (data) => {
      const newTask = data.task || data;
      if (newTask && newTask._id) {
        setTasks((prevTasks) => {
          // Check if task already exists to avoid duplicates
          const exists = prevTasks.some(task => task._id === newTask._id);
          if (!exists) {
            toast.info(`A new task was added: "${newTask.title}"`);
            return [...prevTasks, newTask];
          }
          return prevTasks;
        });
      }
    };

    const handleTaskUpdated = (updatedTask) => {
      if (updatedTask && updatedTask._id) {
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task._id === updatedTask._id ? updatedTask : task
          )
        );
        toast.info(`Task "${updatedTask.title}" was updated.`);
      }
    };

    const handleTaskDeleted = (data) => {
      const taskId = data.taskId || data.id || data;
      if (taskId) {
        setTasks((prevTasks) => {
          const deletedTask = prevTasks.find((task) => task._id === taskId);
          if (deletedTask) {
            toast.warn(`Task "${deletedTask.title}" was deleted.`);
          }
          return prevTasks.filter((task) => task._id !== taskId);
        });
      }
    };

    socket.on("task-added", handleTaskAdded);
    socket.on("task-updated", handleTaskUpdated);
    socket.on("task-deleted", handleTaskDeleted);

    // Cleanup function to remove event listeners
    return () => {
      socket.off("task-added", handleTaskAdded);
      socket.off("task-updated", handleTaskUpdated);
      socket.off("task-deleted", handleTaskDeleted);
    };
  }, []); // Remove tasks dependency to avoid stale closures

  useEffect(() => {
    const fetchTasks = async () => {
      const res = await API.get(`/api/tasks?boardId=${boardId}`);
      setTasks(res.data);
    };
    fetchTasks();

    // Socket join
    socket.emit("join-board", boardId);
  }, [boardId]);

  // Group tasks by status with safety checks
  const groupedTasks = {
    Todo: [],
    "In Progress": [],
    Done: [],
  };

  tasks.forEach((task) => {
    if (task && task.status && groupedTasks[task.status]) {
      groupedTasks[task.status].push(task);
    }
  });

  // Handle drag over
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const moveTask = async (taskId, newStatus) => {
    const task = tasks.find((t) => t._id === taskId);
    if (!task) {
      console.log("Task not found");
      return;
    }

    // Allow moving only by the creator or the assigned user.
    const isCreator = task.createdBy?._id === user._id;
    const isAssigned = task.assignedTo?._id === user._id;

    if (!isCreator && !isAssigned) {
      toast.warn("Only the creator or assigned user can move this task.");
      return;
    }

    if (task.status === newStatus) return; // No change

    try {
      // Pass the original task's updatedAt to the server for conflict check
      const res = await API.put(`/api/tasks/${taskId}`, {
        ...task,
        status: newStatus,
      });

      setTasks((prev) => prev.map((t) => (t._id === taskId ? res.data : t)));

      // 🔊 Emit socket event
      socket.emit("task-updated", {...res.data, boardId});
      toast.success(`Task moved to ${newStatus}`);
    } catch (err) {
      if (err.response && err.response.status === 409) {
        toast.warn("Could not move task due to a conflict. Board is refreshing.");
        // Refresh the entire board to get the latest state
        getTasks();
      } else {
        console.error("Failed to move task:", err);
        toast.error("Failed to move task.");
      }
    }
  };

  // Handle drag and drop for desktop
  const handleDesktopDrop = async (e, newStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    await moveTask(taskId, newStatus);
  };

  // Handle task update
  const handleTaskUpdate = async (updatedTask, options = {}) => {
    try {
      const payload = { ...updatedTask };
      if (options.force) {
        payload.force = true;
      }

      const res = await API.put(`/api/tasks/${updatedTask._id}`, payload);
      setTasks((prev) =>
        prev.map((t) => (t._id === updatedTask._id ? res.data : t))
      );
      socket.emit("task-updated", {...res.data, boardId});
      toast.success("Task updated!");
      setConflict(null); // Close conflict modal if it was open
    } catch (err) {
      if (err.response && err.response.status === 409) {
        // CONFLICT DETECTED
        toast.error("Conflict! This task was updated by someone else.");
        setSelectedTask(null); // Close the edit modal
        setConflict({
          localTask: updatedTask,
          serverTask: err.response.data.serverTask,
        });
      } else {
        toast.error("Failed to update task");
        console.error("Update error:", err);
      }
    }
  };

  // --- Mobile Drag and Drop Handlers ---

  const handleTouchStart = (e, task) => {
    // Add safety check for task object
    if (!task || !task._id) {
      console.error("Invalid task object in handleTouchStart:", task);
      return;
    }

    console.log("Drag started for task:", task._id);

    // Check permissions before starting drag
    const isCreator = task.createdBy?._id === user._id;
    const isAssigned = task.assignedTo?._id === user._id;
    if (!isCreator && !isAssigned) {
      // Silently ignore or show a toast
      return;
    }

    // Set a timer to initiate drag after a 600ms hold
    dragStartTimer.current = setTimeout(() => {
      setDraggingTask(task);
      setPressingTask(null); // End pressing state
      document.body.classList.add("mobile-drag-active"); // Prevent scrolling
      dragStartTimer.current = null;
    }, 600);

    setPressingTask(task._id); // Start pressing state for visual feedback
  };

  const handleTouchMove = (e) => {
    // If user moves finger before hold duration, cancel the drag initiation
    if (dragStartTimer.current) {
      clearTimeout(dragStartTimer.current);
      dragStartTimer.current = null;
      setPressingTask(null); // Cancel pressing state
    }

    if (!draggingTask) return;

    // Prevent screen scrolling while dragging a task
    e.preventDefault();

    const touch = e.touches[0];
    const elementUnderTouch = document.elementFromPoint(touch.clientX, touch.clientY);

    if (!elementUnderTouch) {
      setDragOverColumn(null);
      return;
    }

    const dropZone = elementUnderTouch.closest('.column');
    const newHoveredColumn = dropZone ? dropZone.dataset.status : null;

    if (newHoveredColumn !== lastHoveredColumn.current) {
      lastHoveredColumn.current = newHoveredColumn;
      setDragOverColumn(newHoveredColumn);
    }
  };

  const handleTouchEnd = async () => {
    // If user lifts finger before hold duration, cancel the drag
    if (dragStartTimer.current) {
      clearTimeout(dragStartTimer.current);
      dragStartTimer.current = null;
    }

    setPressingTask(null); // Always end pressing state on touch end

    if (!draggingTask) return;

    document.body.classList.remove("mobile-drag-active");

    if (dragOverColumn && draggingTask.status !== dragOverColumn) {
      try {
        await moveTask(draggingTask._id, dragOverColumn);
      } catch (error) {
        console.error("Failed to move task on touch end:", error);
        // State will be refreshed by the error handler in moveTask if needed
      }
    }

    // Reset states
    setDraggingTask(null);
    setDragOverColumn(null);
    lastHoveredColumn.current = null;
  };

  // Dynamic style for the homepage container to adjust for the activity log
  const homepageContainerStyle = {
    transition: 'all 0.4s ease-in-out',
    // On desktop, add a margin to make space for the activity log only if it's visible
    width: isDesktop && isActivityLogVisible ? 'calc(100% - 370px)' : '100%',
    marginRight: isDesktop && isActivityLogVisible ? '370px' : '0px',
    paddingRight: isDesktop && isActivityLogVisible ? '20px' : '0px',
  };

  return (
    <div className="homepage-container" style={homepageContainerStyle}>
      <NavBar />

      <div className="task-input">
        <input
          type="text"
          placeholder="Quick add task..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && quickAddTask()}
        />
        <div className="button-group">
          <button onClick={quickAddTask} className="quick-add-btn">
            ⚡ Quick Add
          </button>
          <button 
            onClick={() => setShowTaskCreationModal(true)} 
            className="full-add-btn"
          >
            ✨ Add Task
          </button>
        </div>
      </div>

      <div
        className="kanban-board"
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        // Also handle touch cancel events, e.g., if the touch is interrupted by the system
        onTouchCancel={handleTouchEnd}
      >
        {["Todo", "In Progress", "Done"].map((status) => (
          <div
            className={`column ${dragOverColumn === status ? 'drag-over' : ''}`}
            key={status}
            data-status={status}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDesktopDrop(e, status)}
          >
            <h3>{status}</h3>
            {groupedTasks[status].map((task) => {
              // Add safety check for task object
              if (!task || !task._id) {
                console.error("Invalid task in render:", task);
                return null;
              }
              
              return (
                <TaskCard
                  key={task._id}
                  task={task}
                  currentUser={user}
                  onClick={setSelectedTask}
                  onDeleteClick={setTaskToDelete}
                  // Mobile drag props
                  onTouchStart={handleTouchStart}
                  isMobileDragging={draggingTask?._id === task._id}
                  isPressing={pressingTask === task._id}
                />
              );
            })}
          </div>
        ))}
      </div>

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          users={users}
          onClose={() => setSelectedTask(null)}
          onSave={handleTaskUpdate}
          onDelete={handleModalDelete}
          currentUser={user}
          boardId={boardId}
        />
      )}

      {showTaskCreationModal && (
        <TaskCreationModal
          users={users}
          onClose={() => setShowTaskCreationModal(false)}
          onSave={createTask}
          currentUser={user}
        />
      )}

      {taskToDelete && (
        <DeleteConfirmationModal
          taskTitle={taskToDelete.title}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setTaskToDelete(null)}
        />
      )}

      {conflict && (
        <ConflictResolutionModal
          localTask={conflict.localTask}
          serverTask={conflict.serverTask}
          onOverwrite={handleOverwrite}
          onDiscard={handleDiscard}
        />
      )}

      {/* Activity Log - Responsive placement handled internally */}
      <ActivityLogContainer
        isDesktopVisible={isActivityLogVisible}
        onToggleDesktopVisibility={() => setIsActivityLogVisible(prev => !prev)}
      />
    </div>
  );
}

export default Homepage;