import React, { useState, useEffect } from 'react';
import { checkModelHealth } from '../services/api';

/**
 * Header Component
 * Provides top bar on mobile and displays real-time ML Backend connection status.
 */
export default function Header({ onToggleSidebar }) {
  const [modelStatus, setModelStatus] = useState({ connected: false, checking: true });

  useEffect(() => {
    checkModelHealth().then((status) => {
      setModelStatus({ ...status, checking: false });
    });

    const interval = setInterval(() => {
      checkModelHealth().then(setModelStatus);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <header className="mobile-topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          type="button"
          onClick={onToggleSidebar}
          style={{
            background: 'none',
            border: 'none',
            color: '#FFFFFF',
            fontSize: '1.4rem',
            cursor: 'pointer',
            padding: '4px',
          }}
          aria-label="Toggle navigation menu"
        >
          ☰
        </button>
        <div>
          <div style={{ fontWeight: 800, fontSize: '0.95rem', letterSpacing: '-0.01em' }}>
            COLORIMETRIC FIELD
          </div>
          <div style={{ fontSize: '0.65rem', color: '#94A3B8' }}>
            Officer Station (1023)
          </div>
        </div>
      </div>

      {/* ML Model Health Status Pill */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px',
          borderRadius: '999px',
          fontSize: '0.68rem',
          fontWeight: 700,
          backgroundColor: modelStatus.connected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          color: modelStatus.connected ? '#10B981' : '#EF4444',
          border: `1px solid ${modelStatus.connected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
        }}
      >
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: modelStatus.connected ? '#10B981' : '#EF4444',
          }}
        />
        {modelStatus.connected ? 'ML Online' : 'ML Offline'}
      </div>
    </header>
  );
}
