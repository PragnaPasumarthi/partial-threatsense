import React from 'react';
import './Dashboard.css';

const Dashboard = () => {
  return (
    <div className="unified-dashboard">
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <h1>Dashboard Overview</h1>
        <div className="status-indicators">
          <span className="status-item">
            <span className="status-dot"></span>
            Monitoring Active
          </span>
          <span className="status-item">
            <span className="status-dot"></span>
            AI Engine Operational
          </span>
        </div>
      </div>

      {/* Operational Overview Grid */}
      <section className="dashboard-section">
        <h2>Operational Overview</h2>
        <div className="metrics-grid">
          <div className="metric-panel">
            <div className="metric-value">2,847</div>
            <div className="metric-label">Sessions Today</div>
          </div>
          <div className="metric-panel">
            <div className="metric-value">142</div>
            <div className="metric-label">Active Users</div>
          </div>
          <div className="metric-panel">
            <div className="metric-value">1,523</div>
            <div className="metric-label">Access Requests</div>
          </div>
          <div className="metric-panel">
            <div className="metric-value">99.8%</div>
            <div className="metric-label">System Availability</div>
          </div>
        </div>
      </section>

      {/* Security Posture Overview */}
      <section className="dashboard-section">
        <h2>Security Posture Overview</h2>
        <div className="posture-grid">
          <div className="posture-panel">
            <h3>System Status</h3>
            <div className="status-badge status-stable">Stable</div>
          </div>
          <div className="posture-panel">
            <h3>AI Model Status</h3>
            <div className="status-badge status-operational">Operational</div>
          </div>
          <div className="posture-panel">
            <h3>Behavioral Baseline</h3>
            <div className="status-badge status-established">Established</div>
          </div>
          <div className="posture-panel">
            <h3>Threat Detection</h3>
            <div className="status-badge status-active">Active</div>
          </div>
        </div>
      </section>

      {/* Role Activity Snapshot */}
      <section className="dashboard-section">
        <h2>Role Activity Snapshot</h2>
        <div className="activity-grid">
          <div className="activity-panel">
            <h3>HR</h3>
            <div className="activity-stats">
              <span>Sessions: 45</span>
              <span>Actions: 312</span>
            </div>
          </div>
          <div className="activity-panel">
            <h3>Support</h3>
            <div className="activity-stats">
              <span>Sessions: 112</span>
              <span>Actions: 876</span>
            </div>
          </div>
          <div className="activity-panel">
            <h3>Sales</h3>
            <div className="activity-stats">
              <span>Sessions: 95</span>
              <span>Actions: 1,234</span>
            </div>
          </div>
          <div className="activity-panel">
            <h3>SOC Team</h3>
            <div className="activity-stats">
              <span>Sessions: 18</span>
              <span>Actions: 542</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
