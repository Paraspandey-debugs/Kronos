import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import { fetchWorkflows, createWorkflow } from '../../lib/api';
import { formatDistanceToNow } from 'date-fns';
import { Copy, Check, Play, CheckCircle2, XCircle, Clock } from 'lucide-react';
import '../../components/dashboard/dashboard.css';

const StatusBadge = ({ status }: { status: string }) => {
  const config: Record<string, { color: string, bg: string, icon: any }> = {
    PENDING: { color: '#a1a1aa', bg: 'rgba(161, 161, 170, 0.15)', icon: Clock },
    RUNNING: { color: '#60a5fa', bg: 'rgba(96, 165, 250, 0.15)', icon: Play },
    COMPLETED: { color: '#4ade80', bg: 'rgba(74, 222, 128, 0.15)', icon: CheckCircle2 },
    FAILED: { color: '#f87171', bg: 'rgba(248, 113, 113, 0.15)', icon: XCircle }
  };
  const { color, bg, icon: Icon } = config[status] || config.PENDING;
  
  return (
    <span style={{ 
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      color, backgroundColor: bg, padding: '2px 8px', 
      borderRadius: '12px', fontSize: '0.75rem', fontWeight: 500 
    }}>
      <Icon size={12} />
      {status}
    </span>
  );
};

export const HomeView: React.FC = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);
  
  const [agentType, setAgentType] = useState('scout');
  const [payload, setPayload] = useState('{"target": "example.com"}');
  
  const { data: workflows, isLoading } = useQuery({
    queryKey: ['workflows'],
    queryFn: async () => {
      const token = await getToken();
      return fetchWorkflows({ take: 100 }, token || '');
    }
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const token = await getToken();
      return createWorkflow(data, token || '');
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      alert(`Workflow created: ${data.workflowId}`);
    }
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(curlExample);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parsedPayload = JSON.parse(payload);
      mutation.mutate({
        steps: [{ agentType, payload: parsedPayload }]
      });
    } catch (err) {
      console.error(err);
      alert("Invalid JSON payload");
    }
  };

  const totalRuns = workflows?.length || 0;
  const failedRuns = workflows?.filter((w: any) => w.status === 'FAILED').length || 0;
  const runningRuns = workflows?.filter((w: any) => w.status === 'RUNNING').length || 0;
  const recentWorkflows = workflows?.slice(0, 5) || [];

  const curlExample = `curl -X POST https://api.kronos.dev/v1/workflows \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"steps": [{"agentType": "scout", "payload": {"target": "example.com"}}]}'`;

  return (
    <div className="home-dashboard">
      <div className="dashboard-grid">
        <div className="stats-card">
          <h3 className="card-title">Total Runs</h3>
          <div className="stat-value">{isLoading ? '-' : totalRuns.toLocaleString()}</div>
        </div>
        <div className="stats-card">
          <h3 className="card-title">Failed</h3>
          <div className="stat-value" style={{ color: '#f87171' }}>{isLoading ? '-' : failedRuns.toLocaleString()}</div>
        </div>
        <div className="stats-card">
          <h3 className="card-title">Running</h3>
          <div className="stat-value" style={{ color: '#60a5fa' }}>{isLoading ? '-' : runningRuns.toLocaleString()}</div>
        </div>
        
        <div className="quick-start-card">
          <div className="card-header">
            <h3 className="card-title">Quick Start</h3>
            <div className="card-actions">
              <button className="icon-btn" onClick={handleCopy} title="Copy code">
                {copied ? <Check size={14} color="#4ade80" /> : <Copy size={14} />}
              </button>
              <a href="/docs" className="text-link">Docs</a>
            </div>
          </div>
          <pre className="code-block">{curlExample}</pre>
        </div>
      </div>

      <div className="dashboard-grid-2">
        <div className="recent-activity-card">
          <h3 className="card-title" style={{ marginBottom: '1rem' }}>Recent Activity</h3>
          {isLoading ? (
            <p className="text-muted">Loading...</p>
          ) : recentWorkflows.length === 0 ? (
            <p className="text-muted">No workflows yet.</p>
          ) : (
            <div className="table-container">
              <table className="activity-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Status</th>
                    <th>Progress</th>
                    <th>Time</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentWorkflows.map((w: any) => {
                    const completedSteps = w.steps.filter((s: any) => s.status === 'COMPLETED').length;
                    const totalSteps = w.steps.length;
                    return (
                      <tr key={w.id}>
                        <td className="font-mono">#{w.id.substring(0, 4)}</td>
                        <td><StatusBadge status={w.status} /></td>
                        <td>{completedSteps}/{totalSteps} done</td>
                        <td className="text-muted">{formatDistanceToNow(new Date(w.createdAt), { addSuffix: true })}</td>
                        <td>
                          <button className="dashboard-btn-outline" style={{ padding: '4px 8px', fontSize: '0.75rem' }}>
                            View
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="quick-submit-card">
          <h3 className="card-title" style={{ marginBottom: '1rem' }}>⚡ Quick Submit</h3>
          <form onSubmit={handleQuickSubmit} className="quick-submit-form">
            <div className="form-group">
              <label>Agent Type:</label>
              <select value={agentType} onChange={e => setAgentType(e.target.value)} className="form-input">
                <option value="scout">scout</option>
                <option value="executor">executor</option>
              </select>
            </div>
            <div className="form-group">
              <label>Payload (JSON):</label>
              <textarea 
                value={payload} 
                onChange={e => setPayload(e.target.value)}
                className="form-input font-mono"
                rows={4}
              />
            </div>
            <button type="submit" className="dashboard-btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={mutation.isPending}>
              {mutation.isPending ? 'Submitting...' : 'Submit Workflow'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
