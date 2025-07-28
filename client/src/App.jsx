import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Homepage from "./pages/Homepage"; // This is your Board component
import BoardSettings from "./pages/BoardSettings";
import Auth0Test from "./components/Auth0Test"; // Temporary test component
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  // Use Auth0 hooks instead of localStorage and useState
  const { isAuthenticated, loginWithRedirect, logout, user, isLoading } = useAuth0();

  // Show loading spinner while Auth0 is initializing
  if (isLoading) {
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
          element={!isAuthenticated ? <Login loginWithRedirect={loginWithRedirect} /> : <Navigate to="/dashboard" />}
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