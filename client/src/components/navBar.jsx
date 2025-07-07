import React from 'react'
// import { useNavigate } from 'react-router-dom'
import './navBar.css'




const navBar = () => {

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
                    <span>{user?.name}</span>
                    <button onClick={handleLogout}>Logout</button>
                </div>
            </div>
        </div>
    )
}

export default navBar
