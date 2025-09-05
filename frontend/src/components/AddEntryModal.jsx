import React, { useState, useEffect } from 'react';
// import { propertyData } from '../data/propertyData.js';
import { useAuth } from '../context/AuthContext';

const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', maximumFractionDigits: 2
}).format(amount);

function AddEntryModal({ onClose, onAddSuccess, activeTable, activeTeamId }) {
    const { token } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [brokeragePercent, setBrokeragePercent] = useState('');
    const [settings, setSettings] = useState(null);
    const [rentPercent, setRentPercent] = useState('');
    const [propertyData, setPropertyData] = useState([]);
    useEffect(() => {
        async function fetchProperties() {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/properties`);
                const data = await res.json();
                setPropertyData(data);
            } catch (err) {
                setPropertyData([]);
            }
        }
        fetchProperties();
    }, []);

    useEffect(() => {
        const fetchSettings = async () => {
            if (!token) return;
            try {
                const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/settings`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = await res.json();
                setSettings(data);
            } catch (err) {
                console.error("Could not fetch settings for modal", err);
            }
        };
        fetchSettings();
    }, [token]);

    useEffect(() => {
        if (!searchTerm.trim()) {
            setSearchResults([]);
            return;
        }
        const term = searchTerm.toLowerCase();
        const matches = propertyData.filter(p => {
            const nameMatch = p.name && p.name.toLowerCase().includes(term);
            const propertyNoMatch = p.propertyNo && p.propertyNo.toString().includes(term);
            return nameMatch || propertyNoMatch;
        });
        setSearchResults(matches);
    }, [searchTerm, propertyData]);

    const handleSelectProperty = (property) => {
        setSelectedProperty(property);
        setSearchTerm(property.name);
        setSearchResults([]);
        setBrokeragePercent('');
    };

    const calculateTotalCost = () => {
        if (!selectedProperty || !settings) return 0;
        const grandTotal = selectedProperty.grandTotal;
        const brokerage = grandTotal * ((parseFloat(brokeragePercent) || 0) / 100);
        const base = grandTotal + brokerage;
        const stampDutyPercent = settings.stampDuty[selectedProperty.category] || 0;
        const registrationFeePercent = settings.registrationFeePercent || 0;
        const stampDuty = base * (stampDutyPercent / 100);
        const registrationFee = base * (registrationFeePercent / 100);
        return base + stampDuty + registrationFee;
    };

    const totalCost = calculateTotalCost();

    const handleConfirmAdd = async () => {
        const percent = parseFloat(brokeragePercent);
        const rentP = parseFloat(rentPercent);
        if (!selectedProperty || !percent || percent <= 0) {
            alert('Please select a property and enter a valid brokerage percentage.');
            return;
        }
        if (percent > 15) {
            alert('Brokerage cannot exceed 15%.');
            return;
        }
        if (!rentP || rentP < 1 || rentP > 100) {
            alert('Please enter a valid rent percent (1-100).');
            return;
        }

    const totalCost = calculateTotalCost();

        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/entries`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    propertyId: selectedProperty._id || selectedProperty.propertyId,
                    table: activeTable,
                    team: activeTeamId,
                    brokeragePercent: percent,
                    totalCost: totalCost,
                    rentPercent: rentP,
                    annualRent: Math.round(totalCost * (rentP / 100)),
                    hazardTypes: selectedProperty.hazardTypes || [],
                    name: selectedProperty.name,
                    category: selectedProperty.category,
                    mapId: selectedProperty.mapId,
                    id: selectedProperty.id,
                    grandTotal: selectedProperty.grandTotal
                })
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "Server failed to save the entry.");
            }
            onAddSuccess();
        } catch (error) {
            console.error("Failed to add entry:", error);
            alert(`Error: ${error.message}`);
        }
    };

    return (
        <div className="modal-backdrop">
            <div className="bg-white rounded-xl shadow-2xl w-11/12 md:w-2/3 lg:w-1/2 modal-content">
                <div className="p-6 border-b flex justify-between items-center"><h2 className="text-2xl font-semibold text-gray-900">Add New Property Entry</h2><button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">&times;</button></div>
                <div className="p-6 md:p-8">
                    <div className="mb-6 relative">
                        <label htmlFor="property-search" className="block mb-1 font-medium text-sm">Search Property</label>
                        <input type="text" id="property-search" className="w-full p-3 border border-gray-300 rounded-lg" placeholder="Type property name or number..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} autoComplete="off" />
                                                {searchResults.length > 0 && (
                                                    <div className="search-results absolute z-10 w-full bg-white border mt-1 rounded-lg max-h-60 overflow-y-auto">
                                                        {searchResults.map(p => (
                                                            <div
                                                                key={p.propertyNo || p.id}
                                                                onClick={() => handleSelectProperty(p)}
                                                                className="p-3 hover:bg-blue-100 cursor-pointer"
                                                            >
                                                                {p.name}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                    </div>
                    {selectedProperty && (
                        <>
                            <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-semibold text-lg border-b pb-2">Property Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <p><strong>Serial No:</strong> {selectedProperty.id}</p>
                                    <p><strong>Name:</strong> {selectedProperty.name}</p>
                                    <p><strong>Map No:</strong> {selectedProperty.mapId}</p>
                                    <p><strong>Category:</strong> {selectedProperty.category}</p>
                                    <p className="md:col-span-2"><strong>Grand Total:</strong> {formatCurrency(selectedProperty.grandTotal)}</p>
                                    {selectedProperty.hazardTypes && selectedProperty.hazardTypes.length > 0 && (
                                        <p className="md:col-span-2"><strong>Hazard Risks:</strong> <span className="font-medium text-red-600">{selectedProperty.hazardTypes.join(', ')}</span></p>
                                    )}
                                    {selectedProperty.owners && selectedProperty.owners.length > 0 && (
                                        <div className="md:col-span-2">
                                            <strong>Team Costs:</strong>
                                            <ul>
                                                {selectedProperty.owners.map((owner, idx) => (
                                                    <li key={idx}>
                                                        Team: {owner.team?.name || owner.team?.toString?.() || owner.team}, Table: {owner.table}, Total Cost: {formatCurrency(owner.totalCost)}, Annual Rent: {formatCurrency(owner.annualRent)}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="mt-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                                    <div>
                                        <label htmlFor="brokerage-percent" className="block text-sm font-medium mb-1">Brokerage (%)</label>
                                        <input type="number" id="brokerage-percent" className="w-full p-3 border border-gray-300 rounded-lg" placeholder="e.g., 2.5" value={brokeragePercent} onChange={(e) => setBrokeragePercent(e.target.value)} />
                                    </div>
                                    <div>
                                        <label htmlFor="rent-percent" className="block text-sm font-medium mb-1">Rent Percent (%)</label>
                                        <input type="number" id="rent-percent" className="w-full p-3 border border-gray-300 rounded-lg" placeholder="e.g., 10" value={rentPercent} onChange={(e) => setRentPercent(e.target.value)} min={1} max={100} />
                                    </div>
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <label className="block text-sm font-medium">Total Cost (incl. fees)</label>
                                        <p className="text-2xl font-bold text-blue-700">{settings ? formatCurrency(totalCost) : 'Calculating...'}</p>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
                <div className="p-6 bg-gray-50 border-t text-right space-x-3"><button onClick={onClose} className="bg-gray-200 px-4 py-2 rounded-lg">Cancel</button><button onClick={handleConfirmAdd} disabled={!selectedProperty || !brokeragePercent || parseFloat(brokeragePercent) <= 0} className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:bg-blue-300 disabled:cursor-not-allowed">Add to Team</button></div>
            </div>
        </div>
    );
}

export default AddEntryModal;