import React, { useState, useEffect } from 'react';
import { useSOC } from '../../context/SOCContext';
import './SOCAnalyst.css';

const getRiskColor = (score) => {
  if (score >= 80) return '#ef4444';
  if (score >= 60) return '#f97316';
  return '#f59e0b';
};

const SessionIntelligence = ({ alert, onClose, onAction }) => {
  const [actionLoading, setActionLoading] = useState(null);
  const [actionDone, setActionDone] = useState(null);

  const handleAction = async (action) => {
    setActionLoading(action);
    try {
      await onAction(action, alert.user);
      setActionDone(action);
    } catch (e) {
      alert('Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  const riskColor = getRiskColor(alert.risk_score || 0);

  return (
    <div className="si-overlay" onClick={onClose}>
      <div className="si-panel" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="si-header">
          <div>
            <div className="si-badge" style={{ background: alert.risk_level === 'High' ? 'rgba(239,68,68,0.15)' : 'rgba(249,115,22,0.15)', color: riskColor }}>
              ⚠ {alert.risk_level || 'Medium'} Risk
            </div>
            <h2 className="si-title">Session Intelligence</h2>
            <p className="si-user">{alert.user}</p>
          </div>
          <div className="si-risk-score" style={{ color: riskColor }}>
            <div className="si-risk-label">RISK SCORE</div>
            <div className="si-risk-value">{Math.round(alert.risk_score || 0)}</div>
          </div>
          <button className="si-close" onClick={onClose}>✕</button>
        </div>

        {/* Session Status Banner */}
        {alert.session_status === 'Terminated' && (
          <div className="si-terminated-banner">
            🔴 EMPLOYEE SESSION TERMINATED — Awaiting SOC Decision
          </div>
        )}
        {alert.session_status === 'Restored' && (
          <div className="si-restored-banner">
            🟢 Session Restored — False Positive Confirmed
          </div>
        )}
        {alert.session_status === 'Locked' && (
          <div className="si-locked-banner">
            🔒 Account Locked — Permanent Block Applied
          </div>
        )}

        <div className="si-body">
          {/* Employee Details */}
          <div className="si-section">
            <h3 className="si-section-title">Employee Details</h3>
            <div className="si-grid">
              <div className="si-detail">
                <span className="si-detail-label">Email</span>
                <span className="si-detail-value">{alert.user}</span>
              </div>
              <div className="si-detail">
                <span className="si-detail-label">Department</span>
                <span className="si-detail-value">{alert.department}</span>
              </div>
              <div className="si-detail">
                <span className="si-detail-label">Device</span>
                <span className="si-detail-value">{alert.session_context?.device_type || 'Unknown'}</span>
              </div>
              <div className="si-detail">
                <span className="si-detail-label">Location</span>
                <span className="si-detail-value">{alert.session_context?.location || 'Unknown'}</span>
              </div>
              <div className="si-detail">
                <span className="si-detail-label">IP Address</span>
                <span className="si-detail-value">{alert.session_context?.ip_address || '—'}</span>
              </div>
              <div className="si-detail">
                <span className="si-detail-label">Detected At</span>
                <span className="si-detail-value">{alert.timestamp ? new Date(alert.timestamp).toLocaleString() : '—'}</span>
              </div>
            </div>
          </div>

          {/* Behavioral Signals */}
          <div className="si-section">
            <h3 className="si-section-title">Behavioral Signals</h3>
            <div className="si-signals">
              {alert.ml_details && Object.entries(alert.ml_details).map(([key, val]) => (
                <div key={key} className={`si-signal ${val === 'flagged' ? 'si-signal-flagged' : 'si-signal-normal'}`}>
                  <span className="si-signal-icon">{val === 'flagged' ? '⚡' : '✓'}</span>
                  <div>
                    <div className="si-signal-name">{key.charAt(0).toUpperCase() + key.slice(1)} Analysis</div>
                    <div className="si-signal-status">{val === 'flagged' ? 'Anomalous pattern detected' : 'Within normal parameters'}</div>
                  </div>
                  <span className={`si-signal-badge ${val === 'flagged' ? 'badge-flagged' : 'badge-normal'}`}>
                    {val.toUpperCase()}
                  </span>
                </div>
              ))}
              {(!alert.ml_details || Object.keys(alert.ml_details).length === 0) && (
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No behavioral signal data available.</p>
              )}
            </div>
          </div>

          {/* Analyst Observation */}
          <div className="si-section si-observation">
            <h3 className="si-section-title">Analyst Observation</h3>
            <p>
              Behavioral pattern for <strong>{alert.user}</strong> indicates a deviation from standard baselines.
              The ML engine classified this as <strong>{alert.risk_level}</strong> risk
              {alert.ml_details && Object.entries(alert.ml_details).filter(([_, v]) => v === 'flagged').length > 0 && (
                <> due to <strong>{Object.entries(alert.ml_details).filter(([_, v]) => v === 'flagged').map(([k]) => k).join(' and ')}</strong> anomalies</>
              )}.
              {alert.session_status === 'Terminated' && <> The employee's session has been automatically terminated pending SOC review.</>}
            </p>
          </div>
        </div>

        {/* Action Bar */}
        <div className="si-action-bar">
          {actionDone ? (
            <div className="si-action-done">
              ✓ Action applied: <strong>{actionDone === 'lock' ? 'Account Locked' : actionDone === 'false_positive' ? 'Marked as False Positive' : 'Set to Investigating'}</strong>
            </div>
          ) : (
            <>
              <button
                className="si-btn si-btn-lock"
                disabled={!!actionLoading}
                onClick={() => handleAction('lock')}
              >
                {actionLoading === 'lock' ? '...' : '🔒 Lock Account'}
              </button>
              <button
                className="si-btn si-btn-fp"
                disabled={!!actionLoading}
                onClick={() => handleAction('false_positive')}
              >
                {actionLoading === 'false_positive' ? '...' : '✓ Mark False Positive'}
              </button>
              <button
                className="si-btn si-btn-inv"
                disabled={!!actionLoading}
                onClick={() => handleAction('investigating')}
              >
                {actionLoading === 'investigating' ? '...' : '🔍 Investigating'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Live Alert Toast Popup
const LiveAlertToast = ({ alert, onOpen, onDismiss }) => {
  const [countdown, setCountdown] = useState(15);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(timer); onDismiss(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [onDismiss]);

  return (
    <div className="live-alert-toast" onClick={onOpen}>
      <div className="lat-pulse"></div>
      <div className="lat-header">
        <span className="lat-label">🚨 LIVE SECURITY ALERT</span>
        <button className="lat-dismiss" onClick={e => { e.stopPropagation(); onDismiss(); }}>✕</button>
      </div>
      <div className="lat-user">{alert.user}</div>
      <div className="lat-meta">
        <span className="lat-dept">{alert.department}</span>
        <span className={`lat-risk ${alert.risk_level === 'High' ? 'lat-risk-high' : 'lat-risk-med'}`}>
          {alert.risk_level} Risk
        </span>
      </div>
      {alert.session_status === 'Terminated' && (
        <div className="lat-terminated">🔴 Session Terminated</div>
      )}
      <div className="lat-footer">
        <span className="lat-action">Click to investigate →</span>
        <span className="lat-countdown">Auto-dismiss: {countdown}s</span>
      </div>
    </div>
  );
};

// Main SOC Analyst Component
const SOCAnalyst = () => {
  const { alerts, metrics, liveAlertPending, dismissLiveAlert, terminatedSessions, performAction } = useSOC();
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [showIntelligence, setShowIntelligence] = useState(false);
  const [filter, setFilter] = useState('all'); // all | open | terminated | resolved

  // When live alert toast is clicked → open Session Intelligence
  const handleToastOpen = () => {
    setSelectedAlert(liveAlertPending);
    setShowIntelligence(true);
    dismissLiveAlert();
  };

  const handleAlertClick = (alert) => {
    setSelectedAlert(alert);
    setShowIntelligence(true);
  };

  const handleAction = async (action, userEmail) => {
    if (!selectedAlert) return;
    await performAction(selectedAlert.alert_id, action, userEmail);
    // Update local selected alert after action
    setSelectedAlert(prev => ({
      ...prev,
      status: action === 'lock' ? 'Resolved (Locked)' : action === 'false_positive' ? 'Resolved (Dismissed)' : 'Investigating',
      session_status: action === 'lock' ? 'Locked' : action === 'false_positive' ? 'Restored' : 'Investigating'
    }));
  };

  const filteredAlerts = alerts.filter(a => {
    if (filter === 'open') return a.status === 'Open';
    if (filter === 'terminated') return a.session_status === 'Terminated';
    if (filter === 'resolved') return (a.status || '').includes('Resolved');
    return true;
  });

  const getStatusDot = (alert) => {
    if (alert.session_status === 'Terminated') return '#ef4444';
    if (alert.session_status === 'Locked') return '#7c3aed';
    if (alert.session_status === 'Restored') return '#10b981';
    if ((alert.status || '').includes('Resolved')) return '#10b981';
    return '#f97316';
  };

  return (
    <div className="soc-analyst">
      {/* Live Alert Toast - fixed bottom right */}
      {liveAlertPending && (
        <LiveAlertToast
          alert={liveAlertPending}
          onOpen={handleToastOpen}
          onDismiss={dismissLiveAlert}
        />
      )}

      {/* Session Intelligence Modal */}
      {showIntelligence && selectedAlert && (
        <SessionIntelligence
          alert={selectedAlert}
          onClose={() => setShowIntelligence(false)}
          onAction={handleAction}
        />
      )}

      {/* Page Header */}
      <div className="analyst-header">
        <div>
          <h1 className="analyst-title">Security Investigation Console</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>
            Real-time behavioral monitoring and threat response
          </p>
        </div>
        <div className="analyst-stats-row">
          <div className="analyst-stat-card">
            <span style={{ color: '#ef4444', fontSize: '1.4rem', fontWeight: 'bold' }}>{metrics.activeAlerts}</span>
            <span>Active Threats</span>
          </div>
          <div className="analyst-stat-card">
            <span style={{ color: '#f97316', fontSize: '1.4rem', fontWeight: 'bold' }}>{metrics.terminatedSessions || terminatedSessions.length}</span>
            <span>Terminated</span>
          </div>
          <div className="analyst-stat-card">
            <span style={{ color: '#60a5fa', fontSize: '1.4rem', fontWeight: 'bold' }}>{metrics.investigating}</span>
            <span>Investigating</span>
          </div>
          <div className="analyst-stat-card">
            <span style={{ color: '#10b981', fontSize: '1.4rem', fontWeight: 'bold' }}>{metrics.resolvedToday}</span>
            <span>Resolved</span>
          </div>
        </div>
      </div>

      {/* Alert Feed */}
      <div className="analyst-workspace">
        {/* Sidebar: Alert Feed */}
        <div className="alerts-sidebar">
          <div className="feed-header">
            <h2>Behavioral Alert Feed</h2>
            <div className="feed-filters">
              {['all', 'open', 'terminated', 'resolved'].map(f => (
                <button
                  key={f}
                  className={`filter-btn ${filter === f ? 'active' : ''}`}
                  onClick={() => setFilter(f)}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="feed-list">
            {filteredAlerts.length > 0 ? filteredAlerts.map((alert) => (
              <div
                key={alert.alert_id}
                className={`feed-item ${selectedAlert?.alert_id === alert.alert_id ? 'active' : ''}`}
                onClick={() => handleAlertClick(alert)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ color: '#60a5fa', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                    #{alert.alert_id?.substring(0, 8)}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                    {alert.timestamp ? new Date(alert.timestamp).toLocaleTimeString() : ''}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: getStatusDot(alert), flexShrink: 0 }}></span>
                  <span style={{ color: '#f1f5f9', fontWeight: '600', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {alert.user}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{alert.department}</span>
                  <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                    <span style={{
                      padding: '2px 7px', borderRadius: '4px', fontSize: '0.68rem',
                      background: alert.risk_level === 'High' ? 'rgba(239,68,68,0.2)' : 'rgba(249,115,22,0.1)',
                      color: alert.risk_level === 'High' ? '#ef4444' : '#f97316'
                    }}>{alert.risk_level}</span>
                    {alert.session_status === 'Terminated' && (
                      <span style={{ fontSize: '0.68rem', color: '#ef4444' }}>● TERM</span>
                    )}
                    {alert.session_status === 'Locked' && (
                      <span style={{ fontSize: '0.68rem', color: '#7c3aed' }}>🔒</span>
                    )}
                    {alert.session_status === 'Restored' && (
                      <span style={{ fontSize: '0.68rem', color: '#10b981' }}>✓ RESTORED</span>
                    )}
                  </div>
                </div>
              </div>
            )) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                {filter === 'all' ? 'No alerts detected' : `No ${filter} alerts`}
              </div>
            )}
          </div>
        </div>

        {/* Right pane: Click-to-investigate prompt or inline preview */}
        <div className="investigation-pane">
          {selectedAlert && !showIntelligence ? (
            <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h2 style={{ margin: 0, color: '#f1f5f9' }}>{selectedAlert.user}</h2>
                  <p style={{ color: '#94a3b8', margin: '0.3rem 0' }}>{selectedAlert.department} — {selectedAlert.session_context?.location || 'Unknown Location'}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>RISK SCORE</div>
                  <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: getRiskColor(selectedAlert.risk_score || 0) }}>
                    {Math.round(selectedAlert.risk_score || 0)}
                  </div>
                </div>
              </div>

              {/* Quick behavioral summary */}
              <div style={{ background: 'rgba(30,41,59,0.4)', borderRadius: '8px', padding: '1.5rem' }}>
                <h3 style={{ fontSize: '0.9rem', color: '#60a5fa', marginBottom: '1rem' }}>Behavioral Signals (Quick View)</h3>
                {selectedAlert.ml_details && Object.entries(selectedAlert.ml_details).map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #1e293b' }}>
                    <span style={{ color: '#e2e8f0', textTransform: 'capitalize' }}>{k} Analysis</span>
                    <span style={{ color: v === 'flagged' ? '#ef4444' : '#10b981', fontWeight: 'bold' }}>
                      {v.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>

              <button
                className="si-btn si-btn-lock"
                style={{ width: '100%', padding: '1rem' }}
                onClick={() => setShowIntelligence(true)}
              >
                Open Full Session Intelligence →
              </button>
            </div>
          ) : !showIntelligence ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b', gap: '1rem' }}>
              <div style={{ fontSize: '3rem' }}>🔍</div>
              <div style={{ fontSize: '1rem' }}>Select an alert to begin investigation</div>
              <div style={{ fontSize: '0.8rem', color: '#475569' }}>Live alerts will appear as popup notifications</div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default SOCAnalyst;
