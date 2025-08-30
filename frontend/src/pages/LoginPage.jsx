// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

function LoginPage() {
    const [role, setRole] = useState('Broker'); // user-chosen role
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            // pass selected role to AuthContext.login
            await login(username, password, role);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-sky-100 to-indigo-200 font-sans">
            <div className="w-full max-w-md m-4">
                <div className="bg-white p-8 md:p-10 rounded-xl shadow-2xl border-t-4 border-blue-600">
                    <h1 className="text-4xl font-serif font-bold text-center text-gray-800 mb-2">Welcome Back</h1>
                    <p className="text-center text-gray-500 mb-8">Sign in to continue to your dashboard.</p>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Role selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">I am a:</label>
                            <div className="flex gap-4">
                                <label className={`flex items-center p-3 border rounded-lg flex-1 cursor-pointer transition-all ${role === 'Broker' ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-gray-300'}`}>
                                    <input type="radio" name="role" value="Broker" checked={role === 'Broker'} onChange={() => setRole('Broker')} className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
                                    <span className="ml-3 text-gray-700">Broker</span>
                                </label>
                                <label className={`flex items-center p-3 border rounded-lg flex-1 cursor-pointer transition-all ${role === 'Manager' ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-gray-300'}`}>
                                    <input type="radio" name="role" value="Manager" checked={role === 'Manager'} onChange={() => setRole('Manager')} className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
                                    <span className="ml-3 text-gray-700">Manager</span>
                                </label>
                            </div>
                        </div>

                        {/* Username */}
                        <div className="relative">
                             <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            </span>
                            <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" required />
                        </div>

                        {/* Password */}
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                            </span>
                            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" required />
                        </div>

                        {/* Error */}
                        {error && <div className="text-red-500 text-sm text-center font-medium">{error}</div>}
                        
                        {/* Submit */}
                        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105 duration-300 shadow-lg">
                            Login
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

export default LoginPage;
