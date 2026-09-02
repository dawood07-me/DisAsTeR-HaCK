import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DisasterProvider } from './context/DisasterContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { SOSModal } from './components/SOSModal';

// Pages
import { AuthPage } from './pages/AuthPage';
import { Dashboard } from './pages/Dashboard';
import { AIPrediction } from './pages/AIPrediction';
import { WeatherPage } from './pages/WeatherPage';
import { SOSPage } from './pages/SOSPage';
import { RescuePage } from './pages/RescuePage';
import { ReliefPage } from './pages/ReliefPage';
import { MissingPage } from './pages/MissingPage';
import { DamagePage } from './pages/DamagePage';
import { ShelterPage } from './pages/ShelterPage';
import { AdminPage } from './pages/AdminPage';

import { ShieldAlert, Clock, LogOut, CheckCircle2 } from 'lucide-react';

// ─── PENDING VERIFICATION OVERLAY ───────────────────────
const PendingVerificationOverlay = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-950/30 via-slate-950 to-slate-950">
      <div className="w-full max-w-md bg-slate-900/90 border border-amber-800/50 rounded-3xl p-8 shadow-2xl backdrop-blur-xl text-center space-y-6">
        {/* Animated Clock */}
        <div className="inline-flex p-4 rounded-3xl bg-gradient-to-tr from-amber-600 to-orange-600 text-white shadow-2xl shadow-amber-500/20 animate-pulse">
          <Clock className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black text-white">Account Under Verification</h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Your <span className="text-amber-400 font-bold">{user?.role}</span> account is currently being reviewed by a Government Admin.
          </p>
        </div>

        {/* Status Card */}
        <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-800/40 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-bold">Name</span>
            <span className="text-white font-bold">{user?.name}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-bold">Email</span>
            <span className="text-white font-bold">{user?.email}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-bold">Role</span>
            <span className="text-amber-400 font-bold">{user?.role}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-bold">Status</span>
            <span className="px-2.5 py-1 rounded-lg bg-amber-900/60 text-amber-300 font-extrabold text-[10px] flex items-center gap-1">
              <Clock className="w-3 h-3" /> PENDING VERIFICATION
            </span>
          </div>
          {user?.organization && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-bold">Organization</span>
              <span className="text-white font-bold">{user.organization}</span>
            </div>
          )}
          {user?.department && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-bold">Department</span>
              <span className="text-white font-bold">{user.department}</span>
            </div>
          )}
        </div>

        <p className="text-[11px] text-slate-500 leading-relaxed">
          Please wait for approval from a Government Admin. You will gain full access once your identity and credentials are verified.
        </p>

        <button
          onClick={logout}
          className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition"
        >
          <LogOut className="w-4 h-4" /> Sign Out & Try Different Account
        </button>
      </div>
    </div>
  );
};

// ─── REJECTED VERIFICATION OVERLAY ──────────────────────
const RejectedVerificationOverlay = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950">
      <div className="w-full max-w-md bg-slate-900/90 border border-red-800/50 rounded-3xl p-8 shadow-2xl text-center space-y-6">
        <div className="inline-flex p-4 rounded-3xl bg-gradient-to-tr from-red-600 to-rose-600 text-white shadow-2xl">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-black text-white">Verification Rejected</h1>
        <p className="text-sm text-slate-400">
          Your <span className="text-red-400 font-bold">{user?.role}</span> account was not approved. Please contact administration or register with valid credentials.
        </p>
        <button
          onClick={logout}
          className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition"
        >
          <LogOut className="w-4 h-4" /> Sign Out & Try Different Account
        </button>
      </div>
    </div>
  );
};

// ─── MAIN APP CONTENT ───────────────────────────────────
const AppContent = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If user is not authenticated, show Auth Page
  if (!user) {
    return <AuthPage />;
  }

  // If user verification is pending, show pending overlay
  if (user.verification_status === 'Pending') {
    return <PendingVerificationOverlay />;
  }

  // If user verification is rejected, show rejection message
  if (user.verification_status === 'Rejected') {
    return <RejectedVerificationOverlay />;
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard setActiveTab={setActiveTab} />;
      case 'prediction':
        return <AIPrediction />;
      case 'weather':
        return <WeatherPage />;
      case 'sos':
        return <SOSPage />;
      case 'rescue':
        return <RescuePage />;
      case 'relief':
        return <ReliefPage />;
      case 'missing':
        return <MissingPage />;
      case 'damage':
        return <DamagePage />;
      case 'shelter':
        return <ShelterPage />;
      case 'admin':
        return <AdminPage />;
      default:
        return <Dashboard setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-cyan-500 selection:text-white transition-colors duration-200">
      
      {/* Top Navigation Bar with Mobile Hamburger Menu Trigger */}
      <Navbar 
        onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)} 
      />

      {/* Main Container */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto relative">
        {/* Navigation Sidebar (Desktop + Mobile Slide-In Drawer) */}
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setMobileMenuOpen(false); // Close mobile drawer when link clicked
          }} 
          mobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />

        {/* Dynamic Page Workspace */}
        <main className="flex-1 p-3 sm:p-4 lg:p-8 overflow-x-hidden min-h-[calc(100vh-4rem)] w-full">
          {renderTabContent()}
        </main>
      </div>

      {/* Global Floating SOS Modal */}
      <SOSModal />

    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DisasterProvider>
          <AppContent />
        </DisasterProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
