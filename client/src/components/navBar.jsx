import React from 'react'
import { useNavigate } from 'react-router-dom'
import './navBar.css'
import { Pointer } from 'lucide-react';




const navBar = () => {
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem("user"));

    const handleLogout = () => {
        localStorage.removeItem("user");
        window.location.reload();
    };
    return (
        <div>
            <div className="navbar">
                <h2>Kanban Board</h2>
                <div>
                    <div onClick={() => navigate("/dashboard")} style={{ cursor: "pointer" }}>
                        <span>{user?.name}</span>
                    </div>
                    <button onClick={handleLogout}>Logout</button>
                </div>
            </div>
        </div>
    )
}

export default navBar
