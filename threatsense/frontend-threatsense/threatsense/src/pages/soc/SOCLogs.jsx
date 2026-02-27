import React, { useState, useEffect } from 'react';
import { apiClient } from '../../services/apiClient';

const SOCLogs = () => {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [anomaliesOnly, setAnomaliesOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.get(`/soc/logs?page=${page}&anomaliesOnly=${anomaliesOnly}`);
        setLogs(response.data);
        setTotalPages(response.totalPages);
      } catch (err) {
        console.error("Failed to fetch logs", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLogs();
  }, [page, anomaliesOnly]);

  return (
    <div className="soc-logs" style={{ padding: '2rem', color: '#e2e8f0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: '#fff' }}>Security Audit Logs</h1>
          <p style={{ color: '#94a3b8' }}>Centralized security event logging and behavioral analysis.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={anomaliesOnly}
              onChange={(e) => { setAnomaliesOnly(e.target.checked); setPage(1); }}
              style={{ width: '18px', height: '18px' }}
            />
            <span style={{ color: '#f87171', fontWeight: 'bold' }}>ANOMALIES ONLY</span>
          </label>
        </div>
      </div>

      <div className="logs-table-container" style={{ background: 'rgba(15, 23, 42, 0.4)', borderRadius: '12px', border: '1px solid #334155', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(30, 41, 59, 0.8)', color: '#60a5fa', fontSize: '0.85rem' }}>
              <th style={{ padding: '1rem' }}>TIMESTAMP</th>
              <th style={{ padding: '1rem' }}>USER</th>
              <th style={{ padding: '1rem' }}>DEPARTMENT</th>
              <th style={{ padding: '1rem' }}>ENTITY CONTEXT</th>
              <th style={{ padding: '1rem' }}>RISK SCORE</th>
              <th style={{ padding: '1rem' }}>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #1e293b', background: log.is_anomaly ? 'rgba(239, 68, 68, 0.05)' : 'transparent' }}>
                <td style={{ padding: '1rem', whiteSpace: 'nowrap', fontSize: '0.9rem' }}>{new Date(log.timestamp).toLocaleString()}</td>
                <td style={{ padding: '1rem', color: '#f1f5f9', fontWeight: '500' }}>{log.user}</td>
                <td style={{ padding: '1rem', fontSize: '0.9rem' }}>{log.department}</td>
                <td style={{ padding: '1rem', fontSize: '0.85rem', color: '#94a3b8' }}>
                  <div>{log.session_context?.location || log.location}</div>
                  <div style={{ fontSize: '0.75rem' }}>{log.session_context?.device_type || log.device_type} • {log.session_context?.ip_address || log.ip_address}</div>
                </td>
                <td style={{ padding: '1rem' }}>
                  <span style={{
                    color: log.risk_score > 70 ? '#ef4444' : log.risk_score > 40 ? '#f97316' : '#10b981',
                    fontWeight: 'bold'
                  }}>
                    {Math.round(log.risk_score)}%
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>
                  <span style={{
                    fontSize: '0.75rem',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: log.is_anomaly ? 'rgba(239, 68, 68, 0.1)' : 'rgba(30, 41, 59, 0.5)',
                    color: log.is_anomaly ? '#ef4444' : '#94a3b8',
                    border: `1px solid ${log.is_anomaly ? '#ef4444' : '#334155'}`
                  }}>
                    {log.is_anomaly ? 'ANOMALY' : 'NORMAL'}
                  </span>
                </td>
              </tr>
            ))}
            {logs.length === 0 && !isLoading && (
              <tr>
                <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>No logs found for this criteria</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination" style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '1rem', alignItems: 'center' }}>
        <button
          disabled={page === 1 || isLoading}
          onClick={() => setPage(p => p - 1)}
          style={{ padding: '0.5rem 1.5rem', background: '#1e293b', color: '#fff', border: '1px solid #334155', borderRadius: '4px', cursor: 'pointer', opacity: page === 1 ? 0.5 : 1 }}
        >
          Previous
        </button>
        <span style={{ color: '#94a3b8' }}>Page {page} of {totalPages}</span>
        <button
          disabled={page === totalPages || isLoading}
          onClick={() => setPage(p => p + 1)}
          style={{ padding: '0.5rem 1.5rem', background: '#1e293b', color: '#fff', border: '1px solid #334155', borderRadius: '4px', cursor: 'pointer', opacity: page === totalPages ? 0.5 : 1 }}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default SOCLogs;
