import React from 'react';
import { DAGCanvas } from './DAGCanvas';

export const Hero: React.FC = () => {
  return (
    <div className="hero-container">
      <DAGCanvas />
      
      <section className="hero-content">
        <div className="section-label">Distributed Orchestration</div>
        <h1 className="hero-title">The Ultimate<br />Distributed Engine.</h1>
        <p className="hero-subtitle">Seamlessly orchestrate complex workflows across infinite nodes. Built for scale, speed, and absolute reliability with Redis, PostgreSQL, and BullMQ.</p>
        <div className="hero-actions">
          <button className="btn btn-primary" style={{ padding: '0.75rem 1.5rem' }}>Start Building Free</button>
          <button className="btn btn-outline" style={{ padding: '0.75rem 1.5rem' }}>View Architecture</button>
        </div>
      </section>
    </div>
  );
};
