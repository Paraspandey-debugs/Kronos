import React from 'react';
import { DocsCanvas } from '../components/DocsCanvas';

export const DocsPage: React.FC = () => {
  return (
    <div style={{ position: 'relative', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
      <DocsCanvas />

      <div style={{ 
        display: 'flex', 
        flexGrow: 1,
        overflow: 'hidden',
        position: 'relative',
        zIndex: 1,
        width: '100%'
      }}>
        
        {/* Left Sidebar */}
        <aside style={{
          width: '280px',
          flexShrink: 0,
          borderRight: '1px solid rgba(255, 255, 255, 0.05)',
          background: 'rgba(10, 10, 12, 0.3)',
          backdropFilter: 'blur(12px)',
          overflowY: 'auto',
          padding: '30px 20px',
          color: '#a1a1aa'
        }}>
          <div style={{ marginBottom: '30px' }}>
            <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#71717a', marginBottom: '10px', fontWeight: 600 }}>API Reference</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.95rem' }}>
              <li style={{ padding: '8px 12px', background: 'rgba(0, 245, 212, 0.1)', color: '#00f5d4', borderRadius: '6px', cursor: 'pointer', marginBottom: '4px', fontWeight: 500 }}>Overview</li>
              <li style={{ padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', marginBottom: '4px', transition: 'background 0.2s' }}>Authentication</li>
              <li style={{ padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', marginBottom: '4px', transition: 'background 0.2s' }}>Workflows</li>
              <li style={{ padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', marginBottom: '4px', transition: 'background 0.2s' }}>Nodes</li>
            </ul>
          </div>
          
          <div>
            <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#71717a', marginBottom: '10px', fontWeight: 600 }}>Services</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.95rem' }}>
              <li style={{ padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', marginBottom: '4px', transition: 'background 0.2s' }}>Gateway API</li>
              <li style={{ padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', marginBottom: '4px', transition: 'background 0.2s' }}>Engine A (Orchestrator)</li>
              <li style={{ padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', marginBottom: '4px', transition: 'background 0.2s' }}>Engine B (Worker)</li>
            </ul>
          </div>
        </aside>

        {/* Main Content */}
        <main style={{
          flexGrow: 1,
          overflowY: 'auto',
          padding: '50px 80px',
          background: 'rgba(5, 5, 5, 0.2)',
          backdropFilter: 'blur(6px)',
          color: '#f0f0f5'
        }}>
          <div style={{ maxWidth: '850px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#00f5d4', fontSize: '0.875rem', marginBottom: '20px', fontWeight: 600 }}>
              <span style={{ cursor: 'pointer' }}>API REFERENCE</span>
              <span>›</span>
            </div>
            
            <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '3rem', marginBottom: '25px', letterSpacing: '-0.02em', color: '#ffffff' }}>
              Kronos API Overview
            </h1>
            
            <p style={{ color: '#e4e4e7', marginBottom: '30px', fontSize: '1.15rem', lineHeight: '1.7' }}>
              This section provides detailed reference documentation for working with the Kronos Distributed System. For an introduction to Kronos architecture, please visit the <span style={{ color: '#00f5d4', cursor: 'pointer' }}>Architecture</span> section.
            </p>

            <p style={{ color: '#a1a1aa', marginBottom: '40px', lineHeight: '1.7', fontSize: '1.05rem' }}>
              The Kronos reference documentation is broken down into functional microservices:
            </p>

            <h2 style={{ fontSize: '2rem', marginBottom: '20px', fontFamily: 'Outfit, sans-serif', color: '#ffffff', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>Gateway API</h2>
            <p style={{ color: '#a1a1aa', marginBottom: '25px', lineHeight: '1.7', fontSize: '1.05rem' }}>
              The Gateway is the primary entry point for the Kronos system. It exposes the main REST API used by clients to trigger workflows and monitor system health.
            </p>
            
            <div style={{ marginBottom: '40px' }}>
              <h3 style={{ fontSize: '1.3rem', color: '#ffffff', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ background: 'rgba(0, 245, 212, 0.2)', color: '#00f5d4', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>GET</span>
                /health
              </h3>
              <p style={{ color: '#a1a1aa', marginBottom: '15px', lineHeight: '1.6' }}>Verify that the Gateway service is online and responding.</p>
              
              <div style={{ background: 'rgba(10, 10, 12, 0.5)', padding: '15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', fontFamily: 'monospace', color: '#e4e4e7' }}>
                {`{
  "status": "ok",
  "timestamp": "2026-06-25T07:02:09.852Z"
}`}
              </div>
            </div>

            <div style={{ marginBottom: '60px' }}>
              <h3 style={{ fontSize: '1.3rem', color: '#ffffff', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ background: 'rgba(79, 70, 229, 0.2)', color: '#a78bfa', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>POST</span>
                /workflows
              </h3>
              <p style={{ color: '#a1a1aa', marginBottom: '15px', lineHeight: '1.6' }}>
                Submits a new workflow to the system. The payload is validated against the schema before being saved to the database and queued for execution. Supports dynamic cross-step data references via payload resolution (e.g., <code>$step_0.result</code>).
              </p>
              
              <h4 style={{ fontSize: '0.9rem', color: '#e4e4e7', marginBottom: '10px', marginTop: '20px' }}>Request Body</h4>
              <div style={{ background: 'rgba(10, 10, 12, 0.5)', padding: '15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', fontFamily: 'monospace', color: '#e4e4e7', overflowX: 'auto' }}>
                {`{
  "steps": [
    {
      "agentType": "SCRAPER",
      "payload": {
        "url": "https://example.com"
      }
    },
    {
      "agentType": "ANALYZER",
      "payload": {
        "data": "$step_0.result"
      }
    }
  ]
}`}
              </div>
              
              <h4 style={{ fontSize: '0.9rem', color: '#e4e4e7', marginBottom: '10px', marginTop: '20px' }}>Response (201 Created)</h4>
              <div style={{ background: 'rgba(10, 10, 12, 0.5)', padding: '15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', fontFamily: 'monospace', color: '#e4e4e7' }}>
                {`{
  "status": "WORKFLOW_QUEUED",
  "workflowId": "uuid-string-here"
}`}
              </div>
            </div>

            <h2 style={{ fontSize: '2rem', marginBottom: '20px', fontFamily: 'Outfit, sans-serif', color: '#ffffff', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>Engine A / Orchestrator</h2>
            <p style={{ color: '#a1a1aa', marginBottom: '25px', lineHeight: '1.7', fontSize: '1.05rem' }}>
              Engine A is a background worker responsible for orchestrating the workflow steps. It does not expose functional REST APIs for task manipulation; however, it exposes health checks.
            </p>
            <div style={{ marginBottom: '60px' }}>
              <h3 style={{ fontSize: '1.3rem', color: '#ffffff', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ background: 'rgba(0, 245, 212, 0.2)', color: '#00f5d4', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>GET</span>
                /health
              </h3>
              <p style={{ color: '#a1a1aa', marginBottom: '15px', lineHeight: '1.6' }}>Ensure the Orchestrator process is alive.</p>
              
              <div style={{ background: 'rgba(10, 10, 12, 0.5)', padding: '15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', fontFamily: 'monospace', color: '#e4e4e7' }}>
                {`{
  "status": "ok",
  "service": "orchestrator",
  "timestamp": "2026-06-25T07:15:00.000Z"
}`}
              </div>
            </div>

            <h2 style={{ fontSize: '2rem', marginBottom: '20px', fontFamily: 'Outfit, sans-serif', color: '#ffffff', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>Engine B / Worker</h2>
            <p style={{ color: '#a1a1aa', marginBottom: '25px', lineHeight: '1.7', fontSize: '1.05rem' }}>
              Engine B is a background worker responsible for executing individual tasks (e.g., scraping, analyzing). Like Engine A, it does not expose REST APIs for tasks.
            </p>
            <div style={{ marginBottom: '50px' }}>
              <h3 style={{ fontSize: '1.3rem', color: '#ffffff', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ background: 'rgba(0, 245, 212, 0.2)', color: '#00f5d4', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>GET</span>
                /health
              </h3>
              <p style={{ color: '#a1a1aa', marginBottom: '15px', lineHeight: '1.6' }}>Ensure the Worker process is alive.</p>
              
              <div style={{ background: 'rgba(10, 10, 12, 0.5)', padding: '15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', fontFamily: 'monospace', color: '#e4e4e7' }}>
                {`{
  "status": "ok",
  "service": "worker",
  "timestamp": "2026-06-25T07:15:00.000Z"
}`}
              </div>
            </div>
          </div>
        </main>

        {/* Right Sidebar */}
        <aside style={{
          width: '260px',
          flexShrink: 0,
          background: 'rgba(10, 10, 12, 0.3)',
          backdropFilter: 'blur(12px)',
          overflowY: 'auto',
          padding: '40px 24px',
          color: '#a1a1aa',
          borderLeft: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
          <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#e4e4e7', marginBottom: '20px', fontWeight: 600 }}>On this page</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.9rem', lineHeight: '2.2', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '16px' }}>
            <li style={{ color: '#00f5d4', cursor: 'pointer', fontWeight: 500, position: 'relative' }}>
              <span style={{ position: 'absolute', left: '-17px', top: 0, color: '#00f5d4' }}>|</span>
              Overview
            </li>
            <li style={{ cursor: 'pointer', transition: 'color 0.2s' }}>Gateway API</li>
            <li style={{ cursor: 'pointer', transition: 'color 0.2s' }}>Engine A / Orchestrator</li>
            <li style={{ cursor: 'pointer', transition: 'color 0.2s' }}>Engine B / Worker</li>
          </ul>
        </aside>

      </div>
    </div>
  );
};
