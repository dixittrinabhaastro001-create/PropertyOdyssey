// src/pages/LandingPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

function LandingPage() {
    return (
        <div className="hero-bg h-screen w-screen flex flex-col">
            <div className="overlay h-full w-full flex flex-col">
                <header className="w-full p-4">
                    <div className="container mx-auto flex justify-between items-center">
                        <span>Bulls and Bears</span>
                        <div className="flex items-center gap-4">
                            <Link to="/participant-login" className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg shadow-md hover:bg-green-700 transition duration-300">
                                Team Login
                            </Link>
                            <Link to="/login" className="bg-white text-gray-800 font-bold py-2 px-6 rounded-lg shadow-md hover:bg-gray-200 transition duration-300">
                                Admin Login
                            </Link>
                        </div>
                    </div>
                </header>
                <main className="flex-grow flex items-center justify-center text-center px-4">
                    <div className="max-w-4xl space-y-6">
                        <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-bold leading-tight text-white">
                            Property Odyssey: <br className="hidden sm:block" /> Your Real Estate Quest Begins Here
                        </h1>
                        <p className="text-lg sm:text-xl md:text-2xl text-gray-200 font-light">
                            Dive deep into the financial dynamics of the property market and uncover the secrets of real estate success.
                        </p>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default LandingPage;