import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Homepage from "./pages/Homepage";
import BoardSettings from "./pages/BoardSettings";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
            element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />}
          />
          <Route
            path="/dashboard"
            element={user ? <Dashboard user={user} /> : <Navigate to="/login" />}
          />
          <Route
            path="/board/:boardId"
            element={user ? <Homepage /> : <Navigate to="/login" />}
          />
          <Route
            path="/board/:boardId/settings"
            element={user ? <BoardSettings user={user} /> : <Navigate to="/login" />}
          />
        <Route
          path="/login"
            element={!user ? <Login /> : <Navigate to="/dashboard" />}
        />
        <Route
          path="/register"
            element={!user ? <Register /> : <Navigate to="/dashboard" />}
        />
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} />
    </BrowserRouter>
  );
}

export default App;