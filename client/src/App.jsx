import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import React from "react";
import { useAuthContext } from "./contexts/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Homepage from "./pages/Homepage"; // This is your Board component
import BoardSettings from "./pages/BoardSettings";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  // Use AuthContext instead of Auth0
  const { isAuthenticated, login, logout, user, loading } = useAuthContext();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />}
        />
        <Route
          path="/dashboard"
          element={isAuthenticated ? <Dashboard user={user} /> : <Navigate to="/login" />}
        />
        <Route
          path="/board/:boardId"
          element={isAuthenticated ? <Homepage user={user} /> : <Navigate to="/login" />}
        />
        <Route
          path="/board/:boardId/settings"
          element={isAuthenticated ? <BoardSettings user={user} /> : <Navigate to="/login" />}
        />
        <Route
          path="/login"
          element={!isAuthenticated ? <Login login={login} /> : <Navigate to="/dashboard" />}
        />
        <Route
          path="/register"
          element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />}
        />
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} />
    </BrowserRouter>
  );
}

export default App;