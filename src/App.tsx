import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuthStore } from "./stores/auth.store.js";
import queryClient from "./lib/query-client";
import { Connexion } from "./features/auth/pages";
import EmailVerificationPage from "./features/auth/pages/EmailVerificationPage";
import { Home } from "./features/discovery/pages";
import { Marketplace } from "./features/marketplace/pages";
import { Decouverte } from "./features/discovery/pages/decouverte/Decouverte.tsx";
import { Portfolio } from "./features/portfolio/pages";
import { Localisation } from "./features/localisation/pages";
import { JobAlerte } from "./features/jobalerte/pages";
import { JobExperience } from "./features/jobexperience/pages";
import { CollaborationSpace } from "./features/collaboration/pages";
import { ProfilPublicFreelance } from "./features/profile/pages";

import "./App.css";
import UserDashboard from "./features/dashboard/pages/index.tsx";
import NotFound from "./pages/NotFound.tsx";
import SearchResults from "./features/discovery/pages/search/SearchResults.tsx";

function App() {
  // Initialize auth from localStorage on app mount
  useEffect(() => {
    console.log("[APP] App mounted, initializing auth");
    const authStore = useAuthStore.getState();
    authStore.initializeAuth();

    // Check token expiry immediately
    authStore.checkTokenExpiry();
  }, []);

  // Periodic token expiry check (every 5 minutes)
  useEffect(() => {
    const interval = setInterval(
      () => {
        useAuthStore.getState().checkTokenExpiry();
      },
      5 * 60 * 1000,
    ); // 5 minutes

    return () => clearInterval(interval);
  }, []);

  // Check token expiry when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        useAuthStore.getState().checkTokenExpiry();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/decouverte" element={<Decouverte />} />
            <Route path="/connexion" element={<Connexion />} />
            <Route path="/auth/confirm" element={<EmailVerificationPage />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/localisation" element={<Localisation />} />
            <Route path="/job-alerte" element={<JobAlerte />} />
            <Route path="/job-experience" element={<JobExperience />} />
            <Route
              path="/collaboration/:freelanceId"
              element={<CollaborationSpace />}
            />
            <Route
              path="/profil-freelance/:freelanceId"
              element={<ProfilPublicFreelance />}
            />
            <Route
              path="/profil-freelance/:resultId"
              element={<ProfilPublicFreelance />}
            />
            <Route
              path="/profil-freelance"
              element={<ProfilPublicFreelance />}
            />
            <Route path="/profil/:id" element={<ProfilPublicFreelance />} />
            <Route path="/search" element={<SearchResults />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
