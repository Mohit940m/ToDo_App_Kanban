
import React from "react";
import { useState, useEffect } from "react";
import API from "../api/api"; // Adjust the path as necessary
import NavBar from "../components/navBar"; // Ensure the path is correct
import "./Homepage.css"; // optional if you want to add styles
import { toast } from "react-toastify";

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
      setTasks(tasks.filter((task) => task._id !== id));
    } catch (err) {
      console.error("Failed to delete task", err);
    }
  };

  useEffect(() => {
    getTasks();
  }, []);



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

      <div className="task-list">
        {tasks.map((task) => (
          <div className="task-card" key={task._id}>
            <h4>{task.title}</h4>
            <p>Status: {task.status}</p>
            <button onClick={() => deleteTask(task._id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Homepage;
