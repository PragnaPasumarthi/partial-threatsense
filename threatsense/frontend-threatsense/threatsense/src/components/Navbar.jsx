import { useNavigate, useLocation } from 'react-router-dom';
import { useSession } from '../context/SessionContext';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useSession();
  const isSOC = location.pathname.startsWith('/soc');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSwitchToSOC = () => {
    navigate('/soc');
  };

  const handleBackToSales = () => {
    navigate('/dashboard');
  };

  return (
    <nav style={{
      backgroundColor: 'rgba(15, 23, 42, 0.85)',
      backdropFilter: 'blur(20px)',
      padding: '1rem 2rem',
      display: 'flex',
      justifyContent: 'flex-end',
      alignItems: 'center',
      gap: '1.5rem',
      borderBottom: '1px solid rgba(59, 130, 246, 0.15)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      height: '64px',
    }}>
      {isSOC && (
        <button
          onClick={handleBackToSales}
          style={{
            padding: '0.5rem 1.25rem',
            background: 'rgba(59, 130, 246, 0.15)',
            color: '#3b82f6',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: 600,
            fontFamily: 'Inter, sans-serif',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(59, 130, 246, 0.25)';
            e.target.style.borderColor = 'rgba(59, 130, 246, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(59, 130, 246, 0.15)';
            e.target.style.borderColor = 'rgba(59, 130, 246, 0.3)';
          }}
        >
          ← Back to Sales
        </button>
      )}
      {!isSOC && (
        <button
          onClick={handleSwitchToSOC}
          style={{
            padding: '0.5rem 1.25rem',
            background: 'rgba(239, 68, 68, 0.15)',
            color: '#ef4444',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: 600,
            fontFamily: 'Inter, sans-serif',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(239, 68, 68, 0.25)';
            e.target.style.borderColor = 'rgba(239, 68, 68, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(239, 68, 68, 0.15)';
            e.target.style.borderColor = 'rgba(239, 68, 68, 0.3)';
          }}
        >
          Switch to SOC
        </button>
      )}
      <span style={{
        color: '#cbd5e1',
        fontSize: '0.95rem',
        fontFamily: 'Inter, sans-serif',
        fontWeight: 500
      }}>
        Business User
      </span>
      <span style={{
        padding: '0.4rem 1rem',
        background: 'rgba(59, 130, 246, 0.15)',
        color: '#60a5fa',
        borderRadius: '20px',
        fontSize: '0.8rem',
        fontWeight: 600,
        fontFamily: 'Inter, sans-serif',
        border: '1px solid rgba(59, 130, 246, 0.3)'
      }}>
        Business View
      </span>
      <button
        onClick={handleLogout}
        style={{
          padding: '0.5rem 1.25rem',
          background: 'rgba(239, 68, 68, 0.15)',
          color: '#ef4444',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '8px',
          fontSize: '0.9rem',
          fontWeight: 600,
          fontFamily: 'Inter, sans-serif',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.target.style.background = 'rgba(239, 68, 68, 0.25)';
          e.target.style.borderColor = 'rgba(239, 68, 68, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = 'rgba(239, 68, 68, 0.15)';
          e.target.style.borderColor = 'rgba(239, 68, 68, 0.3)';
        }}
      >
        Logout
      </button>
    </nav>
  );
};

export default Navbar;
