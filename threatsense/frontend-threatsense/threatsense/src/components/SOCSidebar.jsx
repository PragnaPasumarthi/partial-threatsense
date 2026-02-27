import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import ThreatSenseLogo from './ThreatSenseLogo';

const SOCSidebar = () => {
  const location = useLocation();
  
  const menuItems = [
    { path: '/soc', label: 'Dashboard', icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 2L2 5v4c0 4 2.7 7.7 6 8.5 3.3-.8 6-4.5 6-8.5V5l-6-3z"/></svg> },
    { path: '/soc/blue', label: 'Blue Team', icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 2c-.6 0-1 .4-1 1v.5C5.3 4 4 5.6 4 7.5V10l-1.5 1.5v.5h11v-.5L12 10V7.5c0-1.9-1.3-3.5-3-4V3c0-.6-.4-1-1-1zM6.5 13c0 .8.7 1.5 1.5 1.5s1.5-.7 1.5-1.5"/></svg> },
    { path: '/soc/red', label: 'Red Team', icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6"/><path d="M8 5v3M8 11h.01"/></svg> },
    { path: '/soc/analyst', label: 'SOC Analyst', icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="5"/><path d="M11 11l3 3"/></svg> },
    { path: '/soc/logs', label: 'Logs', icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><rect x="3" y="2" width="10" height="12" rx="1" stroke="currentColor" fill="none" strokeWidth="1.5"/><path d="M5 5h6M5 8h6M5 11h4"/></svg> }
  ];

  return (
    <aside style={{
      width: '250px',
      backgroundColor: 'rgba(30, 41, 59, 0.8)',
      backdropFilter: 'blur(10px)',
      minHeight: 'calc(100vh - 65px)',
      padding: '2rem 0 1rem',
      borderRight: '1px solid rgba(239, 68, 68, 0.2)',
      position: 'fixed',
      top: '64px',
      left: 0,
      zIndex: 50
    }}>
      <div style={{
        padding: '0 1.5rem 2rem',
        marginBottom: '1.5rem',
        borderBottom: '1px solid rgba(239, 68, 68, 0.1)',
        display: 'flex',
        justifyContent: 'center'
      }}>
        <ThreatSenseLogo size={50} />
      </div>
      {menuItems.map(item => (
        <Link
          key={item.path}
          to={item.path}
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '0.75rem 1.5rem',
            color: location.pathname === item.path ? '#ef4444' : '#94a3b8',
            textDecoration: 'none',
            backgroundColor: location.pathname === item.path ? '#334155' : 'transparent',
            transition: 'all 0.2s'
          }}
        >
          <span style={{ marginRight: '0.75rem' }}>{item.icon}</span>
          {item.label}
        </Link>
      ))}
    </aside>
  );
};

export default SOCSidebar;
