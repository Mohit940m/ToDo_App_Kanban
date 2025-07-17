import React, { useState } from "react";
import API from "../api/api";
import { useNavigate, Link } from "react-router-dom";
import "./../components/AuthForm.css";

// Accept onLoginSuccess as a prop
function Login({ onLoginSuccess }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    const { email, password } = form;

    // Basic client-side validation
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      const loginRes = await API.post("/api/users/login", { email, password });

      // Call the prop function to update the user state in App.jsx
      if (onLoginSuccess) {
        onLoginSuccess(loginRes.data);
      }
      // localStorage.setItem("user", JSON.stringify(loginRes.data)); // This is now handled by onLoginSuccess

      // After successful login, check for boards and redirect accordingly.
      const res = await API.get("/api/users/dashboard");
      const { boards, lastActiveBoard } = res.data;

      if (boards.length > 0) {
        const boardToOpen = lastActiveBoard?._id || boards[0]?._id;
        console.log("Navigating to board:", `/board/${boardToOpen}`);
        navigate(`/board/${boardToOpen}`);
      } else {
        console.log("Navigating to dashboard.");
        navigate("/dashboard"); // no boards joined/created yet
      }
    } catch (err) {
      if (err.response) {
        if (err.response.data && err.response.data.message) {
          setError(err.response.data.message);
        } else if (err.response.status === 401 || err.response.status === 400) {
          setError("Invalid email or password.");
        } else {
          setError("An unexpected error occurred. Please try again.");
        }
      } else if (err.request) {
        setError("Network error. Please check your connection.");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Login</h2>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          required
          onChange={handleChange}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          required
          onChange={handleChange}
        />
        {error && <p className="auth-error" style={{ color: "red" }}>{error}</p>}
        <button type="submit">Login</button>
        <p>
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;