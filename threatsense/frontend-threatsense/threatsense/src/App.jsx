import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import SOCSidebar from './components/SOCSidebar';
import LandingPage from './pages/LandingPage';
import DemoPage from './pages/DemoPage';
import Dashboard from './pages/Dashboard';
import RolesPage from './pages/RolesPage';
import { Owner, Finance, Sales, HR, Support } from './pages/Departments';
import SOCDashboard from './pages/soc/SOCDashboard';
import BlueTeam from './pages/soc/BlueTeam';
import RedTeam from './pages/soc/RedTeam';
import SOCAnalyst from './pages/soc/SOCAnalyst';
import SOCLogs from './pages/soc/SOCLogs';
import { SessionProvider, useSession } from './context/SessionContext';
import TelemetryTracker from './components/TelemetryTracker';

const PendingVerification = () => (
  <div style={{
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0f172a',
    color: '#fff',
    textAlign: 'center',
    padding: '2rem'
  }}>
    <h2 style={{ color: '#60a5fa', marginBottom: '1rem' }}>Check Your Email</h2>
    <p style={{ color: '#94a3b8', maxWidth: '400px' }}>
      We've sent a verification link to your email. Your workspace will unlock automatically once you click "Yes, I'm In" on your mobile device.
    </p>
    <div style={{ marginTop: '2rem', border: '1px solid #3b82f6', padding: '1rem', borderRadius: '8px', animation: 'pulse 2s infinite' }}>
      Waiting for signal...
    </div>
    <style>{`
      @keyframes pulse {
        0% { opacity: 0.6; }
        50% { opacity: 1; }
        100% { opacity: 0.6; }
      }
    `}</style>
  </div>
);

const TerminatedScreen = () => (
  <div style={{
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#7f1d1d',
    color: '#fff',
    textAlign: 'center',
    padding: '2rem'
  }}>
    <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠ LOCKDOWN</h1>
    <h2>SESSION TERMINATED</h2>
    <p style={{ color: '#fecaca', maxWidth: '500px', marginTop: '1rem' }}>
      Security Alert: This session has been terminated due to suspicious behavioral patterns.
      Your access has been revoked and the SOC team has been notified.
    </p>
    <button
      onClick={() => window.location.href = '/'}
      style={{
        marginTop: '2rem',
        padding: '0.75rem 2rem',
        background: '#fff',
        color: '#7f1d1d',
        border: 'none',
        borderRadius: '8px',
        fontWeight: 'bold',
        cursor: 'pointer'
      }}
    >
      Return to Home
    </button>
  </div>
);

const DashboardLayout = ({ children }) => {
  const { status } = useSession();

  if (status === 'TERMINATED') return <TerminatedScreen />;
  if (status === 'PENDING') return <PendingVerification />;
  if (status === 'UNAUTHENTICATED') return <Navigate to="/" />;

  return (
    <div className="dashboard-layout" style={{ position: 'relative', minHeight: '100vh' }}>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'linear-gradient(180deg, #0f1729 0%, #1a2332 50%, #0f1729 100%)',
        zIndex: -3
      }} />
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: 'linear-gradient(rgba(59, 130, 246, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.03) 1px, transparent 1px)',
        backgroundSize: '50px 50px',
        zIndex: -2
      }} />
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.15) 0%, transparent 40%), radial-gradient(circle at 80% 30%, rgba(139, 92, 246, 0.1) 0%, transparent 40%), radial-gradient(circle at 50% 80%, rgba(34, 211, 238, 0.08) 0%, transparent 45%)',
        animation: 'gradientPulse 20s ease-in-out infinite',
        zIndex: -1
      }} />
      <Navbar />
      <Sidebar />
      <div className="main-content">
        {children}
      </div>
    </div>
  );
};

const SOCLayout = ({ children }) => {
  const { status } = useSession();

  if (status === 'TERMINATED') return <TerminatedScreen />;
  if (status === 'PENDING') return <PendingVerification />;
  if (status === 'UNAUTHENTICATED') return <Navigate to="/" />;

  return (
    <div className="dashboard-layout" style={{ position: 'relative', minHeight: '100vh' }}>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'linear-gradient(180deg, #0f1729 0%, #1a2332 50%, #0f1729 100%)',
        zIndex: -3
      }} />
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: 'linear-gradient(rgba(59, 130, 246, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.03) 1px, transparent 1px)',
        backgroundSize: '50px 50px',
        zIndex: -2
      }} />
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'radial-gradient(circle at 20% 20%, rgba(239, 68, 68, 0.12) 0%, transparent 40%), radial-gradient(circle at 80% 30%, rgba(251, 146, 60, 0.1) 0%, transparent 40%), radial-gradient(circle at 50% 80%, rgba(59, 130, 246, 0.08) 0%, transparent 45%)',
        animation: 'gradientPulse 20s ease-in-out infinite',
        zIndex: -1
      }} />
      <Navbar />
      <SOCSidebar />
      <div className="main-content">
        {children}
      </div>
    </div>
  );
};

import { SOCProvider } from './context/SOCContext';

const App = () => {
  return (
    <SessionProvider>
      <SOCProvider>
        <Router>
          <TelemetryTracker />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/demo" element={<DemoPage />} />
            <Route path="/dashboard/*" element={
              <DashboardLayout>
                <Routes>
                  <Route index element={<Dashboard />} />
                  <Route path="roles" element={<RolesPage />} />
                  <Route path="owner" element={<Owner />} />
                  <Route path="finance" element={<Finance />} />
                  <Route path="sales" element={<Sales />} />
                  <Route path="hr" element={<HR />} />
                  <Route path="support" element={<Support />} />
                  <Route path="alerts" element={<div style={{ padding: '2rem' }}><h2>Alerts</h2><p>System alerts will appear here.</p></div>} />
                </Routes>
              </DashboardLayout>
            } />
            <Route path="/soc/*" element={
              <SOCLayout>
                <Routes>
                  <Route index element={<SOCDashboard />} />
                  <Route path="blue" element={<BlueTeam />} />
                  <Route path="red" element={<RedTeam />} />
                  <Route path="analyst" element={<SOCAnalyst />} />
                  <Route path="logs" element={<SOCLogs />} />
                </Routes>
              </SOCLayout>
            } />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </SOCProvider>
    </SessionProvider>
  );
};

export default App;