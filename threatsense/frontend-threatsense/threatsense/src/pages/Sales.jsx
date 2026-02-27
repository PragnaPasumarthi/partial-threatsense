import React, { useState, useEffect } from 'react';
import { useSession } from '../context/SessionContext';
import './Sales.css';

const Sales = () => {
  const { user } = useSession();
  const [salesMetrics, setSalesMetrics] = useState({
    totalRevenue: '₹ 0',
    totalLeads: '0',
    activeDeals: '0',
    conversionRate: 0
  });
  const [chartData, setChartData] = useState([]);
  const [deals, setDeals] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [interactions, setInteractions] = useState([]);
  const [riskScore, setRiskScore] = useState(0);
  const [isHighRisk, setIsHighRisk] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState([]);

  const [selectedDeal, setSelectedDeal] = useState(null);
  const [isLogging, setIsLogging] = useState(false);

  const [newAppt, setNewAppt] = useState({
    clientName: '',
    company: '',
    executive: '',
    date: '',
    time: '',
    meetingType: 'Product Demo'
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { apiClient } = await import('../services/apiClient');
        const data = await apiClient.get('/data/sales');
        setSalesMetrics(data);
        setChartData(data.chartData || []);
        setDeals(data.deals || []);
        setAppointments(data.appointments || []);

        if (user) {
          const socData = await apiClient.get(`/data/soc?user_id=${encodeURIComponent(user.email)}`);
          setRiskScore(socData.current_user_risk);
          setIsHighRisk(socData.current_user_risk >= 70);

          setTerminalLogs([
            { time: new Date().toLocaleTimeString(), message: 'Session monitoring active' },
            { time: new Date().toLocaleTimeString(), message: `Risk Score: ${socData.current_user_risk}` },
            { time: new Date().toLocaleTimeString(), message: socData.threat_level === 'Elevated' ? 'ALARM: Anomalous activity detected' : 'Status: Normal' }
          ]);
        }
      } catch (error) {
        console.error('Failed to fetch sales data:', error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    setInteractions([
      { customer: 'John Smith', type: 'Email', timestamp: '2 hours ago', notes: 'Sent pricing proposal for enterprise plan...' },
      { customer: 'Robert Wilson', type: 'Phone Call', timestamp: '4 hours ago', notes: 'Discussed implementation timeline...' },
      { customer: 'Emily Davis', type: 'Meeting', timestamp: '1 day ago', notes: 'Product demonstration completed...' }
    ]);
  }, []);

  const handleApptSubmit = async (e) => {
    e.preventDefault();
    try {
      const { apiClient } = await import('../services/apiClient');
      await apiClient.post('/data/appointments', newAppt);
      const data = await apiClient.get('/data/sales');
      setAppointments(data.appointments || []);
      setNewAppt({
        clientName: '',
        company: '',
        executive: '',
        date: '',
        time: '',
        meetingType: 'Product Demo'
      });
    } catch (error) {
      console.error('Failed to create appointment:', error);
    }
  };

  const handleViewDealDetails = async (deal) => {
    if (isLogging) return;

    setIsLogging(true);
    setSelectedDeal(deal);

    try {
      const { apiClient } = await import('../services/apiClient');
      await apiClient.post('/actions/log', {
        user: user?.email || 'sales_rep@threatsense.com',
        log_type: 'File Access',
        department: 'Sales',
        file_accessed: `deal_contract_${deal.id}`,
        location: 'Bangalore',
        device_type: 'Windows Desktop'
      });
    } catch (error) {
      console.error('Failed to log deal access:', error);
    } finally {
      setTimeout(() => setIsLogging(false), 800);
    }
  };

  return (
    <div className="sales-hub">
      <div className="sales-header">
        <div className="header-info">
          <h1>Sales Intelligence Hub</h1>
          <p className="header-subtitle">CRM operations with behavioral security monitoring enabled.</p>
        </div>
      </div>

      <section className="sales-section">
        <h2>Sales Overview</h2>

        <div className="performance-strip">
          <div className="strip-metric">
            <div className="strip-value">{salesMetrics.totalRevenue}</div>
            <div className="strip-label">Current Quarter</div>
          </div>
          <div className="strip-divider"></div>
          <div className="strip-metric">
            <div className="strip-value">{salesMetrics.totalLeads}</div>
            <div className="strip-label">Active Opportunities</div>
          </div>
          <div className="strip-divider"></div>
          <div className="strip-metric">
            <div className="strip-value">{salesMetrics.activeDeals}</div>
            <div className="strip-label">Ongoing Negotiations</div>
          </div>
        </div>

        <div className="appointment-form-section glass-panel">
          <h3>Schedule New Appointment</h3>
          <form onSubmit={handleApptSubmit} className="inline-form">
            <input type="text" placeholder="Client Name" value={newAppt.clientName} onChange={e => setNewAppt({ ...newAppt, clientName: e.target.value })} required />
            <input type="text" placeholder="Company" value={newAppt.company} onChange={e => setNewAppt({ ...newAppt, company: e.target.value })} required />
            <input type="text" placeholder="Sales Executive" value={newAppt.executive} onChange={e => setNewAppt({ ...newAppt, executive: e.target.value })} required />
            <input type="date" value={newAppt.date} onChange={e => setNewAppt({ ...newAppt, date: e.target.value })} required />
            <input type="time" value={newAppt.time} onChange={e => setNewAppt({ ...newAppt, time: e.target.value })} required />
            <select value={newAppt.meetingType} onChange={e => setNewAppt({ ...newAppt, meetingType: e.target.value })}>
              <option>Product Demo</option>
              <option>Contract Review</option>
              <option>Follow-up</option>
              <option>Discovery Call</option>
            </select>
            <button type="submit" className="neon-button">Add Appointment</button>
          </form>
        </div>

        <div className="graphical-metrics">
          <div className="chart-panel">
            <h3>Conversion Rate</h3>
            <div className="circular-chart">
              <svg width="180" height="180" viewBox="0 0 180 180">
                <circle cx="90" cy="90" r="70" fill="none" stroke="rgba(59, 130, 246, 0.1)" strokeWidth="12" />
                <circle cx="90" cy="90" r="70" fill="none" stroke="#3b82f6" strokeWidth="12"
                  strokeDasharray={`${2 * Math.PI * 70}`}
                  strokeDashoffset={`${2 * Math.PI * 70 * (1 - salesMetrics.conversionRate / 100)}`}
                  strokeLinecap="round" transform="rotate(-90 90 90)"
                  style={{ transition: 'stroke-dashoffset 1s ease' }}
                />
                <text x="90" y="90" textAnchor="middle" dominantBaseline="middle" fontSize="32" fontWeight="700" fill="#fff">
                  {salesMetrics.conversionRate}%
                </text>
              </svg>
            </div>
          </div>
          <div className="chart-panel">
            <div className="chart-header">
              <h3>Revenue Growth</h3>
              <span className="growth-percentage positive">+12.4%</span>
            </div>
            <div className="line-chart">
              <div style={{ height: '100px', display: 'flex', alignItems: 'flex-end', gap: '8px', padding: '10px' }}>
                {[40, 60, 45, 80, 55, 90, 70].map((h, i) => (
                  <div key={i} style={{ flex: 1, height: `${h}%`, background: '#3b82f6', borderRadius: '4px 4px 0 0', opacity: 0.6 + (i * 0.05) }} />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="simulation-toolset glass-panel" style={{ marginTop: '20px', padding: '20px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, color: '#ef4444' }}>CRM Security Tools</h3>
              <p style={{ margin: '5px 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>Authorized auditing and intelligence export controls.</p>
            </div>
            <button className="neon-button" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #991b1b 100%)' }} onClick={async () => {
              const { apiClient } = await import('../services/apiClient');
              await apiClient.post('/actions/log', {
                user: user?.email || 'sales_hacker@threatsense.com',
                log_type: 'Data Export',
                department: 'Sales',
                file_accessed: 'Q4_Revenue_Projections_Final.xlsx',
                location: 'Unknown/Spoofed',
                device_type: 'Linux Laptop'
              });
              alert('CRM Intelligence Downloaded. Check SOC for alerts.');
            }}>
              Download CRM Intelligence
            </button>
          </div>
        </div>
      </section>

      <section className="sales-section">
        <h2>Deal Pipeline</h2>
        <div className="deal-card-grid">
          {deals.map(deal => (
            <div key={deal.id} className="deal-card" onClick={() => handleViewDealDetails(deal)}>
              <div className="deal-card-header">
                <span className="deal-id-tag">{deal.id}</span>
              </div>
              <div className="deal-card-body">
                <h3 className="deal-company">{deal.company}</h3>
                <p className="deal-customer">{deal.name}</p>
                <button className="view-deal-btn">View Details</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {selectedDeal && (
        <div className="deal-detail-overlay" onClick={() => setSelectedDeal(null)}>
          <div className="deal-detail-popup glass-panel" onClick={e => e.stopPropagation()}>
            <div className="popup-header">
              <h2>Deal Intelligence: {selectedDeal.id}</h2>
              <button className="close-popup" onClick={() => setSelectedDeal(null)}>×</button>
            </div>
            <div className="popup-content">
              <div className="popup-item">
                <label>Company</label>
                <span>{selectedDeal.company}</span>
              </div>
              <div className="popup-item">
                <label>Customer Name</label>
                <span>{selectedDeal.name}</span>
              </div>
              <div className="popup-item">
                <label>Deal Value</label>
                <span className="value-high">{selectedDeal.value}</span>
              </div>
              <div className="popup-item">
                <label>Current Status</label>
                <span className={`status-badge status-${(selectedDeal.status || '').toLowerCase()}`}>
                  {selectedDeal.status}
                </span>
              </div>
              <div className="popup-item">
                <label>Executive Lead</label>
                <span>{selectedDeal.executive || 'Unassigned'}</span>
              </div>
              <div className="popup-item">
                <label>Contact Latency</label>
                <span>Last contact: {selectedDeal.lastContactDate}</span>
              </div>
            </div>
            <p className="security-notice">Access to this high-value intelligence is logged and monitored for sequential behavioral patterns.</p>
          </div>
        </div>
      )}

      <section className="sales-section">
        <h2>Appointments & Interactions</h2>
        <div className="two-column-grid">
          <div className="column-panel">
            <h3>Upcoming Appointments</h3>
            <div className="table-container">
              <table className="sales-table">
                <thead>
                  <tr><th>Customer</th><th>Executive</th><th>Meeting Type</th><th>Date</th><th>Time</th></tr>
                </thead>
                <tbody>
                  {appointments.map((apt, idx) => (
                    <tr key={idx}><td>{apt.clientName}</td><td>{apt.executive}</td><td>{apt.meetingType}</td><td>{apt.date}</td><td>{apt.time}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="column-panel">
            <h3>Recent Interactions</h3>
            <div className="interaction-feed">
              {interactions.map((int, idx) => (
                <div key={idx} className="interaction-item">
                  <div className="interaction-header">
                    <span className="interaction-customer">{int.customer}</span>
                    <span className="interaction-time">{int.timestamp}</span>
                  </div>
                  <div className="interaction-type">{int.type}</div>
                  <div className="interaction-notes">{int.notes}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className={`monitoring-panel ${isHighRisk ? 'high-risk' : ''}`}>
        <div className="monitoring-header">
          <span className="monitoring-title">Monitoring Status</span>
          <span className={`monitoring-indicator ${isHighRisk ? 'risk' : 'normal'}`}></span>
        </div>
        <div className="risk-bar">
          <div className="risk-fill" style={{ width: `${riskScore}%` }}></div>
        </div>
        <div className="terminal-logs">
          {terminalLogs.map((log, idx) => (
            <div key={idx} className="log-entry">
              <span className="log-time">{log.time}</span>
              <span className="log-message">{log.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sales;
