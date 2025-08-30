import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    // ADD a loading state to handle the initial session check
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // This effect now runs only once to check for a session
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
        // Signal that the check is complete
        setLoading(false);
    }, []); // Empty dependency array ensures this runs only once on initial load

    const login = async (username, password, selectedRole) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                const { token, user: userData } = data;

                if (selectedRole && userData.role !== selectedRole) {
                    throw new Error(`You tried to login as ${selectedRole}, but this account is a ${userData.role}.`);
                }

                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(userData));

                setToken(token);
                setUser(userData);

                if (userData.role === 'Manager') navigate('/verify');
                else if (userData.role === 'Broker') navigate('/dashboard');
                else if (userData.role === 'Participant') navigate('/participant-dashboard');
            } else {
                throw new Error(data.message || 'Login failed. Please check your credentials.');
            }
        } catch (error) {
            console.error("Login Error:", error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
        setToken(null);
        navigate('/');
    };

    // Expose the loading state in the context value
    const value = { user, token, isAuthenticated: !!user, loading, login, logout };

    return (
        <AuthContext.Provider value={value}>
            {/* Don't render the rest of the app until the loading check is complete */}
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};