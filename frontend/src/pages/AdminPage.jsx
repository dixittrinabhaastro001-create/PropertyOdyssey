import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const events = [
  { label: "🚨 STAMP DUTY SHOCK IN GURUGRAM!", propertyNumbers: [1,2,3,4,5,6,7,8], percent: 25 },
  { label: "🚇 METRO COMING TO SOUTH GURGAON!", propertyNumbers: [34,35,36], percent: 80 },
  { label: "🌊 FLOODS HIT PRIME AREAS!", propertyNumbers: [9,10,11,12,13], percent: -20 },
  { label: "💎 SURAT DIAMOND TRADE SLOWS!", propertyNumbers: [50,51,52,53,54,55,56,57,58,59,60], percent: -15 },
  { label: "🚆 SURAT METRO NEARS COMPLETION!", propertyNumbers: [61,62,63,64,65,66], percent: 60 },
  { label: "🚗 AUTO INDUSTRY BOOST PACKAGE!", propertyNumbers: [20,21,22,23,24,25], percent: 60 },
  { label: "🍴 BIG FOOD FACTORY IN EAST!", propertyNumbers: [10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25], percent: 50 },
  { label: "💊 PHARMA CLUSTER GREENLIGHT!", propertyNumbers: [40,41,42,43,44,45], percent: 45 },
  { label: "💻 GLOBAL ELECTRONICS PLANT IN SOUTH!", propertyNumbers: [34,35,36,37,38,39], percent: 70 },
  { label: "🛢️ HUGE OIL TERMINAL APPROVED!", propertyNumbers: [70,71,72,73,74,75], percent: 50 },
  { label: "🚗 AUTO PARK SUBSIDY ANNOUNCED!", propertyNumbers: [26,27,28,29,30], percent: 60 },
  { label: "⚠️ AUTO FACTORY STRIKE!", propertyNumbers: [26,27,28], percent: -30 },
  { label: "🍴 FOOD ZONE CLEARED!", propertyNumbers: [12,13,14,15,16,17,18,19,20], percent: 50 },
  { label: "❄️ COLD STORAGE FUNDS APPROVED!", propertyNumbers: [12,13,14,15], percent: 40 },
  { label: "💊 PHARMA EXPORT PERMIT CLEARED!", propertyNumbers: [41,42,43,44], percent: 45 },
  { label: "☣️ STRICT RULES HIT PHARMA!", propertyNumbers: [45,46], percent: -25 },
  { label: "💻 TECH HUB COMING SOON!", propertyNumbers: [34,35,36,37,38], percent: 70 },
  { label: "🔌 ELECTRONICS SUPPLY SHORTAGE!", propertyNumbers: [39,40], percent: -20 },
  { label: "🛢️ WESTERN OIL TERMINAL ROUTE FINALIZED!", propertyNumbers: [70,71,72,73,74,75,76], percent: 55 },
  { label: "🌱 GREEN HYDROGEN CAMPUS APPROVED!", propertyNumbers: [21,22,23,24], percent: 70 },
  { label: "🚗 AUTO LAND SKYROCKETS WITH NEW GOVT POLICY!", propertyNumbers: [20,21,22,23,24,25], percent: 60 },
  { label: "⚠️ AUTO STRIKE FREEZES MANUFACTURING!", propertyNumbers: [26,27,28], percent: -30 },
  { label: "🍔 GLOBAL FOOD COMPANY CHOOSES EAST!", propertyNumbers: [10,11,12,13,14,15,16,17,18], percent: 50 },
  { label: "❄️ COLD STORAGE DEMAND EXPLODES!", propertyNumbers: [12,13,14,15], percent: 40 },
  { label: "💊 PHARMA FACTORY WINS EXPORT DEAL!", propertyNumbers: [41,42,43,44], percent: 45 },
  { label: "☣️ POLLUTION LAWS HIT SMALL PHARMA UNITS!", propertyNumbers: [45,46], percent: -25 },
  { label: "💻 TECH PARK FOR ELECTRONICS CONFIRMED!", propertyNumbers: [34,35,36,37,38], percent: 70 },
  { label: "🔌 PARTS SHORTAGE HITS ELECTRONICS FACTORIES!", propertyNumbers: [39,40], percent: -20 },
  { label: "🛢️ GIANT OIL TERMINAL APPROVED IN WEST!", propertyNumbers: [70,71,72,73,74,75], percent: 50 },
  { label: "⚠️ OIL SPILL FEAR SHAKES NEARBY LAND!", propertyNumbers: [72,73,76,77], percent: -20 },
  { label: "🚇 METRO CONFIRMED FOR SOUTH GURGAON!", propertyNumbers: [34,35,36], percent: 80 },
  { label: "🚝 SURAT METRO NEARS COMPLETION!", propertyNumbers: [61,62,63,64,65,66], percent: 60 },
  { label: "📈 CIRCLE RATES JUMP IN GURGAON!", propertyNumbers: [1,2,3,4,5,6,7,8], percent: 25 },
  { label: "🌧 WATERLOGGING HITS LOW AREAS!", propertyNumbers: [9,10,11,12,13], percent: -20 },
  { label: "💎 DIAMOND MARKET SLOWS SURAT HOUSING!", propertyNumbers: [50,51,52,53,54,55], percent: -15 },
  { label: "🌿 GREEN CITY PROJECT APPROVED!", propertyNumbers: [14,15,16,17,18], percent: 50 },
  { label: "🎥 FILM CITY COMING TO SOHNA ROAD!", propertyNumbers: [30,31,32], percent: 70 },
  { label: "💼 LUXURY BOOM ON GOLF COURSE ROAD!", propertyNumbers: [5,6,7], percent: 40 },
  { label: "🆕 NEW DRAINAGE PROJECT CLEARS FLOOD RISK!", propertyNumbers: [9,10,11], percent: 20 },
  { label: "🏢 BIG IT PARK EXPANSION APPROVED!", propertyNumbers: [6,7,8], percent: 70 },
];

function AdminPage() {
  const { token } = useAuth();
  const [status, setStatus] = useState({});
  const [search, setSearch] = useState('');

  const filteredEvents = events.filter(e => e.label.toLowerCase().includes(search.toLowerCase()));

  const handleEvent = async (propertyNumbers, percent, idx) => {
    if (!window.confirm('Are you sure you want to apply this event?')) return;
    setStatus(s => ({ ...s, [idx]: 'Processing...' }));
    await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/properties/bulk-update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ propertyNumbers, percentChange: percent })
    });
    setStatus(s => ({ ...s, [idx]: 'Applied!' }));
  };

  const handleCancel = async (propertyNumbers, idx) => {
    if (!window.confirm('Are you sure you want to cancel and restore old values?')) return;
    setStatus(s => ({ ...s, [idx]: 'Processing...' }));
    await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/properties/bulk-update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ propertyNumbers, percentChange: 0, reset: true })
    });
    setStatus(s => ({ ...s, [idx]: 'Restored!' }));
  };

  // Admin End All Rounds Button
  const [endStatus, setEndStatus] = useState('');
  const handleEndAllRounds = async () => {
  if (!window.confirm('Are you sure you want to end the round for ALL tables? This will increase all property grandTotals, annualRents, and totalCosts by 10% and add annual rents to all team wallets.')) return;
    setEndStatus('Processing...');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/teams/end-all-rounds`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Server error');
      }
  setEndStatus('All rounds ended! All property grandTotals, annualRents, and totalCosts increased by 10%. Team wallets updated.');
    } catch (err) {
      setEndStatus(`Error: ${err.message}`);
    }
  };
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Admin Controls</h1>
      <button className="bg-green-700 text-white px-6 py-3 rounded mb-8" onClick={handleEndAllRounds}>
        End Round For All Tables
      </button>
      <span className="ml-4 text-lg text-blue-700">{endStatus}</span>
      <input
        type="text"
        placeholder="Search events..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="mb-6 p-2 border rounded w-full"
      />
      <div className="space-y-4">
        {filteredEvents.map((event, idx) => (
          <div key={event.label} className="flex items-center gap-4">
            <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={() => handleEvent(event.propertyNumbers, event.percent, idx)}>
              {event.label}
            </button>
            <button className="bg-red-500 text-white px-4 py-2 rounded" onClick={() => handleCancel(event.propertyNumbers, idx)}>
              Cancel
            </button>
            <span className="ml-2 text-sm">{status[idx]}</span>
          </div>
        ))}
        {filteredEvents.length === 0 && <div className="text-gray-500">No events found.</div>}
      </div>
    </div>
  );
}

export default AdminPage;
