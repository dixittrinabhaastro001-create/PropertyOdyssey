import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
// import { verificationData } from '../data/verificationData.js';
import TeamLedgerTable from '../components/TeamLedgerTable';


// --- Helper Components ---
const formatCurrency = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);

const DetailItem = ({ label, value }) => (
    <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium text-right" dangerouslySetInnerHTML={{ __html: value }}></span>
    </div>
);

const VerificationRow = ({ property, selectedPropertyNo, onVerify, onSelect }) => {
    const [inputValue, setInputValue] = useState('');
    const [result, setResult] = useState({ text: '', color: '' });

    useEffect(() => {
        if (property.isVerified === true) setResult({ text: 'Accepted', color: 'text-green-600' });
        else if (property.isVerified === 'rejected') setResult({ text: 'Rejected', color: 'text-red-600' });
        else setResult({ text: '', color: '' });
    }, [property.isVerified]);

    const handleVerification = () => { onVerify(property.propertyNo, inputValue); };

    return (
        <tr data-id={property.propertyNo} className={`property-row bg-white border-b hover:bg-gray-100 cursor-pointer ${selectedPropertyNo === property.propertyNo ? 'selected-row' : ''}`} onClick={() => onSelect(property.propertyNo)}>
            <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{property.name} (#{property.propertyNo})</th>
            <td className="px-6 py-4">{property.status}</td>
            <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                    <input type="number" placeholder="Enter Total Cost" className="verify-input w-full border-gray-300 rounded-md shadow-sm p-2" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onClick={(e) => e.stopPropagation()} />
                    <button className="verify-btn bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-lg" onClick={(e) => { e.stopPropagation(); handleVerification(); }}>Check</button>
                    <div className={`verify-result text-sm font-bold w-24 text-center ${result.color}`}>{result.text}</div>
                </div>
            </td>
        </tr>
    );
};

// --- Main Page Component ---



function VerificationSystem() {

    // Helper to get per-team owner object for selected property
    const getTeamOwner = (property, teamId) => {
        if (!property?.owners || !Array.isArray(property.owners)) return null;
        return property.owners.find(o => o.team === teamId);
    };
    // --- Team Wallet Management State ---

    const { user, token } = useAuth();

    const [properties, setProperties] = useState([]);
    useEffect(() => {
        async function fetchProperties() {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/properties`);
                let data = await res.json();
                // Normalize status values
                data = data.map(p => ({
                    ...p,
                    status: p.status && p.status.toLowerCase().includes('fully const') ? 'Fully Const.' : p.status
                }));
                setProperties(data);
            } catch (err) {
                setProperties([]);
            }
        }
        fetchProperties();
    }, []);
    const [filters, setFilters] = useState({ searchTerm: '', status: 'All', category: 'All' });
    const [selectedPropertyNo, setSelectedPropertyNo] = useState(null);
    const [teamActivities, setTeamActivities] = useState([]);
    const [teams, setTeams] = useState([]);
    const [newTeamName, setNewTeamName] = useState('');
    const [activeLedgerTeam, setActiveLedgerTeam] = useState(null);
    const [stampDuties, setStampDuties] = useState({ Residential: 5, Commercial: 6, Industrial: 6 });
    const [newTeamCredentials, setNewTeamCredentials] = useState(null);

    // --- State for Trade Block ---
    const [fromTeam, setFromTeam] = useState('');
    const [toTeam, setToTeam] = useState('');
    const [tradeAmount, setTradeAmount] = useState('');
    const [sellerPercentCut, setSellerPercentCut] = useState('');
    const [buyerPercentCut, setBuyerPercentCut] = useState('');
    const [fromTeamProperties, setFromTeamProperties] = useState([]);
    const [selectedPropertyForTrade, setSelectedPropertyForTrade] = useState('');
    const [tradeMessage, setTradeMessage] = useState({ text: '', type: '' }); // type: 'success' or 'error'

    const handleStampDutyChange = async (category, value) => {
        const newDuties = { ...stampDuties, [category]: parseFloat(value) || 0 };
        setStampDuties(newDuties);
        try {
            await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/settings`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ stampDuty: newDuties })
            });
        } catch (err) { console.error("Failed to save settings", err); }
    };

    const fetchTeams = useCallback(async () => {
        if (!user?.tableAccess || !token) return;
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/teams/${user.tableAccess}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Could not fetch teams');
            const data = await res.json();
            setTeams(data);
            if (data.length > 0 && (!activeLedgerTeam || !data.some(t => t._id === activeLedgerTeam._id))) {
                setActiveLedgerTeam(data[0]);
            } else if (data.length === 0) {
                setActiveLedgerTeam(null);
            }
        } catch (err) { console.error("Failed to fetch teams:", err); }
    }, [user, token, activeLedgerTeam]);

    // --- Fetch properties for the selected 'from' team ---
    const fetchFromTeamProperties = useCallback(async () => {
        if (!fromTeam || !token) {
            setFromTeamProperties([]);
            setSelectedPropertyForTrade('');
            return;
        }
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/entries/${fromTeam}?table=${user.tableAccess}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setFromTeamProperties(data);
        } catch (err) {
            console.error("Failed to fetch properties for trade:", err);
            setFromTeamProperties([]);
        }
    }, [fromTeam, token, user]);

    useEffect(() => {
        fetchTeams();
    }, [fetchTeams]);
    
    useEffect(() => {
        fetchFromTeamProperties();
    }, [fetchFromTeamProperties]);

    useEffect(() => {
        const fetchSettings = async () => {
            if (!token) return;
            try {
                const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/settings`, {
                     headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!res.ok) throw new Error('Could not fetch settings');
                const data = await res.json();
                if (data.stampDuty) setStampDuties(data.stampDuty);
            } catch (err) { console.error("Could not fetch settings", err); }
        };
        fetchSettings();
    }, [token]);

    const handleAddTeam = async (e) => {
        e.preventDefault();
        if (!newTeamName.trim() || !user?.tableAccess || !token) return;
        setNewTeamCredentials(null);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/teams`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ name: newTeamName, tableId: user.tableAccess })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Server error');
            
            setNewTeamName('');
            setNewTeamCredentials(data.credentials);
            fetchTeams();
        } catch (err) {
            alert(`Failed to add team: ${err.message}`);
        }
    };
    
    const handleDeleteTeam = async (teamId) => {
        if (!window.confirm("Are you sure? This will permanently delete the team, its ledger, and its participant user account.")) return;
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/teams/${teamId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Server error');
            }
            fetchTeams();
        } catch (err) {
            alert(`Failed to delete team: ${err.message}`);
        }
    };
    

    // --- Team Wallet Add/Deduct Logic is handled in TeamWalletRow below ---
// --- TeamWalletRow Component ---
const TeamWalletRow = ({ team }) => {
    const { token } = useAuth();
    const [addValue, setAddValue] = useState('');
    const [addIsPercent, setAddIsPercent] = useState(false);
    const [deductValue, setDeductValue] = useState('');
    const [deductIsPercent, setDeductIsPercent] = useState(false);
    const [status, setStatus] = useState('');

    const handleWalletUpdate = async (isAdd) => {
        let value = isAdd ? addValue : deductValue;
        let isPercent = isAdd ? addIsPercent : deductIsPercent;
        if (!value || isNaN(value)) return;
        let amount = parseFloat(value);
        setStatus('Processing...');
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/teams/update-wallet`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ teamId: team._id, amount, isPercent, isDeduct: !isAdd })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to update wallet');
            setStatus(isAdd ? 'Added!' : 'Deducted!');
            setAddValue('');
            setDeductValue('');
        } catch (err) {
            setStatus('Error: ' + err.message);
        }
    };

    return (
        <tr>
            <td className="p-2">{team.name}</td>
            <td className="p-2">{team.walletBalance.toLocaleString()}</td>
            <td className="p-2">
                <input type="number" value={addValue} onChange={e => setAddValue(e.target.value)} className="border rounded p-1 w-20" placeholder="Amount" />
                <label className="ml-2 text-xs"><input type="checkbox" checked={addIsPercent} onChange={e => setAddIsPercent(e.target.checked)} /> %</label>
                <button onClick={() => handleWalletUpdate(true)} className="ml-2 bg-green-500 text-white px-2 py-1 rounded">Add</button>
            </td>
            <td className="p-2">
                <input type="number" value={deductValue} onChange={e => setDeductValue(e.target.value)} className="border rounded p-1 w-20" placeholder="Amount" />
                <label className="ml-2 text-xs"><input type="checkbox" checked={deductIsPercent} onChange={e => setDeductIsPercent(e.target.checked)} /> %</label>
                <button onClick={() => handleWalletUpdate(false)} className="ml-2 bg-red-500 text-white px-2 py-1 rounded">Deduct</button>
            </td>
            <td className="p-2">{status}</td>
        </tr>
    );
};

    const triggerDisaster = async (disasterType, deductionAmount) => {
        const formattedAmount = formatCurrency(deductionAmount);
        if (!window.confirm(`Are you sure you want to trigger a ${disasterType}?\nThis will deduct ${formattedAmount} from all affected teams on your table.`)) {
            return;
        }

        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/disasters/trigger`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ disasterType, deductionAmount })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to trigger disaster.');

            alert(data.message);
            fetchTeams();
        } catch (err) {
            console.error("Failed to trigger disaster:", err);
            alert(`Error: ${err.message}`);
        }
    };
    
    // --- Trade Block Logic ---
    const handleTrade = async (e) => {
        e.preventDefault();
        setTradeMessage({ text: '', type: '' });

        if (!fromTeam || !toTeam || !selectedPropertyForTrade || !tradeAmount) {
            setTradeMessage({ text: 'Please fill out all trade details.', type: 'error' });
            return;
        }
        if (fromTeam === toTeam) {
            setTradeMessage({ text: 'The "From" and "To" teams cannot be the same.', type: 'error' });
            return;
        }
        const sellerCut = parseFloat(sellerPercentCut) || 0;
        const buyerCut = parseFloat(buyerPercentCut) || 0;
        if (sellerCut < 0 || sellerCut > 100 || buyerCut < 0 || buyerCut > 100) {
            setTradeMessage({ text: 'Percent cuts must be between 0 and 100.', type: 'error' });
            return;
        }
        const tradeAmt = parseFloat(tradeAmount);
        const sellerDeduct = tradeAmt * (sellerCut / 100);
        const buyerDeduct = tradeAmt * (buyerCut / 100);
        const sellerTeam = teams.find(t => t._id === fromTeam);
        const buyerTeam = teams.find(t => t._id === toTeam);
        if (sellerTeam.walletBalance < sellerDeduct) {
            setTradeMessage({ text: `Seller team does not have enough balance for the deduction (${formatCurrency(sellerDeduct)}).`, type: 'error' });
            return;
        }
        if (buyerTeam.walletBalance < buyerDeduct) {
            setTradeMessage({ text: `Buyer team does not have enough balance for the deduction (${formatCurrency(buyerDeduct)}).`, type: 'error' });
            return;
        }
        const confirmed = window.confirm(`Are you sure you want to trade this property?\n\nSeller: ${sellerTeam?.name}\nBuyer: ${buyerTeam?.name}\nAmount: ${formatCurrency(tradeAmt)}\nSeller Deduction: ${formatCurrency(sellerDeduct)} (${sellerCut}%)\nBuyer Deduction: ${formatCurrency(buyerDeduct)} (${buyerCut}%)`);
        if (!confirmed) return;
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/trade/property`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    fromTeamId: fromTeam,
                    toTeamId: toTeam,
                    entryId: selectedPropertyForTrade,
                    tradeAmount: tradeAmt,
                    sellerPercentCut: sellerCut,
                    buyerPercentCut: buyerCut
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Trade failed.');
            setTradeMessage({ text: data.message, type: 'success' });
            setFromTeam('');
            setToTeam('');
            setTradeAmount('');
            setSellerPercentCut('');
            setBuyerPercentCut('');
            setSelectedPropertyForTrade('');
            fetchTeams(); // Refresh team data to show updated wallets
        } catch (err) {
            setTradeMessage({ text: `Error: ${err.message}`, type: 'error' });
        }
    };


    const uniqueStatuses = useMemo(() => ['All', ...new Set(properties.map(p => p.status))], [properties]);
    const uniqueCategories = useMemo(() => ['All', ...new Set(properties.map(p => p.category))], [properties]);
    const filteredData = useMemo(() => properties.filter(p => (p.name.toLowerCase().includes(filters.searchTerm.toLowerCase())||p.propertyNo?.toString().includes(filters.searchTerm)) && (filters.status === 'All' || p.status === filters.status) && (filters.category === 'All' || p.category === filters.category)), [properties, filters]);
    const handleVerify = (propertyNo, inputValue) => {
        const property = properties.find(p => p.propertyNo === propertyNo);
        const userValue = parseFloat(String(inputValue).replace(/[^0-9.]/g, ''));
        if (isNaN(userValue)) return;
        const grandTotal = property.grandTotal;
        const lowerBound = grandTotal * 0.97;
        const upperBound = grandTotal * 1.03;
        const isMatch = userValue >= lowerBound && userValue <= upperBound;
        setProperties(prev => prev.map(p => p.propertyNo === propertyNo ? { ...p, isVerified: isMatch ? true : 'rejected' } : p));
        if(selectedPropertyNo === propertyNo) {
            setSelectedPropertyNo(null);
            setTimeout(() => setSelectedPropertyNo(propertyNo), 0);
        }
    };
    const selectedProperty = useMemo(() => properties.find(p => p.propertyNo === selectedPropertyNo), [selectedPropertyNo, properties]);
    const groupedProperties = useMemo(() => filteredData.reduce((acc, property) => { (acc[property.category] = acc[property.category] || []).push(property); return acc; }, {}), [filteredData]);
    const totalValue = useMemo(() => filteredData.reduce((sum, p) => sum + (p.grandTotal || 0), 0), [filteredData]);

    return (
        <main className="container mx-auto p-4 sm:p-6 lg:p-8">
            <div className="bg-white p-6 rounded-lg shadow-md mb-12">
                <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">Manage Teams for {user?.tableAccess?.replace('table', 'Table ')}</h2>
                </div>
                <form onSubmit={handleAddTeam} className="flex flex-col sm:flex-row gap-2 mb-4">
                    <input type="text" value={newTeamName} onChange={(e) => setNewTeamName(e.target.value)} placeholder="New Team Name" className="flex-grow p-2 border rounded-md" required />
                    <button type="submit" className="bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700">Add Team</button>
                </form>

                {newTeamCredentials && (
                    <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-800 rounded-lg">
                        <h3 className="font-bold">Team & Participant Created Successfully!</h3>
                        <p>Share these credentials with the team's participant:</p>
                        <p><strong>Username:</strong> {newTeamCredentials.username}</p>
                        <p><strong>Password:</strong> {newTeamCredentials.password}</p>
                        <button onClick={() => setNewTeamCredentials(null)} className="mt-2 text-sm text-green-800 font-bold underline">Dismiss</button>
                    </div>
                )}

                <div className="space-y-2 mt-4">{teams.length > 0 ? teams.map(team => ( <div key={team._id} className="flex justify-between items-center bg-gray-50 p-3 rounded-md"><div><span className="font-medium text-lg">{team.name}</span><div className="flex gap-4 text-sm"><p className="text-green-600 font-semibold">Wallet: {formatCurrency(team.walletBalance)}</p><p className="text-red-600 font-semibold">Spent: {formatCurrency(team.expenditure)}</p></div></div><button onClick={() => handleDeleteTeam(team._id)} className="text-sm bg-red-500 text-white py-1 px-3 rounded-md hover:bg-red-600">Delete</button></div> )) : <p className="text-gray-500">No teams created yet for this table.</p>}</div>
            </div>

            <div className="bg-red-50 p-6 rounded-lg shadow-md border border-red-200 mb-12">
                <h2 className="text-2xl font-bold text-red-800 mb-4">Disaster Control Panel ☢️</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    <button onClick={() => triggerDisaster('tsunami', 50000000)} className="disaster-btn">Trigger Tsunami</button>
                    <button onClick={() => triggerDisaster('earthquake', 75000000)} className="disaster-btn">Trigger Earthquake</button>
                    <button onClick={() => triggerDisaster('landslide', 40000000)} className="disaster-btn">Trigger Landslide</button>
                    <button onClick={() => triggerDisaster('drought', 60000000)} className="disaster-btn">Trigger Drought</button>
                    <button onClick={() => triggerDisaster('fertilizer', 30000000)} className="disaster-btn">Trigger Fertilizer Hazard</button>
                </div>
            </div>

            <div className="lg:grid lg:grid-cols-12 lg:gap-8">
                <aside className="lg:col-span-3 mb-8 lg:mb-0"><div className="sticky top-24">
                    <div className="bg-white p-4 rounded-lg shadow-md mb-8"><h2 className="text-lg font-bold mb-4">Verification Settings</h2><div className="space-y-3"><div><label htmlFor="stampDutyRes" className="block text-sm font-medium text-gray-700">Residential Duty (%)</label><input type="number" id="stampDutyRes" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2" value={stampDuties.Residential} onChange={e => handleStampDutyChange('Residential', e.target.value)} /></div><div><label htmlFor="stampDutyCom" className="block text-sm font-medium text-gray-700">Commercial Duty (%)</label><input type="number" id="stampDutyCom" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2" value={stampDuties.Commercial} onChange={e => handleStampDutyChange('Commercial', e.target.value)} /></div><div><label htmlFor="stampDutyInd" className="block text-sm font-medium text-gray-700">Industrial Duty (%)</label><input type="number" id="stampDutyInd" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2" value={stampDuties.Industrial} onChange={e => handleStampDutyChange('Industrial', e.target.value)} /></div><p className="text-xs text-gray-500 pt-2">Registration fee is fixed at 1%.</p></div></div>
                    <div className="bg-white p-4 rounded-lg shadow-md"><h2 className="text-lg font-bold mb-4">Filters</h2><div className="space-y-4"><div><label htmlFor="search" className="block text-sm font-medium text-gray-700">Search by Name</label><input type="text" id="search" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2" onChange={e => setFilters(f => ({ ...f, searchTerm: e.target.value }))} /></div><div><label className="block text-sm font-medium text-gray-700">Status</label><div className="flex flex-wrap gap-2 mt-1">{uniqueStatuses.map(s => <button key={s} onClick={() => setFilters(f => ({ ...f, status: s }))} className={`px-3 py-1 text-sm rounded-full ${filters.status === s ? 'bg-gray-600 text-white' : 'bg-gray-200'}`}>{s}</button>)}</div></div><div><label className="block text-sm font-medium text-gray-700">Category</label><div className="flex flex-wrap gap-2 mt-1">{uniqueCategories.map(c => <button key={c} onClick={() => setFilters(f => ({ ...f, category: c }))} className={`px-3 py-1 text-sm rounded-full ${filters.category === c ? 'bg-gray-600 text-white' : 'bg-gray-200'}`}>{c}</button>)}</div></div></div></div>
                    <div className="mt-8 bg-white p-4 rounded-lg shadow-md"><h2 className="text-lg font-bold mb-4">Recent Team Activity</h2><ul className="space-y-3 text-sm max-h-96 overflow-y-auto">{teamActivities.length > 0 ? teamActivities.map(act => ( <li key={act._id} className="border-b border-gray-200 pb-2"><p className="font-semibold text-gray-800">{act.name}</p><div className="flex justify-between items-center text-gray-600"><span>Sold to <strong className="text-blue-600">{act.team ? act.team.name : 'N/A'}</strong></span><span className="font-bold text-green-600">{formatCurrency(act.totalCost)}</span></div></li> )) : <li className="text-gray-500">No team activity yet.</li>}</ul></div>
                </div></aside>
                <section className="lg:col-span-9"><div className="bg-white p-6 rounded-lg shadow-md"><div className="flex justify-between items-center mb-4"><h2 className="text-2xl font-bold">Property Ledger</h2><div className="text-right"><span className="text-sm text-gray-500">Total Displayed Value</span><p className="font-bold text-xl text-green-600">{formatCurrency(totalValue)}</p></div></div>{Object.keys(groupedProperties).length === 0 ? <p className="text-center py-10 text-gray-500">No properties match filters.</p> : Object.keys(groupedProperties).sort().map(category => ( <div key={category} className="mb-8"><h3 className="text-xl font-semibold mb-3 text-gray-800 border-b-2 border-gray-200 pb-2">{category}</h3><div className="overflow-x-auto"><table className="main-table w-full text-sm text-left text-gray-500"><thead className="text-xs text-gray-700 uppercase"><tr><th scope="col" className="px-6 py-3">Property Name</th><th scope="col" className="px-6 py-3">Status</th><th scope="col" className="px-6 py-3 w-2/5">Verification</th></tr></thead><tbody>{groupedProperties[category].map(p => <VerificationRow key={p.propertyNo} property={p} selectedPropertyNo={selectedPropertyNo} onVerify={handleVerify} onSelect={setSelectedPropertyNo} />)}</tbody></table></div></div> ))}</div>
                    {selectedProperty && (() => {
                        // Get per-team owner object for selected property
                        const teamOwner = getTeamOwner(selectedProperty, user?.teamId);
                        // Sell property handler
                        const handleSellProperty = async () => {
                            if (!teamOwner || !teamOwner.totalCost) return alert('No property found for your team.');
                            if (!window.confirm(`Are you sure you want to sell this property? This will deduct ${formatCurrency(teamOwner.totalCost)} from your team wallet.`)) return;
                            try {
                                const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/teams/update-wallet`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                    body: JSON.stringify({ teamId: user.teamId, amount: teamOwner.totalCost, isPercent: false, isDeduct: true })
                                });
                                const data = await res.json();
                                if (!res.ok) throw new Error(data.message || 'Failed to update wallet');
                                alert('Property sold! Wallet updated.');
                                fetchTeams();
                            } catch (err) {
                                alert('Error: ' + err.message);
                            }
                        };
                        // Fallback to property values if owner not found
                        const stampDutyPercent = stampDuties[selectedProperty.category] || 0;
                        const grandTotal = selectedProperty.grandTotal;
                        const brokeragePercent = selectedProperty.brokeragePercent || 0;
                        const brokerage = grandTotal * (brokeragePercent / 100);
                        const baseWithBrokerage = grandTotal + brokerage;
                        const stampDuty = baseWithBrokerage * (stampDutyPercent / 100);
                        const registrationFee = baseWithBrokerage * 0.01;
                        // Use per-team totalCost/annualRent if available
                        const totalCost = teamOwner?.totalCost ?? (grandTotal + brokerage + stampDuty + registrationFee);
                        const monthlyRent = teamOwner?.monthlyRent ?? selectedProperty.monthlyRent;
                        const annualRent = teamOwner?.annualRent ?? selectedProperty.annualRent;
                        const rentalYield = (annualRent / totalCost);
                        return (
                            <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-2xl font-bold mb-4">{selectedProperty.name} - Details</h3>
                                    <button onClick={() => setSelectedPropertyNo(null)} className="text-gray-500 hover:text-gray-700 font-bold text-2xl">&times;</button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h4 className="font-bold mb-2">Core Info</h4>
                                        <DetailItem label="Category" value={selectedProperty.category} />
                                        <DetailItem label="Status" value={selectedProperty.status} />
                                        <DetailItem label="Plot Area" value={`${selectedProperty.plotArea.toLocaleString()} sqft`} />
                                        <DetailItem label="Floor Area" value={`${selectedProperty.floorArea.toLocaleString()} sqft`} />
                                        <DetailItem label="Total Buildable Area" value={`${selectedProperty.totalBuildableArea.toLocaleString()} sqft`} />
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h4 className="font-bold mb-2">Building Specs</h4>
                                        <DetailItem label="Floors" value={selectedProperty.floors} />
                                        <DetailItem label="FAR" value={selectedProperty.far} />
                                        <DetailItem label="Access Width" value={selectedProperty.widthOfAccess} />
                                        <DetailItem label="Cost per sqft" value={formatCurrency(selectedProperty.perSqFtCost)} />
                                    </div>
                                    {selectedProperty.isVerified === true ? (
                                        <div className="bg-green-50 border border-green-200 p-4 rounded-lg md:col-span-2">
                                            <h4 className="font-bold mb-3 text-gray-800">Financial Overview</h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                                                <div>
                                                    <h5 className="font-semibold mb-2 text-gray-700">Purchase Costs</h5>
                                                    <DetailItem label="Grand Total" value={formatCurrency(grandTotal)} />
                                                    <DetailItem label={`Brokerage (${brokeragePercent}%)`} value={formatCurrency(brokerage)} />
                                                    <DetailItem label={`Stamp Duty (${stampDutyPercent}%)`} value={formatCurrency(stampDuty)} />
                                                    <DetailItem label="Registration Fee (1%)" value={formatCurrency(registrationFee)} />
                                                    <div className="border-t my-2"></div>
                                                    <DetailItem label="<strong>Total Cost</strong>" value={`<strong class=\"text-blue-700\">${formatCurrency(totalCost)}</strong>`} />
                                                    {/* Sell button for team-owned property, always visible if owned */}
                                                    {teamOwner && teamOwner.totalCost && (
                                                        <div className="mt-4">
                                                            <button onClick={handleSellProperty} className="bg-red-600 text-white font-bold py-2 px-4 rounded-md hover:bg-red-700">
                                                                Sell Property (Deduct {formatCurrency(teamOwner.totalCost)} from wallet)
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <h5 className="font-semibold mb-2 text-gray-700">Rental Income</h5>
                                                    <DetailItem label="Monthly Rent" value={formatCurrency(monthlyRent)} />
                                                    <DetailItem label="Annual Rent" value={formatCurrency(annualRent)} />
                                                    <div className="border-t my-2"></div>
                                                    <DetailItem label="<strong>Rental Yield</strong>" value={`<strong class=\"text-green-700\">${(rentalYield * 100).toFixed(2)}%</strong>`} />
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg md:col-span-2">
                                            <h4 className="font-bold mb-2 text-gray-800">Financials & Verification</h4>
                                            <DetailItem label="Verification Status" value='<span class="font-bold text-yellow-600">Pending</span>' />
                                            <p className="mt-3 text-sm text-gray-600">To view the full financial breakdown, please verify the property by entering the correct <strong>Total Cost</strong> in the table above.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })()}
                </section>
            </div>
            
            <div className="my-12 border-t border-gray-300"></div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Trade Properties 🤝</h2>
                <form onSubmit={handleTrade} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label htmlFor="from-team" className="block text-sm font-medium text-gray-700">From Team (Seller)</label>
                        <select id="from-team" value={fromTeam} onChange={(e) => setFromTeam(e.target.value)} className="w-full p-2 border rounded-md" required>
                            <option value="">Select a team</option>
                            {teams.map(team => (
                                <option key={team._id} value={team._id}>{team.name} ({formatCurrency(team.walletBalance)})</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="to-team" className="block text-sm font-medium text-gray-700">To Team (Buyer)</label>
                        <select id="to-team" value={toTeam} onChange={(e) => setToTeam(e.target.value)} className="w-full p-2 border rounded-md" required>
                            <option value="">Select a team</option>
                            {teams.map(team => (
                                <option key={team._id} value={team._id}>{team.name} ({formatCurrency(team.walletBalance)})</option>
                            ))}
                        </select>
                    </div>

                    <div className="md:col-span-2 space-y-2">
                        <label htmlFor="property-to-trade" className="block text-sm font-medium text-gray-700">Property to Trade</label>
                        <select id="property-to-trade" value={selectedPropertyForTrade} onChange={(e) => setSelectedPropertyForTrade(e.target.value)} className="w-full p-2 border rounded-md" disabled={!fromTeam} required>
                            <option value="">{fromTeam ? 'Select a property' : 'Select a seller team first'}</option>
                            {fromTeamProperties.map(prop => (
                                <option key={prop._id} value={prop._id}>{prop.name} - {formatCurrency(prop.totalCost)}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="trade-amount" className="block text-sm font-medium text-gray-700">Trade Amount (INR)</label>
                        <input id="trade-amount" type="number" placeholder="Enter amount" value={tradeAmount} onChange={(e) => setTradeAmount(e.target.value)} className="w-full p-2 border rounded-md" required />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="seller-percent-cut" className="block text-sm font-medium text-gray-700">Percent to cut from Seller (%)</label>
                        <input id="seller-percent-cut" type="number" min="0" max="100" placeholder="e.g. 5" value={sellerPercentCut} onChange={e => setSellerPercentCut(e.target.value)} className="w-full p-2 border rounded-md" />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="buyer-percent-cut" className="block text-sm font-medium text-gray-700">Percent to cut from Buyer (%)</label>
                        <input id="buyer-percent-cut" type="number" min="0" max="100" placeholder="e.g. 10" value={buyerPercentCut} onChange={e => setBuyerPercentCut(e.target.value)} className="w-full p-2 border rounded-md" />
                    </div>

                    <div className="flex items-end md:col-span-1">
                        <button type="submit" className="w-full bg-orange-600 text-white font-bold py-2 px-4 rounded-md hover:bg-orange-700">Facilitate Trade</button>
                    </div>

                </form>
                {tradeMessage.text && (
                    <div className={`mt-4 p-3 rounded-md font-medium ${tradeMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {tradeMessage.text}
                    </div>
                )}
            </div>

            <div className="my-12 border-t border-gray-300"></div>

            <div id="ledger-container">
                <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Team Data Ledgers</h2>
                <div className="mb-6 border-b border-gray-200">
                    <nav className="flex -mb-px flex-wrap">{teams.map(team => ( <button key={team._id} onClick={() => setActiveLedgerTeam(team)} className={`py-4 px-6 border-b-2 font-medium text-sm text-center ${activeLedgerTeam?._id === team._id ? 'tab-active' : 'text-gray-500 hover:text-gray-700'}`}>{team.name}</button> ))}</nav>
                </div>
                <div className="mt-6">{user?.tableAccess && activeLedgerTeam ? ( <TeamLedgerTable activeTable={user.tableAccess} activeTeamId={activeLedgerTeam._id} activeTeamName={activeLedgerTeam.name} /> ) : ( <div className="text-center text-gray-500">Select a team to view the ledger, or create one if the list is empty.</div> )}</div>
            </div>

            <div className="my-12 border-t border-gray-300"></div>

                        {/* Team Wallet Controls */}
                        <div className="bg-blue-50 p-6 rounded-lg shadow-md mb-12">
                                <h2 className="text-2xl font-bold text-blue-800 mb-4">Team Wallet Management</h2>
                                <table className="w-full border">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="p-2">Team Name</th>
                                            <th className="p-2">Wallet Balance</th>
                                            <th className="p-2">Add</th>
                                            <th className="p-2">Deduct</th>
                                            <th className="p-2">Status</th>
                                        </tr>
                                    </thead>
                                                            <tbody>
                                                                {teams.map(team => (
                                                                    <TeamWalletRow key={team._id} team={team} />
                                                                ))}
                                                            </tbody>
                                </table>
                        </div>
            {/* --- Sell Properties Block (Team-wise) --- */}
            <div className="bg-yellow-50 p-6 rounded-lg shadow-md mb-12">
                <h2 className="text-2xl font-bold text-yellow-800 mb-4">Sell Properties (Team-wise)</h2>
                <div className="space-y-8">
                    {teams.map(team => {
                        const teamProperties = properties.filter(p => Array.isArray(p.owners) && p.owners.some(o => o.team === team._id && o.totalCost));
                        if (teamProperties.length === 0) return null;
                        return (
                            <div key={team._id} className="mb-6 rounded-lg border border-yellow-200 bg-yellow-100">
                                <div className="px-4 py-2 bg-yellow-200 rounded-t-lg">
                                    <h3 className="text-lg font-bold text-yellow-900">{team.name}</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left text-gray-700">
                                        <thead className="bg-yellow-50">
                                            <tr>
                                                <th className="p-2">Property Name</th>
                                                <th className="p-2">Total Cost</th>
                                                <th className="p-2">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {teamProperties.map(property => {
                                                const ownerObj = property.owners.find(o => o.team === team._id);
                                                return (
                                                    <tr key={team._id + '-' + property.propertyNo} className="border-b">
                                                        <td className="p-2">{property.name} (#{property.propertyNo})</td>
                                                        <td className="p-2">{formatCurrency(ownerObj.totalCost)}</td>
                                                        <td className="p-2">
                                                            <button
                                                                className="bg-red-600 text-white font-bold py-1 px-3 rounded-md hover:bg-red-700"
                                                                onClick={async () => {
                                                                    if (!window.confirm(`Sell ${property.name} for ${team.name}? This will add ${formatCurrency(ownerObj.totalCost)} to wallet.`)) return;
                                                                    try {
                                                                        // Only delete the corresponding entry for this team and property
                                                                        // Find the entry by teamId, propertyId, and table
                                                                        const entryRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/entries/${team._id}?table=${ownerObj.table}`, {
                                                                            headers: { 'Authorization': `Bearer ${token}` }
                                                                        });
                                                                        const entryList = await entryRes.json();
                                                                        if (Array.isArray(entryList)) {
                                                                            const entryToDelete = entryList.find(e => e.propertyId === property._id);
                                                                            if (entryToDelete) {
                                                                                const delRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/entries/${entryToDelete._id}`, {
                                                                                    method: 'DELETE',
                                                                                    headers: { 'Authorization': `Bearer ${token}` }
                                                                                });
                                                                                const delData = await delRes.json();
                                                                                if (!delRes.ok) throw new Error(delData.message || 'Failed to delete entry');
                                                                            }
                                                                        }
                                                                        alert('Property sold! Wallet updated and entry deleted.');
                                                                        fetchTeams();
                                                                    } catch (err) {
                                                                        alert('Error: ' + err.message);
                                                                    }
                                                                }}
                                                            >Sell</button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </main>
    );
}

export default VerificationSystem;

