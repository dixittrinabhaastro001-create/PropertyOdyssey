// src/pages/ParticipantDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

const formatCurrency = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);

function ParticipantDashboard() {
    // 1. Get the 'token' from the useAuth hook.
    const { user, logout, token } = useAuth();
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        // 2. Check for the user and the token. The server gets the teamId from the token.
        if (!user || !token) {
             setLoading(false);
             return;
        }
        setLoading(true);
        try {
            // 3. Use the correct GET endpoint from your server.
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/participant/dashboard`, {
                // 4. A GET request doesn't need a method or body.
                // 5. Add the required Authorization header.
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!res.ok) throw new Error("Could not fetch team data.");
            const data = await res.json();
            setDashboardData(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    // 6. Add 'token' to the dependency array.
    }, [user, token]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (loading) {
        return <div className="text-center p-10">Loading Team Data...</div>;
    }

    if (!dashboardData) {
        return <div className="text-center p-10 text-red-500">Could not load dashboard. Please try logging in again.</div>;
    }

    const { teamData, purchaseHistory } = dashboardData;

    return (
        <div className="bg-gray-50 min-h-screen">
            <header className="bg-white shadow-sm">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
                    <h1 className="text-xl font-bold text-gray-800">
                        {teamData.name} - {teamData.tableId.replace('table', 'Table ')}
                    </h1>
                    <button onClick={logout} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg text-sm">
                        Logout
                    </button>
                </div>
            </header>

            <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                {/* Team Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-lg font-semibold text-gray-500 mb-2">Remaining Wallet</h2>
                        <p className="text-4xl font-bold text-green-600">{formatCurrency(teamData.walletBalance)}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-lg font-semibold text-gray-500 mb-2">Total Spent</h2>
                        <p className="text-4xl font-bold text-red-600">{formatCurrency(teamData.expenditure)}</p>
                    </div>
                </div>

                {/* Purchase History */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Purchase History</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-100">
                                <tr className="text-left text-gray-600">
                                    <th className="px-4 py-2">Property Name</th>
                                    <th className="px-4 py-2">Category</th>
                                    <th className="px-4 py-2 text-right">Purchase Price</th>
                                    <th className="px-4 py-2 text-right">Annual Rent</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {purchaseHistory.length > 0 ? purchaseHistory.map(entry => (
                                    <tr key={entry._id}>
                                        <td className="px-4 py-3 font-medium">{entry.name}</td>
                                        <td className="px-4 py-3">{entry.category}</td>
                                        <td className="px-4 py-3 text-right font-semibold">{
                                            (() => {
                                                if (entry.owners && entry.owners.length > 0 && user && user.teamId) {
                                                    const owner = entry.owners.find(o => o.team === user.teamId || o.team?._id === user.teamId);
                                                    return owner ? formatCurrency(owner.totalCost) : formatCurrency(entry.totalCost);
                                                }
                                                return formatCurrency(entry.totalCost);
                                            })()
                                        }</td>
                                        <td className="px-4 py-3 text-right text-green-700 font-semibold">{
                                            (() => {
                                                if (entry.owners && entry.owners.length > 0 && user && user.teamId) {
                                                    const owner = entry.owners.find(o => o.team === user.teamId || o.team?._id === user.teamId);
                                                    return owner ? formatCurrency(owner.annualRent) : formatCurrency(entry.annualRent);
                                                }
                                                return formatCurrency(entry.annualRent);
                                            })()
                                        }</td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="4" className="text-center py-10 text-gray-500">No properties purchased yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default ParticipantDashboard;