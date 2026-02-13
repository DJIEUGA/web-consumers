import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import {useAuthStore}  from './stores/auth.store.js';
import queryClient from './lib/query-client';
import Home from './pages/home.jsx';
import Decouverte from './pages/decouverte.jsx';
import Connexion from './pages/connexion.jsx';
import Marketplace from './pages/marketplace.jsx';
import Portfolio from './pages/portfolio.jsx';
import Localisation from './pages/localisation.jsx';
import JobAlerte from './pages/jobAlerte.jsx';
import JobExperience from './pages/jobExperience.jsx';
import CollaborationSpace from './pages/collaborationSpace.jsx';
import DashboardFreelance from './pages/dashboardFreelance.jsx';
import ProfilPublicFreelance from './pages/ProfilPublicFreelance.jsx';
import SearchResults from './pages/searchResults.jsx';
import DashboardAdmin from './pages/DashboardAdmin';

import './App.css';

function App() {
  // Initialize auth from localStorage on app mount
  useEffect(() => {
    useAuthStore.getState().initializeAuth();
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/decouverte" element={<Decouverte />} />
            <Route path="/connexion" element={<Connexion />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/localisation" element={<Localisation />} />
            <Route path="/job-alerte" element={<JobAlerte />} />
            <Route path="/job-experience" element={<JobExperience />} />
            <Route path="/collaboration/:freelanceId" element={<CollaborationSpace />} />
            <Route 
              path="/dashboard-freelance" 
              element={
                <ProtectedRoute allowedRoles={['ROLE_PRO', 'ROLE_ENTERPRISE']}>
                  <DashboardFreelance />
                </ProtectedRoute>
              } 
            />
            <Route path="/profil-freelance/:freelanceId" element={<ProfilPublicFreelance />} />
            <Route path="/profil-freelance/:resultId" element={<ProfilPublicFreelance />} />
            <Route path="/profil-freelance" element={<ProfilPublicFreelance />} />
            <Route path="/profil/:id" element={<ProfilPublicFreelance />} />
            <Route path="/search" element={<SearchResults />} />
            <Route 
              path="/dashboard-admin" 
              element={
                <ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_MODERATOR']}>
                  <DashboardAdmin />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </Router>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;