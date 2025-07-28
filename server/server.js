const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const userRoutes = require("./routes/userRoutes");
const taskRoutes = require("./routes/taskRoutes");
const boardRoutes = require("./routes/boardRoutes");
const actionRoutes = require("./routes/actionRoutes");

const http = require("http");
const { Server } = require("socket.io");
const { auth } = require("express-openid-connect");

// Initialize environment variables first
dotenv.config();

// Auth0 configuration - after dotenv.config()
const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.AUTH0_SECRET,
  baseURL: process.env.BASE_URL,
  clientID: process.env.AUTH0_CLIENT_ID,
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`,
};

// Debug Auth0 configuration
console.log('Auth0 Configuration:');
console.log('- Secret:', process.env.AUTH0_SECRET ? '***SET***' : 'NOT SET');
console.log('- Base URL:', process.env.BASE_URL);
console.log('- Client ID:', process.env.AUTH0_CLIENT_ID);
console.log('- Issuer Base URL:', `https://${process.env.AUTH0_DOMAIN}`);

// Connect to the database
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

  socket.on("join-board", (boardId) => {
    socket.join(boardId);
    console.log(`User ${socket.id} joined board: ${boardId}`);
  });

  // Listen for task updates
  socket.on("task-updated", (data) => {
    const { boardId, ...taskData } = data;
    if (boardId) {
      socket.to(boardId).emit("task-updated", taskData);
      console.log("Task updated and broadcasted to board:", boardId);
    }
  });

  // Listen for task deletion
  socket.on("task-deleted", (data) => {
    const { taskId, boardId } = data;
    if (boardId && taskId) {
      socket.to(boardId).emit("task-deleted", { taskId });
      console.log("Task deleted and broadcasted to board:", boardId);
    }
  });

  // Listen for new task addition
  socket.on("task-added", (data) => {
    const { task, boardId } = data;
    if (boardId && task) {
      socket.to(boardId).emit("task-added", { task });
      console.log("Task added and broadcasted to board:", boardId);
    }
  });

  // Listen for activity log events (though these are handled automatically by logAction)
  socket.on("activity-logged", (data) => {
    const { activity, boardId } = data;
    if (boardId && activity) {
      socket.to(boardId).emit("activity-logged", activity);
      console.log("Activity logged and broadcasted to board:", boardId);
    }
  });
  
  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

app.use(cors({
    // origin: process.env.CLIENT_URL,
    origin:"*",
    optionsSuccessStatus: 200, // Allow all origins (for development purposes; adjust for production)
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
}));
app.use(express.json());

// Temporarily disable Auth0 middleware to test frontend
// app.use(auth(config));

app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/boards", boardRoutes);
app.use("/api/actions", actionRoutes);

// Define routes
app.get('/', (req, res) =>{
    res.send('API is running...');
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);