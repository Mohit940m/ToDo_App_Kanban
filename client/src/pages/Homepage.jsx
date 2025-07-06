import React from "react";
import { useState, useEffect } from "react";
import API from "../api/api"; // Adjust the path as necessary
import NavBar from "../components/navBar"; // Ensure the path is correct
import "./Homepage.css"; // optional if you want to add styles
import { toast } from "react-toastify";
import { io } from "socket.io-client";
import TaskCard from "../components/TaskCard"; // Ensure the path is correct
import TaskModal from "../components/TaskModal";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";
import ConflictResolutionModal from "../components/ConflictResolutionModal";


const socket = io(import.meta.env.VITE_API_URL);

function Homepage() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [tasks, setTasks] = useState([]);
  const [newTitle, setNewTitle] = useState("");

  const [selectedTask, setSelectedTask] = useState(null);
  const [users, setUsers] = useState([]); // Populate from API
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [conflict, setConflict] = useState(null);

  // Fetch users
  const getUsers = async () => {
    try {
      const res = await API.get("/api/users");
      setUsers(res.data);
    } catch (error) {
      console.error("Error fetching users", error.message);
    }
  };

  // Fetch tasks
  const getTasks = async () => {
    try {
      const res = await API.get("/api/tasks");
      setTasks(res.data);
    } catch (error) {
      console.error("Error fetching tasks", error.message);
    }
  };

  // Create task
  const addTask = async () => {
    try {
      if (!newTitle.trim()) return;

      const res = await API.post("/api/tasks", {
        title: newTitle,
        description: "",
        status: "Todo",
      });

      setTasks((prev) => [...prev, res.data]);
      // 🔊 Emit socket event for other users
      socket.emit("task-added", res.data);

      setNewTitle("");
      toast.success("Task added successfully!");
    } catch (error) {
      console.error("Error adding task", error.message);
      toast.error("Failed to add task. Please try again.");
    }
  };

  // Delete task
  const deleteTask = async (id) => {
    try {
      await API.delete(`/api/tasks/${id}`);
      setTasks(tasks.filter((task) => task._id !== id))

      // 🔊 Emit socket event
      socket.emit("task-deleted", id);
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
    getUsers();

    // --- Socket.io event listeners for real-time updates ---

    socket.on("task-added", (newTask) => {
      setTasks((prevTasks) => [...prevTasks, newTask]);
      toast.info(`A new task was added: "${newTask.title}"`);
    });

    // Socket.io event listeners
    socket.on("task-updated", (updatedTask) => {
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === updatedTask._id ? updatedTask : task
        )
      );
      toast.info(`Task "${updatedTask.title}" was updated.`);
    });

    socket.on("task-deleted", (taskId) => {
      // Find task before filtering to show its name in the toast
      const deletedTask = tasks.find((task) => task._id === taskId);
      setTasks((prevTasks) =>
        prevTasks.filter((task) => task._id !== taskId)
      );
      if (deletedTask) {
        toast.warn(`Task "${deletedTask.title}" was deleted.`);
      }
    });

    // Cleanup function to remove event listeners
    return () => {
      socket.off("task-added");
      socket.off("task-updated");
      socket.off("task-deleted");
    };
  }, [tasks]); // Add `tasks` to dependency array to avoid stale state in listeners

  // Group tasks by status
  const groupedTasks = {
    Todo: [],
    "In Progress": [],
    Done: [],
  };

  tasks.forEach((task) => {
    if (groupedTasks[task.status]) {
      groupedTasks[task.status].push(task);
    }
  });

  // Handle drag over
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Handle drag and drop
  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    
    const taskId = e.dataTransfer.getData("taskId");
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
    
    if (task.status === newStatus) return;

    try {
      // Pass the original task's updatedAt to the server for conflict check
      const res = await API.put(`/api/tasks/${taskId}`, {
        ...task,
        status: newStatus,
      });

      setTasks((prev) => prev.map((t) => (t._id === taskId ? res.data : t)));

      // 🔊 Emit socket event
      socket.emit("task-updated", res.data);
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
      socket.emit("task-updated", res.data);
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



  return (
    <div className="homepage-container">
      <NavBar />

      <div className="task-input">
        <input
          type="text"
          placeholder="Enter task title"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTask()}
        />
        <button onClick={addTask}>Add Task</button>
      </div>

      <div className="kanban-board">
        {["Todo", "In Progress", "Done"].map((status) => (
          <div
            className="column"
            key={status}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, status)}
          >
            <h3>{status}</h3>
            {groupedTasks[status].map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onClick={setSelectedTask}
                currentUser={user}
                onDeleteClick={setTaskToDelete}
              />
            ))}
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
    </div>
  );
}

export default Homepage;