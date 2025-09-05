// src/components/TeamLedgerTable.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext'; // 1. Import useAuth to get the token

const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2
}).format(amount);

function TeamLedgerTable({ activeTable, activeTeamId, activeTeamName }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth(); // 2. Get the token from the Auth context

  useEffect(() => {
    const fetchData = async () => {
      // 3. Also check if the token exists before trying to fetch
      if (!activeTable || !activeTeamId || !token) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/entries/${activeTeamId}?table=${activeTable}`, {
          // 4. Add the required Authorization header to your request
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setEntries(data);
      } catch (error) {
        console.error("Failed to fetch ledger data:", error);
        setEntries([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeTable, activeTeamId, token]); // Add token to the dependency array

  if (loading) return <div className="text-center py-10">Loading Ledger...</div>;
  if (entries.length === 0) return <div className="text-center text-gray-500 py-10">No entries for this team in this table.</div>;

  const total = entries.reduce((acc, e) => acc + (e.totalCost || 0), 0);

  return (
    <div className="overflow-x-auto">
      <h3 className="text-xl font-bold mb-4 text-gray-800">Ledger for {activeTable.replace('table', 'Table ')} - {activeTeamName}</h3>
      <table className="min-w-full text-sm bg-white shadow-md rounded-lg">
        <thead className="bg-gray-100">
          <tr className="text-left text-gray-600">
            <th className="px-4 py-2 text-center">S.No</th>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2 text-right">Amount</th>
            <th className="px-4 py-2 text-right">Broker %</th>
            <th className="px-4 py-2 text-right">Final Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {entries.map((item, i) => (
            <tr key={item._id} className="border-b hover:bg-gray-50">
              <td className="px-4 py-3 text-center">{i + 1}</td>
              <td className="px-4 py-3 font-medium">{item.name}</td>
              <td className="px-4 py-3 text-right">{formatCurrency(item.grandTotal)}</td>
              <td className="px-4 py-3 text-right text-green-600 font-medium">{item.brokeragePercent}%</td>
              <td className="px-4 py-3 text-right font-semibold">{formatCurrency(item.totalCost)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="font-bold bg-gray-100">
            <td colSpan="4" className="text-right px-4 py-3">Total</td>
            <td className="text-right px-4 py-3 text-blue-700 text-base">{formatCurrency(total)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export default TeamLedgerTable;