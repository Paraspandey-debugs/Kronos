import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import { fetchWorkflows } from '../../lib/api.ts';
import { formatDistanceToNow } from 'date-fns';
import { Copy, Check, Play, CheckCircle2, XCircle, Clock, X } from 'lucide-react';
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

  const [copied, setCopied] = useState(false);
  
  // State for the Output Data Viewer Modal
  const [selectedOutput, setSelectedOutput] = useState<any>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [copiedJson, setCopiedJson] = useState(false);
  
  const { data: workflows, isLoading } = useQuery({
    queryKey: ['workflows'],
    queryFn: async () => {
      const token = await getToken();
      return fetchWorkflows({ take: 100 }, token || '');
    }
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(curlExample);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const totalRuns = workflows?.length || 0;
  const failedRuns = workflows?.filter((w: any) => w.status === 'FAILED').length || 0;
  const runningRuns = workflows?.filter((w: any) => w.status === 'RUNNING').length || 0;
  const recentWorkflows = workflows?.slice(0, 5) || [];

  const curlExample = `curl -X POST https://api.kronos.dev/v1/flows/YOUR_FLOW_ID/run \\
  -H "Authorization: Bearer YOUR_TOKEN"`;

  // Helper to format output beautifully (parsing stringified nested JSON if any)
  let formattedOutput = '';
  if (selectedOutput) {
    let dataToFormat = selectedOutput;
    if (typeof selectedOutput === 'object' && selectedOutput !== null) {
       const parsed = { ...selectedOutput };
       for (const key in parsed) {
         if (typeof parsed[key] === 'string') {
           try {
             parsed[key] = JSON.parse(parsed[key]);
           } catch(e) {}
         }
       }
       dataToFormat = parsed;
    }
    formattedOutput = JSON.stringify(dataToFormat, null, 2);
  }

  const handleCopyJson = () => {
    navigator.clipboard.writeText(formattedOutput);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

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

      <div style={{ width: '100%' }}>
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
                    const nodes = w.nodes || [];
                    const completedSteps = nodes.filter((s: any) => s.status === 'COMPLETED').length;
                    const totalSteps = nodes.length;
                    return (
                      <tr key={w.id}>
                        <td className="font-mono">#{w.id.substring(0, 4)}</td>
                        <td><StatusBadge status={w.status} /></td>
                        <td>{completedSteps}/{totalSteps} done</td>
                        <td className="text-muted">{formatDistanceToNow(new Date(w.createdAt), { addSuffix: true })}</td>
                        <td>
                          <button 
                            className="dashboard-btn-outline" 
                            style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                            onClick={() => {
                              const endNode = nodes.find((n: any) => n.type === 'END');
                              if (endNode && endNode.result) {
                                setSelectedOutput(endNode.result);
                                setSelectedStatus(null);
                              } else {
                                setSelectedOutput(null);
                                setSelectedStatus(w.status);
                              }
                            }}
                          >
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
      </div>

      {/* Output Data Viewer Modal */}
      {(selectedOutput || selectedStatus) && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
        }}>
          <div style={{
            background: '#18181b', border: '1px solid #27272a',
            borderRadius: '12px', width: '90%', maxWidth: '650px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            <div style={{
              padding: '16px 20px', borderBottom: '1px solid #27272a',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#f4f4f5' }}>
                {selectedOutput ? 'Execution Result' : 'Workflow Status'}
              </h3>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {selectedOutput && (
                  <button onClick={handleCopyJson} style={{
                    background: 'rgba(255, 255, 255, 0.05)', border: '1px solid #27272a', 
                    color: '#e4e4e7', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                    fontSize: '0.85rem', padding: '6px 12px', borderRadius: '6px', transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}>
                    {copiedJson ? <Check size={14} color="#4ade80" /> : <Copy size={14} />}
                    {copiedJson ? 'Copied!' : 'Copy JSON'}
                  </button>
                )}
                <button 
                  onClick={() => { setSelectedOutput(null); setSelectedStatus(null); }} 
                  style={{
                    background: 'transparent', border: 'none', color: '#a1a1aa',
                    cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center',
                    borderRadius: '6px', transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            <div style={{ padding: '20px', maxHeight: '70vh', overflowY: 'auto', background: '#0f0f11' }}>
              {selectedOutput ? (
                <pre style={{
                  margin: 0, padding: '16px', background: '#000',
                  borderRadius: '8px', color: '#a1a1aa', fontSize: '0.875rem',
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace', 
                  overflowX: 'auto', border: '1px solid #27272a', lineHeight: '1.5'
                }}>
                  <code style={{ color: '#e4e4e7' }}>{formattedOutput}</code>
                </pre>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#a1a1aa' }}>
                  <Clock size={32} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                  <p style={{ margin: 0, fontSize: '1rem' }}>
                    Workflow is currently <strong style={{ color: '#e4e4e7' }}>{selectedStatus}</strong>.
                  </p>
                  <p style={{ margin: '0.5rem 0 0', fontSize: '0.875rem', opacity: 0.7 }}>
                    The output data will be available here once the execution is completed.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

