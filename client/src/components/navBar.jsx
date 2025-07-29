import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from "../contexts/AuthContext"
import './navBar.css'
import { Pointer } from 'lucide-react';

const NavBar = () => {
    const navigate = useNavigate();
    const { isAuthenticated, login, logout, user } = useAuthContext();

    return (
        <div>
            <div className="navbar">
                <h2>Kanban Board</h2>
                <div>
                    {isAuthenticated ? (
                        <>
                            <div onClick={() => navigate("/dashboard")} style={{ cursor: "pointer" }}>
                                <span>{user?.name || user?.email}</span>
                            </div>
                            <button onClick={logout}>
                                Log Out
                            </button>
                        </>
                    ) : (
                        <button onClick={login}>
                            Log In
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

export default NavBar
