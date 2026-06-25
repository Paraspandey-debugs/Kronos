import React from 'react';
import { Link } from 'react-router-dom';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';

export const Navigation: React.FC = () => {
  return (
    <nav className="main-nav">
      <div style={{ fontWeight: 700, fontSize: '1.25rem', letterSpacing: '-0.02em' }}>
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>Kronos</Link>
      </div>
      <div className="nav-links">
        <Link to="#">Architecture</Link>
        <Link to="#">API</Link>
        <Link to="/docs">Docs</Link>
        <Link to="#">GitHub</Link>
      </div>
      <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link to="/docs">
          <button className="btn btn-outline">Documentation</button>
        </Link>
        <SignedOut>
          <SignInButton mode="modal">
            <button className="btn btn-primary">Sign In</button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <Link to="/dashboard">
            <button className="btn btn-primary">Dashboard</button>
          </Link>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
      </div>
    </nav>
  );
};
