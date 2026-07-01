import React from 'react';
import { UserButton, useUser } from '@clerk/clerk-react';
import { Home, PlayCircle, Layers, Activity, Settings, HelpCircle, GitMerge } from 'lucide-react';
import './dashboard.css';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { user } = useUser();

  const navItems = [
    { name: 'Home', icon: Home },
    { name: 'Runs', icon: PlayCircle },
    { name: 'Assets', icon: Layers, badge: 'Beta' },
    { name: 'Flows', icon: GitMerge },
    { name: 'Deployments', icon: Activity },
    { name: 'Settings', icon: Settings },
  ];

  return (
    <aside className="dashboard-sidebar">
      <div className="dashboard-header">
        <UserButton afterSignOutUrl="/" />
        <span className="dashboard-workspace-name">
          {user?.firstName ? `${user.firstName}'s Workspace` : 'Default Workspace'}
        </span>
      </div>
      
      <nav className="dashboard-nav">
        {navItems.map((item) => (
          <button
            key={item.name}
            className={`dashboard-nav-item ${activeTab === item.name ? 'active' : ''}`}
            onClick={() => setActiveTab(item.name)}
          >
            <item.icon size={18} />
            <span>{item.name}</span>
            {item.badge && (
              <span className="dashboard-badge">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="dashboard-footer">
        <button className="dashboard-nav-item" style={{ width: 'auto', padding: '0.5rem' }}>
          <HelpCircle size={18} />
          <span>Help</span>
        </button>
        <button className="dashboard-btn-primary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}>
          Upgrade
        </button>
      </div>
    </aside>
  );
};
