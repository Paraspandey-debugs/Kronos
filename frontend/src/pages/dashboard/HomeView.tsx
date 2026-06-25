import React from 'react';
import { Code2 } from 'lucide-react';
import '../../components/dashboard/dashboard.css';

export const HomeView: React.FC = () => {
  return (
    <div className="dashboard-empty">
      <h1>Welcome to Kronos!</h1>
      <p>Deploy your first script</p>
      
      <button className="dashboard-btn-outline" style={{ width: '100%', justifyContent: 'center' }}>
        <Code2 size={16} /> Connect Git Repository
      </button>
      
      <div className="dashboard-divider">or</div>
      
      <button className="dashboard-btn-outline" style={{ width: '100%', justifyContent: 'center' }}>
        &lt;/&gt; Deploy manually
      </button>
    </div>
  );
};
