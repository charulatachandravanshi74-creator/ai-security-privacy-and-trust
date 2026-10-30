import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { LandingPage } from './pages/LandingPage.tsx';
import { LoginPage } from './pages/LoginPage.tsx';
import { RegisterPage } from './pages/RegisterPage.tsx';
import { DashboardPage } from './pages/DashboardPage.tsx';
import { ScannerPage } from './pages/ScannerPage.tsx';
import { AssessmentsPage } from './pages/AssessmentsPage.tsx';
import { AuditsPage } from './pages/AuditsPage.tsx';
import { SettingsPage } from './pages/SettingsPage.tsx';
import { Loader2 } from 'lucide-react';

const ProtectedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm">
          <Loader2 className="animate-spin" size={20} />
          <span>Verifying TrustShield session...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />
      <div className="flex-1 flex w-full">
        <Sidebar />
        <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={
              <div className="min-h-screen bg-slate-950 flex flex-col">
                <Navbar />
                <LandingPage />
              </div>
            }
          />
          <Route
            path="/login"
            element={
              <div className="min-h-screen bg-slate-950 flex flex-col">
                <Navbar />
                <LoginPage />
              </div>
            }
          />
          <Route
            path="/register"
            element={
              <div className="min-h-screen bg-slate-950 flex flex-col">
                <Navbar />
                <RegisterPage />
              </div>
            }
          />

          {/* Authenticated Application Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedLayout>
                <DashboardPage />
              </ProtectedLayout>
            }
          />
          <Route
            path="/scanner"
            element={
              <ProtectedLayout>
                <ScannerPage />
              </ProtectedLayout>
            }
          />
          <Route
            path="/assessments"
            element={
              <ProtectedLayout>
                <AssessmentsPage />
              </ProtectedLayout>
            }
          />
          <Route
            path="/audits"
            element={
              <ProtectedLayout>
                <AuditsPage />
              </ProtectedLayout>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedLayout>
                <SettingsPage />
              </ProtectedLayout>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
