import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { HomeView } from '../../pages/dashboard/HomeView';
import { RunsView } from '../../pages/dashboard/RunsView';
import './dashboard.css';

export const DashboardLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Runs');

  return (
    <div className="dashboard-root" style={{
      display: 'flex',
      flexDirection: 'row',
      height: '100vh',
      width: '100vw',
      backgroundColor: '#050505',
      color: '#fff',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 100,
      overflow: 'hidden'
    }}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="dashboard-main" style={{
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        backgroundColor: '#050505',
        backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px)',
        backgroundSize: '24px 24px'
      }}>
        <Topbar activeTab={activeTab} />
        <div className="dashboard-content" style={{
          flexGrow: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem'
        }}>
          {activeTab === 'Home' && <HomeView />}
          {activeTab === 'Runs' && <RunsView />}
          {activeTab !== 'Home' && activeTab !== 'Runs' && (
            <div className="dashboard-empty">
              <h1>{activeTab}</h1>
              <p>This section is under construction.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
