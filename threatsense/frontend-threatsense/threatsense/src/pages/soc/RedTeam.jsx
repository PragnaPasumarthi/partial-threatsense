import React from 'react';
import './RedTeam.css';

const TargetIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

const BugShieldIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L4 6v6c0 5.5 3.8 10.7 8 12 4.2-1.3 8-6.5 8-12V6l-8-4z" />
    <path d="M12 8v4m0 4h.01" />
  </svg>
);

const LightningIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const NetworkIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="2" />
    <circle cx="19" cy="5" r="2" />
    <circle cx="5" cy="19" r="2" />
    <circle cx="19" cy="19" r="2" />
    <path d="M13.5 10.5l4-4m-11 11l4-4m0-5.5l-4 4" />
  </svg>
);

const WarningIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

import { useSOC } from '../../context/SOCContext';

const RedTeam = () => {
  const { simulateAttack } = useSOC();
  const [lastResult, setLastResult] = React.useState(null);

  const handleSimulate = async (type) => {
    try {
      const res = await simulateAttack(type);
      setLastResult(res);
    } catch (err) {
      alert("Simulation failed");
    }
  };

  const kpis = [
    { label: 'Simulations Run', value: '142', icon: <TargetIcon />, id: 'SIM-09' },
    { label: 'Vulnerabilities Found', value: '18', icon: <BugShieldIcon />, id: 'VUL-09' },
    { label: 'Exploit Rate', value: '12.4%', icon: <LightningIcon />, id: 'EXP-09' },
    { label: 'Critical Paths Identified', value: '3', icon: <NetworkIcon />, id: 'CRT-09' }
  ];

  const chartData = [
    { time: '00:00', rate: 20 },
    { time: '04:00', rate: 40 },
    { time: '08:00', rate: 25 },
    { time: '12:00', rate: 75 },
    { time: '16:00', rate: 50 },
    { time: '20:00', rate: 82 },
    { time: '23:59', rate: 55 }
  ];

  const findings = [
    { title: 'Unpatched RCE', severity: 'Critical', time: '2h ago', color: '#dc2626' },
    { title: 'Weak SSH Keys', severity: 'High', time: '5h ago', color: '#fb923c' },
    { title: 'Exposed API Endpoint', severity: 'Medium', time: '12h ago', color: '#f59e0b' },
    { title: 'Default Credentials', severity: 'High', time: '1d ago', color: '#fb923c' }
  ];

  const maxRate = Math.max(...chartData.map(d => d.rate));

  return (
    <div className="red-team">
      <div className="red-header">
        <div className="status-indicator">
          <span className="pulse-dot red"></span>
          <span className="status-text">SYSTEM ONLINE</span>
        </div>
        <h1 className="red-title">Red Team Operations</h1>
        <p className="red-subtitle">Adversary simulation and vulnerability assessment</p>
      </div>

      <div className="kpi-strip">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="kpi-card">
            <div className="kpi-id">{kpi.id}</div>
            <div className="kpi-icon">{kpi.icon}</div>
            <div className="kpi-value">{kpi.value}</div>
            <div className="kpi-label">{kpi.label}</div>
          </div>
        ))}
      </div>

      <div className="red-grid">
        <div className="chart-panel">
          <h2 className="panel-title">Run Adversary Simulation</h2>
          <div className="sim-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
            <button
              onClick={() => handleSimulate('abnormal_login')}
              className="sim-action-card"
              style={{ padding: '1.5rem', background: 'rgba(220, 38, 38, 0.1)', border: '1px solid rgba(220, 38, 38, 0.3)', borderRadius: '12px', textAlign: 'left', transition: 'all 0.3s ease' }}
            >
              <div style={{ color: '#ef4444', fontWeight: 'bold' }}>Brute Force Login</div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Triggers temporal and credential flags</div>
            </button>
            <button
              onClick={() => handleSimulate('volume_spike')}
              className="sim-action-card"
              style={{ padding: '1.5rem', background: 'rgba(249, 115, 22, 0.1)', border: '1px solid rgba(249, 115, 22, 0.3)', borderRadius: '12px', textAlign: 'left' }}
            >
              <div style={{ color: '#f97316', fontWeight: 'bold' }}>Data Exfiltration</div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Triggers volume threshold flags</div>
            </button>
            <button
              onClick={() => handleSimulate('privilege_escalation')}
              className="sim-action-card"
              style={{ padding: '1.5rem', background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '12px', textAlign: 'left' }}
            >
              <div style={{ color: '#8b5cf6', fontWeight: 'bold' }}>Privilege Escalation</div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Triggers sequential behavioral flags</div>
            </button>
            <button
              onClick={() => handleSimulate('risk_tamper')}
              className="sim-action-card"
              style={{ padding: '1.5rem', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '12px', textAlign: 'left' }}
            >
              <div style={{ color: '#3b82f6', fontWeight: 'bold' }}>Tamper Risk Score</div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Simulate adversary modifying behavioral thresholds</div>
            </button>
          </div>

          {lastResult && (
            <div className="sim-result" style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(15, 23, 42, 0.5)', borderRadius: '12px', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ color: '#e2e8f0', fontWeight: '600' }}>Simulation Results</span>
                <span style={{ color: '#ef4444' }}>DETECTION SUCCESSFUL</span>
              </div>
              <div style={{ display: 'flex', gap: '2rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Risk Shift</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ef4444' }}>
                    {lastResult.before_risk}% → {Math.round(lastResult.after_risk)}%
                  </div>
                </div>
                <div style={{ flex: 2 }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Triggered Signals</div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    {lastResult.triggered_signals.map(s => (
                      <span key={s} style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '4px 12px', borderRadius: '4px', fontSize: '0.8rem' }}>
                        {s.toUpperCase()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="findings-panel">
          <h2 className="panel-title">Recent Findings</h2>
          <div className="findings-list">
            {findings.map((finding, idx) => (
              <div key={idx} className="finding-item">
                <div className="finding-icon">
                  <WarningIcon />
                </div>
                <div className="finding-content">
                  <div className="finding-title">{finding.title}</div>
                  <div className="finding-time">{finding.time}</div>
                </div>
                <span className="severity-badge" style={{
                  backgroundColor: `${finding.color}20`,
                  color: finding.color,
                  borderColor: finding.color
                }}>
                  {finding.severity}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RedTeam;
