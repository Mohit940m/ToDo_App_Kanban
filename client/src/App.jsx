import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import React, { useState, useEffect } from "react"; // Import useState and useEffect
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Homepage from "./pages/Homepage"; // This is your Board component
import BoardSettings from "./pages/BoardSettings";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  // 1. Manage user state here
  const [currentUser, setCurrentUser] = useState(() => {
    // Initialize state from localStorage once on mount
    try {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Failed to parse user from localStorage:", error);
      return null;
    }
  });

  // 2. Listen for changes in localStorage (optional, but good for other tabs/windows)
  // More robust approach would be to pass a setUser function down or use a context.
  // For simplicity, we'll focus on the primary issue.

  // The critical part: A function to update the user state
  // This function needs to be passed down to your Login component.
  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    // navigate('/dashboard') or navigate('/board/...') will now work from Login.jsx
    // because App.jsx will re-render with the new currentUser state.
  };

  // The critical part for logout: A function to clear user state
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("user");
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={currentUser ? <Navigate to="/dashboard" /> : <Navigate to="/login" />}
        />
        <Route
          path="/dashboard"
          element={currentUser ? <Dashboard user={currentUser} /> : <Navigate to="/login" />}
        />
        <Route
          path="/board/:boardId"
          element={currentUser ? <Homepage /> : <Navigate to="/login" />}
        />
        <Route
          path="/board/:boardId/settings"
          element={currentUser ? <BoardSettings user={currentUser} /> : <Navigate to="/login" />}
        />
        <Route
          path="/login"
          // Pass the handleLoginSuccess function to the Login component
          // Login component will call this function upon successful login.
          element={!currentUser ? <Login onLoginSuccess={handleLoginSuccess} /> : <Navigate to="/dashboard" />}
        />
        <Route
          path="/register"
          element={!currentUser ? <Register /> : <Navigate to="/dashboard" />}
        />
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} />
    </BrowserRouter>
  );
}

export default App;