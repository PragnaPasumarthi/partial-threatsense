import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ThreatSenseLogo from '../components/ThreatSenseLogo';
import { useSession } from '../context/SessionContext';
import './Landing.css';

const RoleIntelligenceSection = () => {
  const [activeRole, setActiveRole] = React.useState('Owner');

  const roles = {
    Owner: 'Provide strategic oversight and executive governance across critical systems, ensuring organizational direction, compliance alignment, and high-level operational visibility within the enterprise security framework.',
    Finance: 'Manage transactional systems and sensitive financial records, overseeing budget flows, approvals, and data integrity while maintaining controlled access boundaries across enterprise financial operations.',
    Sales: 'Oversee customer lifecycle management and revenue operations, interacting with CRM systems, client data, and performance metrics within structured operational workflows.',
    Support: 'Handle customer service operations and technical assistance workflows, ensuring structured issue resolution, access coordination, and secure interaction across internal systems.'
  };

  return (
    <section className="roles-section fade-in">
      <h2>Role-Based Behavioral Intelligence</h2>
      <p className="roles-subtitle">Adaptive monitoring tailored to organizational responsibilities.</p>

      <div className="split-intelligence">
        <div className="role-selector">
          {Object.keys(roles).map((role) => (
            <div
              key={role}
              className={`role-item ${activeRole === role ? 'active' : ''}`}
              onClick={() => setActiveRole(role)}
            >
              <span>{role}</span>
              <div className="role-underline"></div>
            </div>
          ))}
        </div>

        <div className="role-details">
          <h3 key={activeRole}>{activeRole}</h3>
          <p key={`${activeRole}-desc`}>{roles[activeRole]}</p>
        </div>
      </div>
    </section>
  );
};

const LandingPage = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (showLoginModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showLoginModal]);

  const { login } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // We assume the user enters their 'user_id' in the email field or just extracts it
      const userId = email.split('@')[0];

      const { apiClient } = await import('../services/apiClient');
      await apiClient.post('/auth/login', {
        user_id: userId,
        email: email,
        password: password
      });

      login(userId, email);
      setShowLoginModal(false);

      if (email.toLowerCase().includes('soc')) {
        navigate('/soc');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('reveal');
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll('.fade-in').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="landing">
      <div className="grid-bg"></div>
      <div className="gradient-bg"></div>
      <svg className="network-mesh" viewBox="0 0 1200 800" fill="none">
        <line x1="100" y1="100" x2="300" y2="200" stroke="rgba(59, 130, 246, 0.15)" strokeWidth="1" className="mesh-line" />
        <line x1="300" y1="200" x2="500" y2="150" stroke="rgba(59, 130, 246, 0.15)" strokeWidth="1" className="mesh-line" />
        <line x1="500" y1="150" x2="700" y2="250" stroke="rgba(59, 130, 246, 0.15)" strokeWidth="1" className="mesh-line" />
        <line x1="700" y1="250" x2="900" y2="200" stroke="rgba(59, 130, 246, 0.15)" strokeWidth="1" className="mesh-line" />
        <line x1="200" y1="400" x2="400" y2="500" stroke="rgba(139, 92, 246, 0.15)" strokeWidth="1" className="mesh-line" />
        <line x1="400" y1="500" x2="600" y2="450" stroke="rgba(139, 92, 246, 0.15)" strokeWidth="1" className="mesh-line" />
        <line x1="600" y1="450" x2="800" y2="550" stroke="rgba(139, 92, 246, 0.15)" strokeWidth="1" className="mesh-line" />
        <circle cx="100" cy="100" r="3" fill="#3b82f6" className="mesh-node" />
        <circle cx="300" cy="200" r="3" fill="#8b5cf6" className="mesh-node" />
        <circle cx="500" cy="150" r="3" fill="#22d3ee" className="mesh-node" />
        <circle cx="700" cy="250" r="3" fill="#3b82f6" className="mesh-node" />
        <circle cx="900" cy="200" r="3" fill="#8b5cf6" className="mesh-node" />
      </svg>

      <nav className={`landing-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-content">
          <div className="brand" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <ThreatSenseLogo size={36} />
            <span style={{ fontSize: '1.25rem', fontWeight: 600, letterSpacing: '0.02em', fontFamily: 'Inter, system-ui, sans-serif' }}>
              Threat<span style={{ color: '#22d3ee' }}>Sense</span>
            </span>
          </div>
          <button onClick={() => setShowLoginModal(true)} className="login-btn">Login</button>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-content">
          <div className="hero-left fade-in">
            <h1>Post-Login Cyber Attack Detection</h1>
            <p className="hero-subtitle">
              Advanced behavioral analytics using Isolation Forest algorithms to detect anomalies, insider threats,
              and zero-day attacks across role-based user sessions in real-time. Monitor credential misuse and
              privilege escalation beyond traditional authentication barriers.
            </p>
            <div className="hero-buttons">
              <Link to="/dashboard" className="btn-primary">Get Started</Link>
              <Link to="/demo" className="btn-secondary">Watch Demo</Link>
            </div>
          </div>
          <div className="hero-right fade-in">
            <div className="monitoring-viz">
              <svg viewBox="0 0 500 500" fill="none" className="business-monitor">
                {/* Connection Lines with Data Pulses */}
                <line x1="250" y1="250" x2="120" y2="120" stroke="url(#line-grad)" strokeWidth="2" className="connection-line" />
                <circle cx="185" cy="185" r="4" fill="#60a5fa" className="data-pulse pulse-1" />

                <line x1="250" y1="250" x2="380" y2="120" stroke="url(#line-grad)" strokeWidth="2" className="connection-line" />
                <circle cx="315" cy="185" r="4" fill="#60a5fa" className="data-pulse pulse-2" />

                <line x1="250" y1="250" x2="120" y2="380" stroke="url(#line-grad)" strokeWidth="2" className="connection-line" />
                <circle cx="185" cy="315" r="4" fill="#60a5fa" className="data-pulse pulse-3" />

                <line x1="250" y1="250" x2="380" y2="380" stroke="url(#line-grad-alert)" strokeWidth="2" className="connection-line" />
                <circle cx="315" cy="315" r="4" fill="#f87171" className="data-pulse pulse-4" />

                {/* Business System Nodes */}
                <g className="system-node">
                  <circle cx="120" cy="120" r="45" fill="url(#node-grad-1)" stroke="#3b82f6" strokeWidth="2" />
                  <circle cx="120" cy="120" r="45" fill="none" stroke="#3b82f6" strokeWidth="1" opacity="0.3" className="node-ring" />
                  <text x="120" y="115" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="600">Finance</text>
                  <text x="120" y="130" textAnchor="middle" fill="#60a5fa" fontSize="9">Active</text>
                </g>

                <g className="system-node">
                  <circle cx="380" cy="120" r="45" fill="url(#node-grad-2)" stroke="#8b5cf6" strokeWidth="2" />
                  <circle cx="380" cy="120" r="45" fill="none" stroke="#8b5cf6" strokeWidth="1" opacity="0.3" className="node-ring" />
                  <text x="380" y="115" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="600">Sales</text>
                  <text x="380" y="130" textAnchor="middle" fill="#a78bfa" fontSize="9">Active</text>
                </g>

                <g className="system-node">
                  <circle cx="120" cy="380" r="45" fill="url(#node-grad-3)" stroke="#22d3ee" strokeWidth="2" />
                  <circle cx="120" cy="380" r="45" fill="none" stroke="#22d3ee" strokeWidth="1" opacity="0.3" className="node-ring" />
                  <text x="120" y="375" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="600">Admin</text>
                  <text x="120" y="390" textAnchor="middle" fill="#67e8f9" fontSize="9">Active</text>
                </g>

                <g className="system-node anomaly-node">
                  <circle cx="380" cy="380" r="45" fill="url(#node-grad-alert)" stroke="#ef4444" strokeWidth="2" className="alert-border" />
                  <circle cx="380" cy="380" r="45" fill="none" stroke="#ef4444" strokeWidth="1" opacity="0.5" className="node-ring-alert" />
                  <text x="380" y="375" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="600">HR</text>
                  <text x="380" y="390" textAnchor="middle" fill="#fca5a5" fontSize="9">Anomaly</text>
                </g>

                {/* Central AI Security Engine */}
                <g className="ai-engine">
                  <circle cx="250" cy="250" r="70" fill="url(#engine-grad)" stroke="#3b82f6" strokeWidth="3" className="engine-core" />
                  <circle cx="250" cy="250" r="70" fill="none" stroke="#3b82f6" strokeWidth="1" opacity="0.4" className="engine-ring-1" />
                  <circle cx="250" cy="250" r="85" fill="none" stroke="#8b5cf6" strokeWidth="1" opacity="0.3" className="engine-ring-2" />
                  <circle cx="250" cy="250" r="100" fill="none" stroke="#22d3ee" strokeWidth="1" opacity="0.2" className="engine-ring-3" />

                  <text x="250" y="240" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="700">AI Security</text>
                  <text x="250" y="258" textAnchor="middle" fill="#60a5fa" fontSize="12" fontWeight="600">Engine</text>
                  <text x="250" y="275" textAnchor="middle" fill="#94a3b8" fontSize="9">Analyzing...</text>
                </g>

                {/* Gradients */}
                <defs>
                  <linearGradient id="line-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.3" />
                  </linearGradient>
                  <linearGradient id="line-grad-alert" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#f97316" stopOpacity="0.3" />
                  </linearGradient>
                  <radialGradient id="node-grad-1">
                    <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#1e293b" stopOpacity="0.9" />
                  </radialGradient>
                  <radialGradient id="node-grad-2">
                    <stop offset="0%" stopColor="#581c87" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#1e293b" stopOpacity="0.9" />
                  </radialGradient>
                  <radialGradient id="node-grad-3">
                    <stop offset="0%" stopColor="#164e63" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#1e293b" stopOpacity="0.9" />
                  </radialGradient>
                  <radialGradient id="node-grad-alert">
                    <stop offset="0%" stopColor="#7f1d1d" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#1e293b" stopOpacity="0.9" />
                  </radialGradient>
                  <radialGradient id="engine-grad">
                    <stop offset="0%" stopColor="#1e40af" stopOpacity="0.9" />
                    <stop offset="50%" stopColor="#1e3a8a" stopOpacity="0.95" />
                    <stop offset="100%" stopColor="#1e293b" stopOpacity="1" />
                  </radialGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>
      </section>

      <section className="threat-section fade-in">
        <h2>Modern Threats Bypass Authentication</h2>
        <div className="threat-grid">
          <div className="threat-card">
            <h3>Credential Misuse Risk</h3>
            <p>Legitimate credentials used for unauthorized access patterns remain invisible to traditional security.</p>
          </div>
          <div className="threat-card">
            <h3>Insider Behavior Deviations</h3>
            <p>Trusted users exhibiting anomalous behavior patterns indicate potential compromise or malicious intent.</p>
          </div>
          <div className="threat-card">
            <h3>Privilege Escalation Threats</h3>
            <p>Unauthorized elevation of access rights exploits post-authentication vulnerabilities in real-time.</p>
          </div>
        </div>
      </section>

      <RoleIntelligenceSection />

      <section className="ml-section fade-in">
        <h2>AI Behavioral Intelligence Engine</h2>
        <p className="ml-subtitle">Powered by Isolation Forest Anomaly Detection</p>

        <div className="ml-content-grid">
          <div className="ml-explanation">
            <div className="ml-block">
              <h3>Feature Modeling</h3>
              <ul>
                <li>Login time patterns</li>
                <li>Session duration</li>
                <li>Resource access behavior</li>
                <li>Data interaction volume</li>
              </ul>
            </div>

            <div className="ml-block">
              <h3>Anomaly Isolation</h3>
              <ul>
                <li>Random partitioning trees</li>
                <li>Shorter path length = anomaly</li>
                <li>No signature dependency</li>
              </ul>
            </div>

            <div className="ml-block">
              <h3>Contextual Risk Evaluation</h3>
              <ul>
                <li>Role-aware baseline comparison</li>
                <li>Session-level evaluation</li>
                <li>Controlled alert generation</li>
              </ul>
            </div>
          </div>

          <div className="ml-pipeline-visual">
            <div className="pipeline-step">
              <div className="pipeline-box">User Activity</div>
            </div>
            <div className="pipeline-connector"></div>
            <div className="pipeline-step">
              <div className="pipeline-box">Feature Vector</div>
            </div>
            <div className="pipeline-connector"></div>
            <div className="pipeline-step">
              <div className="pipeline-box pipeline-highlight">Isolation Trees</div>
            </div>
            <div className="pipeline-connector"></div>
            <div className="pipeline-step">
              <div className="pipeline-box">Anomaly Score</div>
            </div>
            <div className="pipeline-connector"></div>
            <div className="pipeline-step">
              <div className="pipeline-box">Controlled Alert Engine</div>
            </div>
          </div>
        </div>

        <div className="ml-benefits">
          <h4>Why Isolation Forest?</h4>
          <div className="benefits-grid">
            <div className="benefit-item">No labeled attack data required</div>
            <div className="benefit-item">Detects zero-day behaviors</div>
            <div className="benefit-item">Scales efficiently</div>
            <div className="benefit-item">Works in high-dimensional environments</div>
          </div>
        </div>
      </section>

      <section className="architecture-section fade-in">
        <h2>System Architecture</h2>
        <div className="arch-container">
          {/* Layer 1: Data Collection */}
          <div className="arch-layer">
            <div className="layer-label">Layer 1 – Data Collection</div>
            <div className="arch-row">
              <div className="arch-block">User Activity Logs</div>
              <div className="arch-block">Session Aggregation</div>
            </div>
          </div>

          <div className="arch-connector-vertical"></div>

          {/* Layer 2: ML Intelligence */}
          <div className="arch-layer ml-layer">
            <div className="layer-label">Layer 2 – ML Intelligence</div>
            <div className="arch-row">
              <div className="arch-block">Feature Extraction</div>
              <div className="arch-block ml-highlight">Isolation Forest Model</div>
              <div className="arch-block">Risk Scoring Engine</div>
            </div>
          </div>

          <div className="arch-connector-vertical"></div>

          {/* Layer 3: Response & Monitoring */}
          <div className="arch-layer">
            <div className="layer-label">Layer 3 – Response & Monitoring</div>
            <div className="arch-row">
              <div className="arch-block">Alert Engine</div>
              <div className="arch-block">SOC Dashboard</div>
              <div className="arch-block">Business Dashboard</div>
            </div>
          </div>
        </div>
      </section>

      <section className="value-section fade-in">
        <h2>Enterprise Value</h2>
        <div className="enterprise-grid">
          <div className="enterprise-card">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <path d="M24 4L8 12v12c0 11 7.8 21.7 16 24 8.2-2.3 16-13 16-24V12L24 4z" fill="url(#value-grad-1)" stroke="#3b82f6" strokeWidth="2" />
              <defs>
                <linearGradient id="value-grad-1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.3" />
                </linearGradient>
              </defs>
            </svg>
            <h3>Zero-Day Detection</h3>
            <p className="enterprise-impact">Identify unknown threats without signature dependencies</p>
            <ul className="enterprise-benefits">
              <li>Behavioral anomaly detection</li>
              <li>No prior threat knowledge required</li>
              <li>Real-time threat identification</li>
            </ul>
          </div>
          <div className="enterprise-card">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="20" stroke="#8b5cf6" strokeWidth="2" fill="rgba(139, 92, 246, 0.1)" />
              <path d="M16 24l6 6 12-12" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h3>Insider Threat Mitigation</h3>
            <p className="enterprise-impact">Detect malicious insiders and compromised accounts</p>
            <ul className="enterprise-benefits">
              <li>Continuous behavioral analysis</li>
              <li>Credential misuse detection</li>
              <li>Privilege escalation monitoring</li>
            </ul>
          </div>
          <div className="enterprise-card">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <rect x="8" y="12" width="32" height="24" rx="2" stroke="#22d3ee" strokeWidth="2" fill="rgba(34, 211, 238, 0.1)" />
              <path d="M12 20h24M12 26h16" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <h3>Reduced False Positives</h3>
            <p className="enterprise-impact">Machine learning adapts to legitimate user patterns</p>
            <ul className="enterprise-benefits">
              <li>Minimized alert fatigue</li>
              <li>Context-aware detection</li>
              <li>Adaptive baseline learning</li>
            </ul>
          </div>
          <div className="enterprise-card">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <rect x="10" y="10" width="10" height="10" rx="2" stroke="#3b82f6" strokeWidth="2" fill="rgba(59, 130, 246, 0.1)" />
              <rect x="28" y="10" width="10" height="10" rx="2" stroke="#8b5cf6" strokeWidth="2" fill="rgba(139, 92, 246, 0.1)" />
              <rect x="10" y="28" width="10" height="10" rx="2" stroke="#22d3ee" strokeWidth="2" fill="rgba(34, 211, 238, 0.1)" />
              <rect x="28" y="28" width="10" height="10" rx="2" stroke="#3b82f6" strokeWidth="2" fill="rgba(59, 130, 246, 0.1)" />
            </svg>
            <h3>Scalable Architecture</h3>
            <p className="enterprise-impact">Microservice-ready design for enterprise deployment</p>
            <ul className="enterprise-benefits">
              <li>Horizontal scaling support</li>
              <li>API-first integration</li>
              <li>Cloud-native infrastructure</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="cta-section fade-in">
        <h2>Secure Beyond Authentication</h2>
        <p>Deploy enterprise-grade behavioral analytics and detect threats in real-time</p>
        <Link to="/dashboard" className="btn-primary large">Launch Dashboard</Link>
      </section>

      <footer className="landing-footer">
        <div className="footer-content">
          <p>&copy; 2024 ThreatSense. Enterprise Cybersecurity Platform.</p>
          <p className="tech-stack">React + Flask + Isolation Forest</p>
        </div>
      </footer>

      {showLoginModal && (
        <div className="modal-overlay" onClick={() => setShowLoginModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowLoginModal(false)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <h2>Login to ThreatSense</h2>
            {error && <div style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>
              <button type="submit" className="modal-login-btn" disabled={loading}>
                {loading ? 'Processing...' : 'Login'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
