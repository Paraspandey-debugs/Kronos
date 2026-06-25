import React from 'react';
import { Link } from 'react-router-dom';

export const Navigation: React.FC = () => {
  return (
    <nav>
      <div style={{ fontWeight: 700, fontSize: '1.25rem', letterSpacing: '-0.02em' }}>
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>Kronos</Link>
      </div>
      <div className="nav-links">
        <Link to="#">Architecture</Link>
        <Link to="#">API</Link>
        <Link to="#">Docs</Link>
        <Link to="#">GitHub</Link>
      </div>
      <div className="nav-actions">
        <button className="btn btn-outline">Documentation</button>
        <Link to="/dashboard">
          <button className="btn btn-primary">Dashboard</button>
        </Link>
      </div>
    </nav>
  );
};
