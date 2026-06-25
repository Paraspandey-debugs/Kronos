import React from 'react';
import { Home, PlayCircle } from 'lucide-react';
import './dashboard.css';

interface TopbarProps {
  activeTab: string;
}

export const Topbar: React.FC<TopbarProps> = ({ activeTab }) => {
  return (
    <div className="dashboard-topbar">
      <div className="dashboard-topbar-breadcrumb">
        {activeTab === 'Runs' ? <PlayCircle size={16} /> : <Home size={16} />}
        <span>{activeTab}</span>
      </div>
    </div>
  );
};
