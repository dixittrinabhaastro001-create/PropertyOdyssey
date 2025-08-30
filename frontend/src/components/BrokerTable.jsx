// src/components/BrokerTable.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2
}).format(amount);

function BrokerTable({ activeTable, activeTeamId, onEdit, onDataRefresh }) {
    // 1. Get the 'token' from useAuth. It is required.
    const { token } = useAuth();
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            // 2. Add a check for the token before fetching
            if (!activeTable || !activeTeamId || !token) {
                setLoading(false);
                setEntries([]);
                return;
            }

            setLoading(true);
            setError(null);
            try {
                // 3. Add the Authorization header to the GET request
                const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/entries/${activeTeamId}?table=${activeTable}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!res.ok) throw new Error(`Server responded with status: ${res.status}`);
                const data = await res.json();
                setEntries(data);
            } catch (err) {
                console.error("Failed to fetch team data:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    // 4. Add the token to the dependency array
    }, [activeTable, activeTeamId, token]);

    const deleteEntry = async (id) => {
        if (!window.confirm('Are you sure you want to delete this entry?')) return;
        try {
            // 5. Add the Authorization header to the DELETE request
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/entries/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!res.ok) throw new Error(`Server responded with status: ${res.status}`);
            onDataRefresh();
        } catch (err) {
            console.error("Failed to delete entry:", err);
            alert("Error: Could not delete the entry.");
        }
    };

    if (loading) return <div className="text-center py-10">Loading entries...</div>;
    if (error) return <div className="text-center text-red-600 py-10"><p className="font-semibold">Error loading data: {error}</p></div>;
    if (entries.length === 0) return <div className="text-center text-gray-500 py-10">No entries for this team yet.</div>;

    const total = entries.reduce((acc, e) => acc + (e.finalTotal || 0), 0);

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full text-sm bg-white shadow-md rounded-lg">
                <thead className="bg-gray-100">
                    <tr className="text-left text-gray-600">
                        <th className="px-4 py-2 text-center">S.No</th>
                        <th className="px-4 py-2">Name</th>
                        <th className="px-4 py-2 text-right">Amount</th>
                        <th className="px-4 py-2 text-right">Broker %</th>
                        <th className="px-4 py-2 text-right">Final</th>
                        <th className="px-4 py-2 text-center">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {entries.map((item, i) => (
                        <tr key={item._id} className="border-b hover:bg-gray-50">
                            <td className="px-4 py-3 text-center">{i + 1}</td>
                            <td className="px-4 py-3 font-medium">{item.name}</td>
                            <td className="px-4 py-3 text-right">{formatCurrency(item.grandTotal)}</td>
                            <td className="px-4 py-3 text-right text-green-600 font-medium">{item.brokeragePercent}%</td>
                            <td className="px-4 py-3 text-right font-semibold">{formatCurrency(item.finalTotal)}</td>
                            <td className="px-4 py-3 text-center">
                                <>
                                    <button onClick={() => onEdit(item)} className="text-blue-600 hover:text-blue-800 font-medium mr-3">Edit</button>
                                    <button onClick={() => deleteEntry(item._id)} className="text-red-500 hover:text-red-700 font-medium">Delete</button>
                                </>
                            </td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr className="font-bold bg-gray-100">
                        <td colSpan="5" className="text-right px-4 py-3">Total</td>
                        <td className="text-right px-4 py-3 text-blue-700 text-base">{formatCurrency(total)}</td>
                    </tr>
                </tfoot>
            </table>
        </div>
    );
}

export default BrokerTable;