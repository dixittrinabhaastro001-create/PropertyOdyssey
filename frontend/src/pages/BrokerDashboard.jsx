// src/pages/BrokerDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import BrokerTable from '../components/BrokerTable';
import AddEntryModal from '../components/AddEntryModal';
import EditEntryModal from '../components/EditEntryModal';

const tableTabsData = Array.from({ length: 50 }, (_, i) => `TABLE ${i + 1}`);

function BrokerDashboard() {
    // 1. Get the 'token' from the useAuth hook
    const { user, token } = useAuth();
    const [activeTable, setActiveTable] = useState('table1');
    const [teams, setTeams] = useState([]);
    const [activeTeam, setActiveTeam] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingEntry, setEditingEntry] = useState(null);
    const [updateKey, setUpdateKey] = useState(0);

    const refreshData = () => { setUpdateKey(prevKey => prevKey + 1); };

    const fetchTeams = useCallback(async () => {
        // Also check for the token before fetching
        if (!activeTable || !token) return;
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/teams/${activeTable}`, {
                // 2. Add the required Authorization header to the request
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            setTeams(data);
            if (data.length > 0) {
                if (!activeTeam || !data.some(t => t._id === activeTeam._id)) {
                    setActiveTeam(data[0]);
                }
            } else {
                setActiveTeam(null);
            }
        } catch (err) {
            console.error("Failed to fetch teams:", err);
            setTeams([]);
        }
    // 3. Add 'token' to the dependency array of useCallback
    }, [activeTable, activeTeam, token]);

    useEffect(() => {
        fetchTeams();
    }, [activeTable, updateKey, fetchTeams]);

    const handleAddSuccess = () => { setIsAddModalOpen(false); refreshData(); };
    const handleUpdateSuccess = () => { setEditingEntry(null); refreshData(); };

    const formatCurrency = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);

    // The rest of your component's JSX remains the same
    return (
        <div className="container mx-auto p-4 md:p-8">
            <div className="mb-4">
                <nav className="flex flex-wrap gap-2 p-2 bg-gray-200 rounded-lg">
                    {tableTabsData.map((label, index) => (
                        <button key={label} onClick={() => setActiveTable(`table${index + 1}`)}
                            className={`flex-grow text-sm font-bold py-2 px-4 rounded-md focus:outline-none ${activeTable === `table${index + 1}` ? 'table-tab-active' : 'hover:bg-gray-300'}`}>
                            {label}
                        </button>
                    ))}
                </nav>
            </div>
            <div className="mb-6 border-b border-gray-200">
                <nav className="flex -mb-px flex-wrap">
                    {teams.length > 0 ? teams.map(team => (
                        <button key={team._id} onClick={() => setActiveTeam(team)}
                            className={`py-4 px-6 border-b-2 font-medium text-sm text-center ${activeTeam?._id === team._id ? 'tab-active' : 'text-gray-500 hover:text-gray-700'}`}>
                            {team.name}
                        </button>
                    )) : <p className="py-4 px-6 text-gray-500">No teams have been created for this table yet.</p>}
                </nav>
            </div>

            {activeTeam && (
                <div className="text-right mb-4 font-semibold text-lg">
                    <span className="text-gray-800 mr-4">{activeTeam.name} |</span>
                    <span className="text-green-700 mr-4">Wallet: {formatCurrency(activeTeam.walletBalance)}</span>
                    <span className="text-red-700">Spent: {formatCurrency(activeTeam.expenditure)}</span>
                </div>
            )}

            {activeTeam && user ? (
                <BrokerTable
                    key={updateKey + activeTeam._id}
                    activeTable={activeTable}
                    activeTeamId={activeTeam._id}
                    onEdit={(entry) => setEditingEntry(entry)}
                    onDataRefresh={refreshData}
                />
            ) : null}
            
            <div className="mt-8 text-center">
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    disabled={!activeTeam}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed">
                    Add New Entry
                </button>
            </div>
            {isAddModalOpen && (
                <AddEntryModal
                    onClose={() => setIsAddModalOpen(false)}
                    onAddSuccess={handleAddSuccess}
                    activeTable={activeTable}
                    activeTeamId={activeTeam?._id}
                />
            )}
            {editingEntry && (
                <EditEntryModal
                    entry={editingEntry}
                    onClose={() => setEditingEntry(null)}
                    onUpdateSuccess={handleUpdateSuccess}
                />
            )}
        </div>
    );
}

export default BrokerDashboard;