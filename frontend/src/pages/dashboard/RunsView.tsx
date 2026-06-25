import React from 'react';
import { Link } from 'react-router-dom';
import { GitMerge } from 'lucide-react';
import '../../components/dashboard/dashboard.css';

export const RunsView: React.FC = () => {
  return (
    <div className="dashboard-empty">
      <div style={{ color: '#a1a1aa', marginBottom: '0.5rem' }}>
        <GitMerge size={48} strokeWidth={1.5} />
      </div>
      <h1>Run a task or flow to get started</h1>
      <p>Runs store the state history for each execution of a task or flow.</p>
      <Link to="/docs" style={{ textDecoration: 'none' }}>
        <button className="dashboard-btn-primary">View Docs ↗</button>
      </Link>
    </div>
  );
};
