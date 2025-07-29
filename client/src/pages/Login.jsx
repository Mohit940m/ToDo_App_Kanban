import React from "react";
import { Link } from "react-router-dom";
import "./../components/AuthForm.css";

// Accept login function as a prop from App.jsx
function Login({ login }) {
  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Welcome to Kanban Board</h2>
        <p>Please log in to access your boards and tasks.</p>
        
        <button 
          onClick={login}
          className="auth-button"
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: 'pointer',
            marginTop: '20px'
          }}
        >
          Log In with Auth0
        </button>
        
        <p style={{ marginTop: '20px', textAlign: 'center' }}>
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;