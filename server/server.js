const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const userRoutes = require("./routes/userRoutes");
const taskRoutes = require("./routes/taskRoutes");
const actionRoutes = require("./routes/actionRoutes");

const http = require("http");
const { Server } = require("socket.io");

// Initialize environment variables and connect to the database
dotenv.config();
connectDB();

const app = express();

const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL, // from .env
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

// Make io instance available globally
global.io = io;

io.on("connection", (socket) => {
  console.log("👤 New user connected:", socket.id);

  // Listen for task updates
  socket.on("task-updated", (data) => {
    socket.broadcast.emit("task-updated", data); // broadcast to all other clients
    console.log("Task updated:", data);
  });

  // Listen for task deletion
  socket.on("task-deleted", (taskId) => {
    socket.broadcast.emit("task-deleted", taskId);
  });

  // Listen for new task addition
  socket.on("task-added", (task) => {
    socket.broadcast.emit("task-added", task);
  });

  // Listen for activity log events (though these are handled automatically by logAction)
  socket.on("activity-logged", (activity) => {
    socket.broadcast.emit("activity-logged", activity);
  });
  
  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
}));
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/actions", actionRoutes);

// Define routes
app.get('/', (req, res) =>{
    res.send('API is running...');
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);