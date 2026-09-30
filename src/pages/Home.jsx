import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllRecords, getRecordStatistics } from '../services/storageService';

/**
 * Home Page
 * Main field-testing dashboard displaying analytics, recent activity, and "+ Start Test".
 */
export default function Home() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, positive: 0, negative: 0, inconclusive: 0 });
  const [recentRecords, setRecentRecords] = useState([]);

  useEffect(() => {
    setStats(getRecordStatistics());
    const records = getAllRecords();
    setRecentRecords(records.slice(0, 4));
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Top Welcome Card */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: '4px' }}>
          COLORIMETRIC FIELD-TEST
        </h1>
        <p style={{ fontSize: '0.85rem' }}>
          Automated Computer-Vision Interpretation & Tamper-Evident Recording
        </p>
      </div>

      {/* Primary Action Button: + START TEST */}
      <Link
        to="/test"
        className="btn"
        style={{
          height: '60px',
          fontSize: '1.1rem',
          fontWeight: 900,
          marginBottom: '24px',
          boxShadow: 'var(--shadow-primary)',
        }}
      >
        <span style={{ fontSize: '1.4rem', marginRight: '4px' }}>+</span> START NEW TEST
      </Link>

      {/* Analytics Statistics Row */}
      <div className="card-title">Cumulative Field Statistics</div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '8px',
          marginBottom: '24px',
        }}
      >
        <div
          className="card"
          style={{
            padding: '12px 8px',
            textAlign: 'center',
            borderTop: '3px solid var(--primary-light)',
            marginBottom: 0,
          }}
        >
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)' }}>TOTAL</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--primary-light)', marginTop: '2px' }}>
            {stats.total}
          </div>
        </div>

        <div
          className="card"
          style={{
            padding: '12px 8px',
            textAlign: 'center',
            borderTop: '3px solid var(--positive)',
            marginBottom: 0,
          }}
        >
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)' }}>POSITIVE</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--positive)', marginTop: '2px' }}>
            {stats.positive}
          </div>
        </div>

        <div
          className="card"
          style={{
            padding: '12px 8px',
            textAlign: 'center',
            borderTop: '3px solid var(--negative)',
            marginBottom: 0,
          }}
        >
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)' }}>NEGATIVE</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--negative)', marginTop: '2px' }}>
            {stats.negative}
          </div>
        </div>

        <div
          className="card"
          style={{
            padding: '12px 8px',
            textAlign: 'center',
            borderTop: '3px solid var(--inconclusive)',
            marginBottom: 0,
          }}
        >
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)' }}>INCONCL.</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--inconclusive)', marginTop: '2px' }}>
            {stats.inconclusive}
          </div>
        </div>
      </div>

      {/* Recent Test Records */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ fontSize: '0.95rem', fontWeight: 800 }}>Recent Audit Records</div>
        <Link to="/history" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-light)' }}>
          View All History →
        </Link>
      </div>

      {recentRecords.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '36px 20px' }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🔬</div>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px' }}>No field tests recorded yet</div>
          <p style={{ fontSize: '0.8rem' }}>Tap "+ START NEW TEST" above to perform an optical test kit capture.</p>
        </div>
      ) : (
        recentRecords.map((r) => (
          <div
            key={r.testId}
            className="card"
            style={{ cursor: 'pointer', padding: '14px 16px' }}
            onClick={() => navigate(`/record/${r.testId}`)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>{r.testId}</span>
              <span className={`badge badge-${r.result.toLowerCase()}`}>{r.result}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <span>Kit: {r.testKitId} • Sample: {r.sampleId}</span>
              <span style={{ color: 'var(--verified)', fontWeight: 700 }}>Verified ✓</span>
            </div>
          </div>
        ))
      )}

      {/* Regulatory Limitation Banner */}
      <div className="regulatory-notice">
        <strong>REGULATORY LIMITATION NOTICE</strong>
        This software performs optical interpretation of presumptive field-test reactions. It does not perform chemical testing and does not replace confirmatory laboratory testing.
      </div>
    </div>
  );
}
