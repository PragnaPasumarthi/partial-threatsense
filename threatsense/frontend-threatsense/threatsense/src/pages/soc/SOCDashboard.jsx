import React, { useState, useEffect } from 'react';
import { useSession } from '../../context/SessionContext';
import { useSOC } from '../../context/SOCContext';
import './SOCDashboard.css';

const SOCDashboard = () => {
  const { user } = useSession();
  const {
    alerts,
    metrics,
    latestAlert,
    setLatestAlert,
    trendData,
    departmentMetrics,
    terminatedSessions,
    performAction,
    simulateAttack
  } = useSOC();

  const [timeRange, setTimeRange] = useState('24h');
  const [activeAlert, setActiveAlert] = useState(null);
  const [showNotification, setShowNotification] = useState(false);

  // Sync active alert with the latest received from WebSocket
  useEffect(() => {
    if (latestAlert) {
      setActiveAlert(latestAlert);
      setShowNotification(true);
      const timer = setTimeout(() => setShowNotification(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [latestAlert]);

  // If no active alert is selected, pick the first one from the list
  useEffect(() => {
    if (!activeAlert && alerts.length > 0) {
      setActiveAlert(alerts[0]);
    }
  }, [alerts, activeAlert]);

  const attackData = [
    { name: 'SQL Injection', value: 847 },
    { name: 'Brute Force', value: 623 },
    { name: 'Phishing', value: 512 },
    { name: 'Packet Filter', value: 389 },
    { name: 'Traffic Flood', value: 276 },
    { name: 'Rate Limiter', value: 198 },
    { name: 'Port Filtering', value: 156 },
    { name: 'Protocol Filtering', value: 134 },
    { name: 'WAF', value: 89 }
  ].sort((a, b) => b.value - a.value);

  const totalThreats = attackData.reduce((sum, item) => sum + item.value, 0);
  const maxValue = Math.max(...attackData.map(d => d.value));

  const topMetrics = [
    { label: 'Active Threats', value: metrics.activeAlerts.toString(), status: 'critical' },
    { label: 'Blocked Attacks', value: '3,224', status: 'success' },
    { label: 'Resolved Today', value: metrics.resolvedToday.toString(), status: 'good' },
    { label: 'Avg Risk Score', value: `${metrics.avgRiskScore}%`, status: 'normal' }
  ];

  const findings = [
    { title: 'Unpatched RCE', severity: 'Critical', time: '2h ago', color: '#dc2626' },
    { title: 'Weak SSH Keys', severity: 'High', time: '5h ago', color: '#fb923c' },
    { title: 'Exposed API Endpoint', severity: 'Medium', time: '12h ago', color: '#f59e0b' }
  ];

  return (
    <div className="soc-dashboard">
      {/* Real-time Toast Notification */}
      {showNotification && latestAlert && (
        <div className="alert-toast shadow-2xl" style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: 'rgba(15, 23, 42, 0.95)',
          border: '2px solid #ef4444',
          padding: '1.5rem',
          borderRadius: '12px',
          zIndex: 1000,
          width: '350px',
          backdropFilter: 'blur(10px)',
          animation: 'slideInRight 0.5s ease-out'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ color: '#ef4444', fontWeight: 'bold' }}>⚠ THREAT DETECTED</span>
            <button onClick={() => setShowNotification(false)} style={{ color: '#94a3b8' }}>✕</button>
          </div>
          <div style={{ color: '#f1f5f9', fontWeight: '600', fontSize: '1.1rem' }}>{latestAlert.user}</div>
          <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{latestAlert.department} • {latestAlert.session_context?.location}</div>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ flex: 1, height: '6px', background: '#334155', borderRadius: '3px' }}>
              <div style={{ width: `${latestAlert.risk_score}%`, height: '100%', background: '#ef4444', borderRadius: '3px' }}></div>
            </div>
            <span style={{ color: '#ef4444', fontWeight: 'bold' }}>{Math.round(latestAlert.risk_score)}%</span>
          </div>
        </div>
      )}

      <h1 className="soc-title">SOC Command Center</h1>

      <div className="metrics-grid">
        {topMetrics.map((metric, idx) => (
          <div key={idx} className="metric-card">
            <div className="metric-label">{metric.label}</div>
            <div className={`metric-value ${metric.status}`}>{metric.value}</div>
          </div>
        ))}
      </div>

      <div className="chart-section">
        <div style={{ marginBottom: '0.5rem' }}>
          <h2 style={{ margin: 0, marginBottom: '0.25rem' }}>Threat Severity Panel</h2>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#94a3b8' }}>Ranked by volume in the last 24 hours</p>
        </div>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '0.375rem 0.875rem',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '9999px',
          fontSize: '0.8125rem',
          fontWeight: 500,
          color: '#f87171',
          marginBottom: '1.5rem'
        }}>
          Total: {totalThreats.toLocaleString()}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.8s ease' }}>
          {attackData.map((item, idx) => {
            const percentage = (item.value / maxValue) * 70;
            const isTopThree = idx < 3;

            return (
              <div key={idx} style={{ display: 'grid', gridTemplateColumns: '200px 1fr 80px', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '0.875rem', color: '#e2e8f0', fontWeight: 500 }}>{item.name}</span>
                <div style={{ position: 'relative', height: '28px', background: 'rgba(148, 163, 184, 0.08)', borderRadius: '10px' }}>
                  <div style={{
                    height: '100%',
                    width: `${percentage}%`,
                    background: 'linear-gradient(90deg, #8B1E1E 0%, #B22222 100%)',
                    borderRadius: '10px',
                    boxShadow: isTopThree ? '0 2px 12px rgba(139, 30, 30, 0.4)' : '0 2px 8px rgba(139, 30, 30, 0.3)',
                    transition: 'all 0.5s ease'
                  }}
                  />
                </div>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f1f5f9', textAlign: 'right' }}>{item.value.toLocaleString()}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="monitoring-cards">
        <div className="monitor-card">
          <h3>System Status</h3>
          <div className="status-indicator online">ONLINE</div>
          <p>All systems operational</p>
        </div>
        <div className="monitor-card">
          <h3>Threat Level</h3>
          <div className={`status-indicator ${metrics.activeAlerts > 5 ? 'critical' : 'elevated'}`}>
            {metrics.activeAlerts > 5 ? 'CRITICAL' : 'ELEVATED'}
          </div>
          <p>{metrics.activeAlerts} active anomalies</p>
        </div>
        <div className="monitor-card">
          <h3>ML Engine</h3>
          <div className="status-indicator ready">READY</div>
          <p>Analyzing behavioral baselines</p>
        </div>
      </div>

      <div className="soc-section">
        <div className="section-header">
          <h2 className="section-title">Live Session Monitor</h2>
          <p className="section-subtitle">Real-time tracking of terminated and high-risk employee sessions</p>
        </div>

        <div className="dashboard-monitor-table-container" style={{ background: 'rgba(15, 23, 42, 0.4)', borderRadius: '12px', border: '1px solid #1e293b', overflow: 'hidden', marginBottom: '2rem' }}>
          <table className="session-monitor-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: 'rgba(30, 41, 59, 0.6)', textAlign: 'left' }}>
                <th style={{ padding: '1rem' }}>Employee</th>
                <th style={{ padding: '1rem' }}>Department</th>
                <th style={{ padding: '1rem' }}>Risk Score</th>
                <th style={{ padding: '1rem' }}>Status</th>
                <th style={{ padding: '1rem' }}>Last Seen</th>
                <th style={{ padding: '1rem' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {terminatedSessions.length > 0 ? (
                terminatedSessions.map((session) => (
                  <tr key={session.alert_id} style={{ borderBottom: '1px solid #1e293b' }}>
                    <td style={{ padding: '1rem', fontWeight: 'bold' }}>{session.user}</td>
                    <td style={{ padding: '1rem', color: '#94a3b8' }}>{session.department}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '2px 8px', borderRadius: '4px', background: session.risk_score > 70 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(249, 115, 22, 0.1)',
                        color: session.risk_score > 70 ? '#ef4444' : '#f97316'
                      }}>
                        {Math.round(session.risk_score)}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        color: session.session_status === 'Terminated' ? '#ef4444' : '#f97316',
                        display: 'flex', alignItems: 'center', gap: '0.4rem'
                      }}>
                        {session.session_status === 'Terminated' ? '● Terminated' : '⚠ High Risk'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', color: '#64748b' }}>{new Date(session.timestamp).toLocaleTimeString()}</td>
                    <td style={{ padding: '1rem' }}>
                      <button
                        onClick={() => window.location.hash = '/soc/analyst'}
                        style={{ background: 'transparent', border: '1px solid #334155', color: '#60a5fa', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>
                        Investigate →
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr style={{ textAlign: 'center' }}>
                  <td colSpan="6" style={{ padding: '2rem', color: '#64748b' }}>No high-risk sessions detected.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="section-header">
          <h2 className="section-title">SOC Analyst Console</h2>
          <p className="section-subtitle">Real-time anomaly investigation</p>
        </div>

        <div className="kpi-strip">
          <div className="kpi-card">
            <div className="kpi-label">Active Alerts</div>
            <div className="kpi-value">{metrics.activeAlerts}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Investigating</div>
            <div className="kpi-value">{metrics.investigating}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Resolved Today</div>
            <div className="kpi-value">{metrics.resolvedToday}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Avg Response Time</div>
            <div className="kpi-value">8m</div>
          </div>
        </div>

        <div className="two-col-grid">
          <div className="panel" style={{ maxHeight: '450px', overflowY: 'auto' }}>
            <h3 className="panel-title">Live Alert Feed</h3>
            <div className="alert-feed">
              {alerts.length > 0 ? alerts.map((alert, idx) => (
                <div
                  key={idx}
                  className={`alert-item cursor-pointer ${activeAlert?.alert_id === alert.alert_id ? 'active' : ''}`}
                  onClick={() => setActiveAlert(alert)}
                  style={{ borderLeft: activeAlert?.alert_id === alert.alert_id ? '4px solid #3b82f6' : 'none' }}
                >
                  <span className="alert-id">#{alert.alert_id.substring(0, 6)}</span>
                  <span className="alert-user">{alert.user}</span>
                  <span className={`risk-badge ${alert.risk_level?.toLowerCase() || 'medium'}`}>{alert.risk_level}</span>
                  <span className="alert-time">{new Date(alert.timestamp).toLocaleTimeString()}</span>
                </div>
              )) : <p style={{ color: '#94a3b8', textAlign: 'center' }}>No active alerts</p>}
            </div>
          </div>

          <div className="panel">
            <h3 className="panel-title">Session Intelligence</h3>
            {activeAlert ? (
              <div className="session-panel">
                <div className="session-info">
                  <span className="session-label">User:</span>
                  <span className="session-value">{activeAlert.user}</span>
                  <span className="session-label">Location:</span>
                  <span className="session-value">{activeAlert.session_context?.location || 'Unknown'}</span>
                  <span className="session-label">Device:</span>
                  <span className="session-value">{activeAlert.session_context?.device_type || 'Unknown'}</span>
                  <span className="session-label">Department:</span>
                  <span className="session-value">{activeAlert.department}</span>
                </div>
                <div className="risk-bar">
                  <div className="risk-bar-label">Risk Score: {Math.round(activeAlert.risk_score)}%</div>
                  <div className="risk-bar-track">
                    <div className="risk-bar-fill" style={{ width: `${activeAlert.risk_score}%`, background: activeAlert.risk_score > 70 ? '#ef4444' : '#fb923c' }}></div>
                  </div>
                </div>
                <div className="why-flagged">
                  <div className="why-flagged-title">Behavioral Flags</div>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                    {activeAlert.ml_details && Object.entries(activeAlert.ml_details).map(([key, val]) => (
                      <span key={key} style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        background: val === 'flagged' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.1)',
                        color: val === 'flagged' ? '#ef4444' : '#22c55e',
                        border: `1px solid ${val === 'flagged' ? '#ef4444' : '#22c55e'}`
                      }}>
                        {key.toUpperCase()}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="action-buttons" style={{ marginTop: '2rem' }}>
                  <button onClick={() => performAction(activeAlert.alert_id, 'lock')} className="action-btn danger">Lock Account</button>
                  <button onClick={() => performAction(activeAlert.alert_id, 'logout')} className="action-btn danger">Force Logout</button>
                  <button onClick={() => performAction(activeAlert.alert_id, 'false_positive')} className="action-btn secondary">False Positive</button>
                </div>
              </div>
            ) : <p style={{ color: '#94a3b8', textAlign: 'center' }}>Select an alert to investigate</p>}
          </div>
        </div>
      </div>

      <div className="soc-section">
        <div className="section-header">
          <h2 className="section-title">Blue Team Oversight</h2>
          <p className="section-subtitle">Organizational security posture monitoring</p>
        </div>

        <div className="kpi-strip">
          <div className="kpi-card">
            <div className="kpi-label">Active Sessions</div>
            <div className="kpi-value">1,250</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Total Anomalies</div>
            <div className="kpi-value">{alerts.length}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Incident Resolution Rate</div>
            <div className="kpi-value">94%</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">System Health</div>
            <div className="kpi-value">98.5%</div>
          </div>
        </div>

        <div className="two-col-grid">
          <div className="panel">
            <h3 className="panel-title">Risk Distribution</h3>
            <svg width="100%" height="250" viewBox="0 0 300 250">
              <circle cx="150" cy="125" r="80" fill="#3b82f6" opacity="0.8" />
              <circle cx="150" cy="125" r="60" fill="#8b5cf6" opacity="0.8" />
              <circle cx="150" cy="125" r="40" fill="#ef4444" opacity="0.8" />
              <text x="150" y="130" textAnchor="middle" fill="#fff" fontSize="24" fontWeight="700">{alerts.length}</text>
              <text x="150" y="150" textAnchor="middle" fill="#e2e8f0" fontSize="12">Anomalies</text>
            </svg>
          </div>

          <div className="panel">
            <h3 className="panel-title">Trend Analysis</h3>
            <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => setTimeRange('24h')} className={`action-btn secondary ${timeRange === '24h' ? 'active' : ''}`} style={{ flex: 1 }}>24h</button>
              <button onClick={() => setTimeRange('7d')} className={`action-btn secondary ${timeRange === '7d' ? 'active' : ''}`} style={{ flex: 1 }}>7d</button>
            </div>
            <svg width="100%" height="180" viewBox="0 0 300 180">
              <polyline fill="none" stroke="#3b82f6" strokeWidth="2" points="20,140 70,100 120,120 170,60 220,80 270,40" />
              {[20, 70, 120, 170, 220, 270].map((x, i) => (
                <circle key={i} cx={x} cy={[140, 100, 120, 60, 80, 40][i]} r="3" fill="#3b82f6" />
              ))}
            </svg>
          </div>
        </div>

        <div className="panel">
          <h3 className="panel-title">Department Risk Overview</h3>
          <table className="dept-table">
            <thead>
              <tr>
                <th>Department</th>
                <th>Sessions</th>
                <th>Anomalies</th>
                <th>Rating</th>
              </tr>
            </thead>
            <tbody>
              {departmentMetrics.map((dept, idx) => (
                <tr key={idx}>
                  <td>{dept.department}</td>
                  <td>{dept.activeSessions}</td>
                  <td>{dept.anomalies}</td>
                  <td style={{ color: dept.avgRiskScore > 50 ? '#ef4444' : '#22c55e' }}>{dept.avgRiskScore}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="soc-section">
        <div className="section-header">
          <h2 className="section-title">Red Team Simulation</h2>
          <p className="section-subtitle">Controlled adversary behavior testing</p>
        </div>

        <div className="two-col-grid">
          <div className="panel">
            <h3 className="panel-title">Simulation Controls</h3>
            <div className="sim-controls">
              <button onClick={() => simulateAttack('abnormal_login')} className="sim-btn">Simulate Abnormal Login</button>
              <button onClick={() => simulateAttack('volume_spike')} className="sim-btn">Simulate Volume Spike</button>
              <button onClick={() => simulateAttack('file_transition')} className="sim-btn">Simulate File Transition</button>
              <button onClick={() => simulateAttack('privilege_escalation')} className="sim-btn">Simulate Privilege Escalation</button>
            </div>
          </div>

          <div className="panel">
            <h3 className="panel-title">Cycle Validation</h3>
            <div className="lifecycle-strip" style={{ marginTop: '2rem' }}>
              <div className="lifecycle-item">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="2" />
                </svg>
                <span className="lifecycle-label">Simulate</span>
              </div>
              <span className="lifecycle-arrow">→</span>
              <div className="lifecycle-item">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2">
                  <path d="M12 1v6M1 12h6" />
                </svg>
                <span className="lifecycle-label">Detect</span>
              </div>
              <span className="lifecycle-arrow">→</span>
              <div className="lifecycle-item">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                </svg>
                <span className="lifecycle-label">Action</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SOCDashboard;
