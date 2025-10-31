import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { isAuthenticated, logout } from '../services/authService';
import './Dashboard.css';
import { getStats } from '../../../frontend/src/services/statsServices'; // <-- Import new service
import toast from 'react-hot-toast'; // <-- Import toast for errors

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    templates: 0,
    certificates: 0,
    verified: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
    }
  }, [navigate]);

  // <-- Add new useEffect to fetch stats -->
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await getStats();
        setStats(data);
      } catch (error) {
        toast.error('Failed to load dashboard stats');
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if authenticated (prevents error on login redirect)
    if (isAuthenticated()) {
      fetchStats();
    }
  }, []); // Empty dependency array means it runs once on mount
  // <-- End new useEffect -->

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
            <p>{loading ? '...' : stats.templates}</p>
          </div>
          <div className="stat-card">
            <h3>Certificates</h3>
            <p>{loading ? '...' : stats.certificates}</p>
          </div>
          <div className="stat-card">
            <h3>Verified</h3>
            <p>{loading ? '...' : stats.verified}</p>
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

