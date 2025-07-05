
import React from "react";
import { useState, useEffect } from "react";
import API from "../api/api"; // Adjust the path as necessary
import NavBar from "../components/navBar"; // Ensure the path is correct
import "./Homepage.css"; // optional if you want to add styles
import { toast } from "react-toastify";
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_API_URL);

function Homepage() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [tasks, setTasks] = useState([]);
  const [newTitle, setNewTitle] = useState("");

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
  //
  const handleDrop = async (e, newStatus) => {
    const taskId = e.dataTransfer.getData("taskId");
    const task = tasks.find((t) => t._id === taskId);
    if (!task || task.status === newStatus) return;

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
    } catch (err) {
      toast.error("Failed to move task.");
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
        />
        <button onClick={addTask}>Add Task</button>
      </div>

      <div className="kanban-board">
        {["Todo", "In Progress", "Done"].map((status) => (
          <div
            className="column"
            key={status}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, status)}
          >
            <h3>{status}</h3>
            {groupedTasks[status].map((task) => (
              <div
                key={task._id}
                className="task-card"
                draggable
                onDragStart={(e) => e.dataTransfer.setData("taskId", task._id)}
              >
                <h4>{task.title}</h4>
                <p>Assigned to: {task.assignedTo?.name || "Unassigned"}</p>
                <p>Created by: {task.createdBy?.name}</p>
                <button onClick={() => deleteTask(task._id)}>Delete</button>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Homepage;
