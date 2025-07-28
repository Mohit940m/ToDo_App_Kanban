import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth0 } from "@auth0/auth0-react"
import './navBar.css'
import { Pointer } from 'lucide-react';

const NavBar = () => {
    const navigate = useNavigate();
    const { isAuthenticated, loginWithRedirect, logout, user } = useAuth0();

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
                            <button onClick={() => logout({ returnTo: window.location.origin })}>
                                Log Out
                            </button>
                        </>
                    ) : (
                        <button onClick={() => loginWithRedirect()}>
                            Log In
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

export default NavBar
