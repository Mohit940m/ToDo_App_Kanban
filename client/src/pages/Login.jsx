import React, { useState } from "react";
import API from "../api/api";
import { useNavigate, Link } from "react-router-dom";
import "./../components/AuthForm.css";

function Login() {
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
      const res = await API.post("/api/users/login", { email, password });
      localStorage.setItem("user", JSON.stringify(res.data));
      // Redirect to homepage after successful login
      window.location.href = "/";
      navigate("/");
      
    } catch (err) {
      if (err.response) {
        // The server responded with an error status code (4xx or 5xx)
        if (err.response.data && err.response.data.message) {
          // Use the error message from the backend if available
          setError(err.response.data.message);
        } else if (err.response.status === 401 || err.response.status === 400) {
          setError("Invalid email or password.");
        } else {
          setError("An unexpected error occurred. Please try again.");
        }
      } else if (err.request) {
        // The request was made but no response was received
        setError("Network error. Please check your connection.");
      } else {
        // Something else happened in setting up the request that triggered an Error
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
