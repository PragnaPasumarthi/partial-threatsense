import React from 'react';
import './BlueTeam.css';

const ShieldIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const RadarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="2" />
    <path d="M12 2v4m0 12v4M2 12h4m12 0h4" />
    <circle cx="12" cy="12" r="7" />
    <circle cx="12" cy="12" r="11" />
  </svg>
);

const DatabaseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
  </svg>
);

const LockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const FlowIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M12 1v6m0 6v6M5.6 5.6l4.2 4.2m4.4 4.4l4.2 4.2M1 12h6m6 0h6M5.6 18.4l4.2-4.2m4.4-4.4l4.2-4.2" />
  </svg>
);

const StorageIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="5" rx="2" />
    <rect x="2" y="10" width="20" height="5" rx="2" />
    <rect x="2" y="17" width="20" height="5" rx="2" />
  </svg>
);

const ShieldNetworkIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <circle cx="12" cy="10" r="2" />
  </svg>
);

const BugIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M4.93 4.93l14.14 14.14" />
  </svg>
);

const EmailWarningIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
    <path d="M12 13v3m0 3h.01" />
  </svg>
);

const UserShieldIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="8.5" cy="7" r="4" />
    <path d="M20 8v6m-3-3h6" />
  </svg>
);

const ShieldCheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);

import { useSOC } from '../../context/SOCContext';

const BlueTeam = () => {
  const { alerts, metrics, departmentMetrics } = useSOC();

  const defenseNodes = [
    { name: 'Firewall Cluster A', status: 'Active', load: 42, icon: <ShieldIcon /> },
    { name: 'IDS/IPS Node 1', status: 'Monitoring', load: 68, icon: <RadarIcon /> },
    { name: 'Secure Database', status: 'Encrypted', load: 12, icon: <DatabaseIcon /> },
    { name: 'Auth Server', status: 'Secure', load: 24, icon: <LockIcon /> },
    { name: 'Load Balancer', status: 'Optimized', load: 55, icon: <FlowIcon /> }
  ];

  const threats = [
    { label: 'Active Anomalies', value: alerts.length, color: '#ef4444', icon: <UserShieldIcon /> },
    { label: 'High Risk Entities', value: alerts.filter(a => a.risk_level === 'High').length, color: '#f97316', icon: <BugIcon /> },
    { label: 'Resolved (24h)', value: metrics.resolvedToday, color: '#10b981', icon: <ShieldCheckIcon /> },
    { label: 'Total Protected', value: 1250, color: '#3b82f6', icon: <ShieldNetworkIcon /> }
  ];

  return (
    <div className="blue-team">
      <div className="blue-header">
        <div className="header-left">
          <div className="status-indicator">
            <span className="pulse-dot"></span>
            <span className="status-text">STRATEGY LAYER ACTIVE</span>
          </div>
          <h1 className="blue-title">Blue Team Oversight</h1>
          <p className="blue-subtitle">Defensive perimeter monitoring and asset protection</p>
        </div>
      </div>

      <div className="blue-grid" style={{ gridTemplateColumns: '1fr 400px' }}>
        <div className="defense-panel">
          <h2 className="panel-title">Organizational Risk Baseline</h2>
          <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15, 23, 42, 0.3)', borderRadius: '12px', marginBottom: '2rem' }}>
            <svg width="400" height="250" viewBox="0 0 400 250">
              <circle cx="200" cy="125" r="100" fill="none" stroke="#1e293b" strokeWidth="20" />
              <circle cx="200" cy="125" r="100" fill="none" stroke="#3b82f6" strokeWidth="20"
                strokeDasharray={`${(metrics.avgRiskScore / 100) * 628} 628`} strokeDashoffset="0" transform="rotate(-90 200 125)" />
              <text x="200" y="125" textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize="32" fontWeight="bold">{metrics.avgRiskScore}%</text>
              <text x="200" y="155" textAnchor="middle" fill="#94a3b8" fontSize="12">AVG RISK SCORE</text>
            </svg>
          </div>

          <h3 className="panel-title">Department Risk Breakdown</h3>
          <div className="panel" style={{ background: 'rgba(15, 23, 42, 0.4)', borderRadius: '12px', padding: '1rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ color: '#64748b', fontSize: '0.8rem', textAlign: 'left', borderBottom: '1px solid #1e293b' }}>
                  <th style={{ padding: '0.75rem' }}>DEPARTMENT</th>
                  <th style={{ padding: '0.75rem' }}>ANOMALIES</th>
                  <th style={{ padding: '0.75rem' }}>RISK LOADING</th>
                </tr>
              </thead>
              <tbody>
                {departmentMetrics.map(dept => (
                  <tr key={dept.department} style={{ borderBottom: '1px solid #1e293b' }}>
                    <td style={{ padding: '1rem', color: '#f1f5f9', fontWeight: '500' }}>{dept.department}</td>
                    <td style={{ padding: '1rem', color: '#ef4444' }}>{dept.anomalies}</td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ flex: 1, height: '4px', background: '#1e293b', borderRadius: '2px' }}>
                          <div style={{
                            width: `${(dept.anomalies / (alerts.length || 1)) * 100}%`,
                            height: '100%',
                            background: '#3b82f6',
                            borderRadius: '2px'
                          }}></div>
                        </div>
                        <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{dept.avgRiskScore}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="right-panels">
          <div className="threat-panel" style={{ height: 'auto' }}>
            <h2 className="panel-title">Security State Sync</h2>
            <div className="threat-metrics">
              {threats.map((threat, idx) => (
                <div key={idx} className="threat-item" style={{ marginBottom: '1.5rem' }}>
                  <div className="threat-header">
                    <div className="threat-label-group">
                      <span className="threat-icon" style={{ color: threat.color }}>{threat.icon}</span>
                      <span className="threat-label">{threat.label}</span>
                    </div>
                    <span className="threat-value">{threat.value.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="health-panel" style={{ marginTop: '2rem' }}>
            <div className="health-icon">
              <ShieldCheckIcon />
            </div>
            <h2 className="panel-title">Defensive Posture</h2>
            <div className="health-score" style={{ color: alerts.length > 5 ? '#f97316' : '#22c55e' }}>
              {100 - (alerts.length * 2)}%
            </div>
            <p className="health-summary">
              {alerts.length > 0 ?
                `ML engine has identified ${alerts.length} behavioral deviations. Perimeter defenses remain active.` :
                "System integrity is optimal. No active behavioral anomalies detected."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlueTeam;
