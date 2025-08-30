// src/components/Layout.jsx
import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Layout() {
    const { user, logout } = useAuth();
    const navLinkStyles = ({ isActive }) => ({
        fontWeight: isActive ? 'bold' : 'normal',
        color: isActive ? '#0d6efd' : 'black'
    });

    return (
        <div>
            <nav className="bg-white shadow-md">
                <div className="container mx-auto px-4 flex justify-between items-center h-16">
                    <div className="flex items-center gap-6">
                        {/* This link is updated to point to /dashboard */}
                        {user?.role === 'Broker' && <NavLink to="/dashboard" style={navLinkStyles}>Broker Dashboard</NavLink>}
                        {user?.role === 'Manager' && <NavLink to="/verify" style={navLinkStyles}>Verification System</NavLink>}
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-gray-700">Welcome, {user?.username} ({user?.role})</span>
                        <button onClick={logout} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg text-sm">
                            Logout
                        </button>
                    </div>
                </div>
            </nav>
            <main>
                <Outlet />
            </main>
        </div>
    );
}

export default Layout;