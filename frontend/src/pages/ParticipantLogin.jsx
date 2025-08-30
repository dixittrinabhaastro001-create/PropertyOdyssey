// src/pages/ParticipantLogin.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

function ParticipantLogin() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            // We pass the role explicitly here to distinguish from the main login
            await login(username, password, 'Participant');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 font-sans">
            <div className="w-full max-w-md m-4">
                <div className="bg-white p-8 md:p-10 rounded-xl shadow-lg border-t-4 border-green-600">
                    <h1 className="text-3xl font-serif font-bold text-center text-gray-800 mb-2">Team Login</h1>
                    <p className="text-center text-gray-500 mb-8">Enter your team credentials to view your dashboard.</p>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">Team Username</label>
                            <input type="text" id="username" value={username} onChange={e => setUsername(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg" required />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                            <input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg" required />
                        </div>
                        {error && <div className="text-red-500 text-sm text-center font-medium">{error}</div>}
                        <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105 duration-300 shadow-lg">
                            Login as Participant
                        </button>
                    </form>
                    
                    <div className="text-center mt-6">
                        <Link to="/" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
                            &larr; Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );

}

export default ParticipantLogin;