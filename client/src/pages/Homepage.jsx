import React from "react";
import { useState, useEffect } from "react";
import API from "../api/api"; // Adjust the path as necessary
import NavBar from "../components/navBar"; // Ensure the path is correct
import "./Homepage.css"; // optional if you want to add styles
import { toast } from "react-toastify";
import { io } from "socket.io-client";
import TaskCard from "../components/TaskCard"; // Ensure the path is correct
import TaskModal from "../components/TaskModal";


const socket = io(import.meta.env.VITE_API_URL);

function Homepage() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [tasks, setTasks] = useState([]);
  const [newTitle, setNewTitle] = useState("");

  const [selectedTask, setSelectedTask] = useState(null);
  const [users, setUsers] = useState([]); // Populate from API

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

  useEffect(() => {
    getTasks();
    getUsers();

    // Socket.io event listeners
    socket.on("task-updated", (updatedTask) => {
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === updatedTask._id ? updatedTask : task
        )
      );
    });

    socket.on("task-deleted", (taskId) => {
      setTasks((prevTasks) =>
        prevTasks.filter((task) => task._id !== taskId)
      );
    });

    // Cleanup function to remove event listeners
    return () => {
      socket.off("task-updated");
      socket.off("task-deleted");
    };
  }, []);

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

    // Allow moving unassigned tasks or tasks assigned to current user
    if (task.assignedTo && task.assignedTo._id !== user._id) {
      toast.warn("Only assigned user can move this task");
      return;
    }
    
    if (task.status === newStatus) return;

    try {
      const res = await API.put(`/api/tasks/${taskId}`, {
        ...task,
        status: newStatus,
      });

      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? res.data : t))
      );

      // 🔊 Emit socket event
      socket.emit("task-updated", res.data);
      toast.success(`Task moved to ${newStatus}`);
    } catch (err) {
      console.error("Failed to move task:", err);
      toast.error("Failed to move task.");
    }
  };

  // Handle task update
  const handleTaskUpdate = async (updatedTask) => {
    try {
      const res = await API.put(`/api/tasks/${updatedTask._id}`, updatedTask);
      setTasks((prev) =>
        prev.map((t) => (t._id === updatedTask._id ? res.data : t))
      );
      socket.emit("task-updated", res.data);
      toast.success("Task updated!");
    } catch (err) {
      toast.error("Failed to update task");
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
        />
      )}
    </div>
  );
}

export default Homepage;