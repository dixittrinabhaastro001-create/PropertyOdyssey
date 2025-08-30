// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import ParticipantLogin from './pages/ParticipantLogin';
import BrokerDashboard from './pages/BrokerDashboard';
import VerificationSystem from './pages/VerificationSystem';
import PropertyListPage from './pages/PropertyListPage';
import ParticipantDashboard from './pages/ParticipantDashboard';

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/participant-login" element={<ParticipantLogin />} />
      <Route path="/property-list" element={<PropertyListPage />} />

      {/* Main Layout for Authenticated Users */}
      <Route element={<Layout />}>
        {/* Broker-only Route */}
        <Route element={<ProtectedRoute allowedRoles={['Broker']} />}>
          <Route path="/dashboard" element={<BrokerDashboard />} />
        </Route>

        {/* Manager-only Route */}
        <Route element={<ProtectedRoute allowedRoles={['Manager']} />}>
          <Route path="/verify" element={<VerificationSystem />} />
        </Route>

        {/* Participant-only Route */}
        <Route element={<ProtectedRoute allowedRoles={['Participant']} />}>
          <Route path="/participant-dashboard" element={<ParticipantDashboard />} />
        </Route>
      </Route>
      
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;