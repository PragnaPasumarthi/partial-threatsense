import React from 'react';
import { Link } from 'react-router-dom';

const DemoPage = () => {
  return (
    <div style={styles.container}>
      <nav style={styles.nav}>
        <Link to="/" style={styles.backLink}>← Back to Home</Link>
      </nav>
      <div style={styles.content}>
        <h1 style={styles.title}>Product Demo</h1>
        <p style={styles.description}>
          Interactive demonstration of ThreatSense behavioral analytics platform.
        </p>
        <div style={styles.videoPlaceholder}>
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
            <circle cx="60" cy="60" r="58" stroke="rgba(59, 130, 246, 0.3)" strokeWidth="2"/>
            <path d="M45 35L85 60L45 85V35Z" fill="#3b82f6"/>
          </svg>
          <p style={styles.placeholderText}>Demo video coming soon</p>
        </div>
        <Link to="/dashboard" style={styles.ctaButton}>Try Dashboard</Link>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#0f172a',
    color: '#f8fafc',
  },
  nav: {
    padding: '2rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  },
  backLink: {
    color: '#3b82f6',
    textDecoration: 'none',
    fontSize: '1rem',
  },
  content: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '4rem 2rem',
    textAlign: 'center',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '700',
    marginBottom: '1rem',
  },
  description: {
    fontSize: '1.2rem',
    color: '#94a3b8',
    marginBottom: '3rem',
  },
  videoPlaceholder: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: '16px',
    padding: '4rem',
    marginBottom: '2rem',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  placeholderText: {
    marginTop: '1rem',
    color: '#94a3b8',
  },
  ctaButton: {
    display: 'inline-block',
    backgroundColor: '#3b82f6',
    color: '#fff',
    padding: '1rem 2rem',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: '600',
    transition: 'all 0.3s ease',
  },
};

export default DemoPage;
