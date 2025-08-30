// src/pages/PropertyListPage.jsx

import { Link } from 'react-router-dom';
// import { propertyData } from '../data/propertyData.js';

// We no longer need to import the local image
// import mapImage from '../assets/bnb-paradise-map.jpg'; 


import React, { useEffect, useState } from 'react';

function PropertyListPage() {
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

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8 pb-4 border-b">
          <h1 className="text-3xl font-bold text-gray-800">Property List & Map</h1>
          <Link 
            to="/login" 
            className="text-sm text-gray-600 hover:text-blue-500 transition-colors"
          >
            &larr; Back to Login
          </Link>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <div>
            <div className="sticky top-8">
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">BNB Paradise Map</h2>
              <img 
                src="https://i.ibb.co/dJp1B47K/Frame-15-final-final-final.jpg" 
                alt="BNB Paradise Map" 
                className="w-full h-auto rounded-lg shadow-lg"
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-3">Residential Properties</h2>
                <ul className="space-y-2 text-sm">
                  {propertyData
                    .filter(p => p.category === 'Residential')
                    .map(prop => (
                      <li key={prop._id || prop.id} className="flex justify-between">
                        <span className="text-gray-800">{prop.name}</span>
                        <span className="font-mono text-gray-500">Map ID: {prop.mapId}</span>
                      </li>
                    ))}
                </ul>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-3">Commercial & Industrial</h2>
                <ul className="space-y-2 text-sm">
                  {propertyData
                    .filter(p => p.category !== 'Residential')
                    .map(prop => (
                      <li key={prop._id || prop.id} className="flex justify-between">
                        <span className="text-gray-800">{prop.name}</span>
                        <span className="font-mono text-gray-500">Map ID: {prop.mapId}</span>
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PropertyListPage;