import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './store/useAuthStore';
import Navbar from './components/Navbar';

// Lazy/direct load pages
import LandingPage from './pages/LandingPage';
import GamePage from './pages/GamePage';

import LeaderboardPage from './pages/LeaderboardPage';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import { Login, Register, ForgotPassword, ResetPassword, VerifyEmailPage } from './pages/AuthPages';
import InstructionsPage from './pages/InstructionsPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';

// Protected Route wrappers
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isInitialized } = useAuthStore();
  
  if (!isInitialized) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#0D1117]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-primary" />
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isInitialized } = useAuthStore();

  if (!isInitialized) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#0D1117]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-primary" />
      </div>
    );
  }

  return user && user.role === 'admin' ? <>{children}</> : <Navigate to="/" replace />;
};

const queryClient = new QueryClient();

export default function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <QueryClientProvider client={queryClient}>
      <HashRouter>
      <div className="min-h-screen bg-[#0D1117] text-slate-100 flex flex-col selection:bg-primary selection:text-darkbg">
        <Navbar />
        <main className="flex-1 flex flex-col">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/play" element={<GamePage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/instructions" element={<InstructionsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            
            {/* Guest Only Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />

            {/* Authenticated Routes */}

            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />

            {/* Admin Routes */}
            <Route path="/admin" element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } />

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
    </QueryClientProvider>
  );
}
