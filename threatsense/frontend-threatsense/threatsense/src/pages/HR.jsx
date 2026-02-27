import React, { useState, useEffect } from 'react';
import { useSession } from '../context/SessionContext';
import './HR.css';

const HR = () => {
  const { user } = useSession();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('All');
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isLogging, setIsLogging] = useState(false);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const { apiClient } = await import('../services/apiClient');
        const data = await apiClient.get('/data/hr');
        setEmployees(data);
      } catch (error) {
        console.error('Failed to fetch HR data:', error);
      }
    };
    fetchEmployees();
  }, []);

  const handleCardClick = async (emp) => {
    // If we're already processing an access or the same employee is selected, ignore
    if (isLogging) return;

    setIsLogging(true);
    setSelectedEmployee(emp);

    try {
      const { apiClient } = await import('../services/apiClient');
      // This call increments the 8-access/day threshold and triggers ML evaluation
      await apiClient.post('/actions/log', {
        user: user?.email || 'unknown@threatsense.com',
        log_type: 'Sensitive File Access',
        department: 'HR',
        file_accessed: `employee_record_${emp.user_id || emp.name.replace(/ /g, '_')}`,
        location: 'Bangalore',
        device_type: 'Windows Desktop'
      });
    } catch (error) {
      console.error('Failed to log access:', error);
    } finally {
      // Debounce: prevent multiple rapid counts from double-clicks
      setTimeout(() => setIsLogging(false), 800);
    }
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emp.user_id || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = filterDept === 'All' || emp.department === filterDept;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="hr-dashboard">
      <div className="hr-header">
        <h1 className="hr-title">HR Workforce Directory</h1>
        <p className="hr-subtitle">Secure employee profile management with activity monitoring</p>
      </div>

      <div className="hr-table-controls">
        <input
          type="text"
          placeholder="Search name or ID..."
          className="hr-search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="hr-filter-select"
          value={filterDept}
          onChange={(e) => setFilterDept(e.target.value)}
        >
          <option value="All">All Departments</option>
          <option value="Engineering">Engineering</option>
          <option value="Sales">Sales</option>
          <option value="Support">Support</option>
          <option value="Marketing">Marketing</option>
          <option value="HR">HR</option>
        </select>
      </div>

      <div className="hr-card-grid">
        {filteredEmployees.map((emp, idx) => (
          <div
            key={idx}
            className={`hr-profile-card ${selectedEmployee?.name === emp.name ? 'active' : ''}`}
            onClick={() => handleCardClick(emp)}
          >
            <div className="card-face">
              <div className="avatar-placeholder">
                <span className="initials">{emp.name.split(' ').map(n => n[0]).join('')}</span>
              </div>
            </div>
            <div className="card-content">
              <h3 className="emp-name">{emp.name}</h3>
              <p className="emp-id">ID: {emp.user_id || `TS-${1000 + idx}`}</p>
              <p className="emp-role">{emp.role}</p>
              <button className="view-details-btn">View Details</button>
            </div>
          </div>
        ))}
      </div>

      {selectedEmployee && (
        <div className="hr-details-pane">
          <div className="details-header">
            <h3>Employee Record: {selectedEmployee.name}</h3>
            <button className="close-btn" onClick={() => setSelectedEmployee(null)}>×</button>
          </div>
          <div className="details-grid">
            <div className="detail-item">
              <label>Full Identity</label>
              <span>{selectedEmployee.name}</span>
            </div>
            <div className="detail-item">
              <label>Organization</label>
              <span>{selectedEmployee.department}</span>
            </div>
            <div className="detail-item">
              <label>Designation</label>
              <span>{selectedEmployee.role}</span>
            </div>
            <div className="detail-item alert-status">
              <label>Access Status</label>
              <span className="monitoring-active">RESTRICTED VIEW - LOGGED</span>
            </div>
          </div>
          <div className="privacy-notice">
            <p>Sensitive data (Email, PII, Hire Dates) is restricted to SOC-verified sessions only.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default HR;
