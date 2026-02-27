import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import ThreatSenseLogo from './ThreatSenseLogo';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  
  const menuItems = [
    { 
      path: '/dashboard', 
      label: 'Dashboard', 
      icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="6" height="6" rx="1"/><rect x="11" y="3" width="6" height="6" rx="1"/><rect x="3" y="11" width="6" height="6" rx="1"/><rect x="11" y="11" width="6" height="6" rx="1"/></svg> 
    },
    { 
      path: '/dashboard/hr', 
      label: 'HR', 
      icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="10" cy="6" r="3"/><path d="M4 18c0-3.3 2.7-6 6-6s6 2.7 6 6"/></svg> 
    },
    { 
      path: '/dashboard/sales', 
      label: 'Sales', 
      icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 15l4-4 4 4 6-8"/></svg> 
    },
    { 
      path: '/dashboard/support', 
      label: 'Support', 
      icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M10 2C5.6 2 2 5.6 2 10c0 1.5.4 2.9 1.1 4.1L2 18l3.9-1.1C7.1 17.6 8.5 18 10 18c4.4 0 8-3.6 8-8s-3.6-8-8-8z"/><circle cx="10" cy="10" r="4"/></svg> 
    },
    { 
      path: '/soc', 
      label: 'SOC Team', 
      icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M10 2L3 5v5c0 4.4 3 8.5 7 9.6 4-1.1 7-5.2 7-9.6V5l-7-3z"/></svg> 
    }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <ThreatSenseLogo size={50} />
      </div>
      
      <nav className="sidebar-nav">
        {menuItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
