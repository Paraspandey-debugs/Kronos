import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { HomeView } from '../../pages/dashboard/HomeView';
import { RunsView } from '../../pages/dashboard/RunsView';
import { FlowsList } from '../../pages/Flows';
import './dashboard.css';

export const DashboardLayout: React.FC<{ initialTab?: string }> = ({ initialTab = 'Home' }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const navigate = useNavigate();

  // Sync state if initialTab prop changes (e.g. from browser back/forward buttons)
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    
    // Update the URL to match the current tab
    if (tab === 'Home') {
      navigate('/dashboard');
    } else if (tab === 'Flows') {
      navigate('/flows');
    }
  };

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
      <Sidebar activeTab={activeTab} setActiveTab={handleTabChange} />
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
          {activeTab === 'Flows' && <FlowsList />}
          {activeTab !== 'Home' && activeTab !== 'Runs' && activeTab !== 'Flows' && (
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
