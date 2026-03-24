import React, { Suspense, lazy, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuthStore } from "./stores/auth.store.js";
import queryClient from "./lib/query-client";

import "./App.css";
import { useAuthProfileSync } from "./features/auth/hooks/useAuthProfileSync";
import InstallAppPrompt from "./components/shared/InstallAppPrompt";

const Home = lazy(() =>
  import("./features/discovery/pages").then((module) => ({
    default: module.Home,
  })),
);

const Decouverte = lazy(() =>
  import("./features/discovery/pages/decouverte/Decouverte.tsx").then(
    (module) => ({ default: module.Decouverte }),
  ),
);

const Connexion = lazy(() =>
  import("./features/auth/pages").then((module) => ({
    default: module.Connexion,
  })),
);

const EmailVerificationPage = lazy(
  () => import("./features/auth/pages/EmailVerificationPage"),
);

const ForgotPasswordPage = lazy(
  () => import("./features/auth/pages/ForgotPasswordPage"),
);

const ResetPasswordPage = lazy(
  () => import("./features/auth/pages/ResetPasswordPage"),
);

const Marketplace = lazy(() =>
  import("./features/marketplace/pages").then((module) => ({
    default: module.Marketplace,
  })),
);

const Portfolio = lazy(() =>
  import("./features/portfolio/pages").then((module) => ({
    default: module.Portfolio,
  })),
);

const Localisation = lazy(() =>
  import("./features/localisation/pages").then((module) => ({
    default: module.Localisation,
  })),
);

const JobAlerte = lazy(() =>
  import("./features/jobalerte/pages").then((module) => ({
    default: module.JobAlerte,
  })),
);

const JobExperience = lazy(() =>
  import("./features/jobexperience/pages").then((module) => ({
    default: module.JobExperience,
  })),
);

const CollaborationSpace = lazy(() =>
  import("./features/collaboration/pages").then((module) => ({
    default: module.CollaborationSpace,
  })),
);

const ProfilPublicFreelance = lazy(() =>
  import("./features/profile/pages").then((module) => ({
    default: module.ProfilPublicFreelance,
  })),
);

const UserDashboard = lazy(() => import("./features/dashboard/pages/index.tsx"));

const SearchResults = lazy(
  () => import("./features/discovery/pages/search/SearchResults.tsx"),
);

const NotFound = lazy(() => import("./pages/NotFound.tsx"));

function AuthProfileBootstrap() {
  useAuthProfileSync();
  return null;
}

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
          <AuthProfileBootstrap />
          <InstallAppPrompt />
          <Suspense fallback={null}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/decouverte" element={<Decouverte />} />
              <Route path="/connexion" element={<Connexion />} />
              <Route path="/auth/confirm" element={<EmailVerificationPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/auth/password/reset" element={<ResetPasswordPage />} />
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
              <Route
                path="/profiles/:identifier"
                element={<ProfilPublicFreelance />}
              />
              <Route path="/search" element={<SearchResults />} />
              <Route
                path="/dashboard/*"
                element={
                  <ProtectedRoute>
                    <UserDashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </Router>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
