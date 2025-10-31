import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { isAuthenticated, logout } from '../services/authService';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    templates: 0,
    certificates: 0,
    verified: 0,
  });

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Certificate Generator Dashboard</h1>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </header>

      <div className="dashboard-content">
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Templates</h3>
            <p>{stats.templates}</p>
          </div>
          <div className="stat-card">
            <h3>Certificates</h3>
            <p>{stats.certificates}</p>
          </div>
          <div className="stat-card">
            <h3>Verified</h3>
            <p>{stats.verified}</p>
          </div>
        </div>

        <div className="actions-grid">
          <Link to="/templates" className="action-card">
            <div className="action-icon">📄</div>
            <h3>Manage Templates</h3>
            <p>Upload and manage certificate templates</p>
          </Link>
          <Link to="/generate" className="action-card">
            <div className="action-icon">✨</div>
            <h3>Generate Certificate</h3>
            <p>Create a new certificate</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

