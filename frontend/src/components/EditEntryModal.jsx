// src/components/EditEntryModal.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext'; // 1. Import useAuth

const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', maximumFractionDigits: 2
}).format(amount);

function EditEntryModal({ entry, onClose, onUpdateSuccess }) {
  const { token } = useAuth(); // 2. Get the token
  const [brokeragePercent, setBrokeragePercent] = useState(0);
  const [settings, setSettings] = useState(null); // 3. Add state for settings

  useEffect(() => {
    if (entry) {
      setBrokeragePercent(entry.brokeragePercent || 0);
    }
  }, [entry]);

  // 4. Add a useEffect to fetch settings when the modal opens
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

  if (!entry) return null;

  // 5. Create a new function for the correct price calculation
  const calculateFinalPrice = () => {
    if (!entry || !settings) return 0;
    const grandTotal = entry.grandTotal;
    const brokerage = grandTotal * ((parseFloat(brokeragePercent) || 0) / 100);
    const stampDutyPercent = settings.stampDuty[entry.category] || 0;
    const stampDuty = grandTotal * (stampDutyPercent / 100);
    const registrationFee = grandTotal * (settings.registrationFeePercent / 100);
    return grandTotal + brokerage + stampDuty + registrationFee;
  };

  const finalPrice = calculateFinalPrice(); // Use the new calculation function

  const handleUpdate = async () => {
    const percent = parseFloat(brokeragePercent);
    if (isNaN(percent) || percent <= 0) {
      alert('Please enter a valid brokerage percentage.');
      return;
    }
    if (percent > 15) {
      alert('Brokerage cannot exceed 15%.');
      return;
    }
    
    const finalTotal = calculateFinalPrice(); // Use the correct final total
    const updatedData = { brokeragePercent: percent, finalTotal };

    try {
      // 6. Add the Authorization header to the PUT request
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/entries/${entry._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedData),
      });

       if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Server failed to update the entry.");
       }

      onUpdateSuccess();
    } catch (error) {
      console.error("Update Error:", error);
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="bg-white rounded-xl shadow-2xl w-11/12 md:w-2/3 lg:w-1/2 modal-content">
        <div className="p-6 border-b flex justify-between items-center"><h2 className="text-2xl font-semibold text-gray-900">Edit Entry</h2><button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">&times;</button></div>
        <div className="p-6 md:p-8">
          <div className="space-y-2 bg-gray-50 p-4 rounded-lg mb-6"><h3 className="font-semibold text-lg">Editing: {entry.name}</h3><p className="text-sm"><strong>Original Amount:</strong> {formatCurrency(entry.grandTotal)}</p></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div><label htmlFor="brokerage-percent-edit" className="block text-sm font-medium mb-1">Brokerage (%)</label><input type="number" id="brokerage-percent-edit" className="w-full p-3 border border-gray-300 rounded-lg" placeholder="e.g., 2.5" value={brokeragePercent} onChange={(e) => setBrokeragePercent(e.target.value)} /></div>
            <div className="bg-blue-50 p-4 rounded-lg"><label className="block text-sm font-medium">New Final Price (incl. fees)</label><p className="text-2xl font-bold text-blue-700">{settings ? formatCurrency(finalPrice) : 'Calculating...'}</p></div>
          </div>
        </div>
        <div className="p-6 bg-gray-50 border-t text-right space-x-3"><button onClick={onClose} className="bg-gray-200 px-4 py-2 rounded-lg">Cancel</button><button onClick={handleUpdate} className="bg-blue-600 text-white px-4 py-2 rounded-lg">Save Changes</button></div>
      </div>
    </div>
  );
}

export default EditEntryModal;