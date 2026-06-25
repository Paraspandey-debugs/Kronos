import React from 'react';

export const Features: React.FC = () => {
  return (
    <>
      <div className="section-header">
        <div className="section-label">Core Capabilities</div>
        <h2>Engineered for scale.</h2>
      </div>

      <section className="grid">
        <div className="card">
          <div className="card-icon">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
          </div>
          <h3>Lightning Fast</h3>
          <p>Powered by Redis queues and BullMQ. Tasks are picked up and executed in milliseconds, with zero polling overhead.</p>
        </div>

        <div className="card">
          <div className="card-icon">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path></svg>
          </div>
          <h3>Dynamic Payloads</h3>
          <p>Reference outputs from previous steps dynamically using simple string variables like <code>$step_0.result</code>. Data flows seamlessly across agents.</p>
        </div>

        <div className="card">
          <div className="card-icon">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
          </div>
          <h3>Fault Tolerant</h3>
          <p>Automatic retries, graceful failovers, and persistent PostgreSQL state ensure your workflows never get lost, no matter the load.</p>
        </div>
      </section>
    </>
  );
};
