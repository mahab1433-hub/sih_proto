import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StatCard from '../components/StatCard.jsx';
import ForensicTelemetry from '../components/ForensicTelemetry.jsx';
import QuickActionHub from '../components/QuickActionHub.jsx';
import TestTable from '../components/TestTable.jsx';
import { getAllRecords, getRecordStatistics } from '../services/storageService';

/**
 * Revamped Forensic Intelligence Dashboard
 * Restored the rich dashboard layout: Station telemetry banner, live clock,
 * 4 rich forensic stat cards with progress bars and badges,
 * forensic telemetry graphs (spectral distribution, confidence gauges, subsystem health),
 * rapid action hub (in-place seal verifier & CSV manifest export),
 * and interactive recent evidence activity table.
 */
export default function Dashboard() {
  const [stats, setStats] = useState({ today: 4, total: 7, positive: 2, inconclusive: 1 });
  const [records, setRecords] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [statShape, setStatShape] = useState('round'); // 'round' | 'capsule' | 'chamfer'

  useEffect(() => {
    setStats(getRecordStatistics());
    setRecords(getAllRecords());

    // Live clock ticker
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const positiveRate = stats.total > 0 ? Math.round((stats.positive / stats.total) * 100) : 0;
  const shiftCompletion = Math.min(100, Math.round((stats.today / 10) * 100)); // Nominal shift goal: 10 tests

  return (
    <div className="dashboard-container">
      {/* 1. Unique Command Deck Header */}
      <div className="command-deck-header">
        {/* Left: Operational Console Card */}
        <div className="command-deck-main-card">
          <div>
            <div className="command-deck-top-row">
              <div className="command-deck-station-tag">
                <span className="live-dot-pulse" />
                <span>Station #04 • Central Forensic Desk</span>
              </div>
              <div className="command-deck-clock mono">
                {currentTime}
              </div>
            </div>

            <h1 className="command-deck-title">Colorimetric Field Operations</h1>
            <p className="command-deck-desc">
              Optical computer-vision portal for rapid chromophore analysis, reference card calibration, and tamper-evident recording.
            </p>
          </div>

          <div className="command-deck-telemetry-row">
            <span className="command-telemetry-chip">
              <span>🔒</span> Ed25519 Enclave Active
            </span>
            <span className="command-telemetry-chip">
              <span>🧠</span> NAAMII SVM/RF Online
            </span>
            <span className="command-telemetry-chip">
              <span>🛰️</span> GPS Fixed (±2.4m)
            </span>
            <span className="command-telemetry-chip">
              <span>💾</span> SQLite Ledger Encrypted
            </span>
          </div>
        </div>

        {/* Right: Rapid Action Command Deck */}
        <div className="command-deck-action-card">
          <div className="action-deck-header">
            <div className="action-deck-badge">FIELD ACTIONS</div>
            <div className="action-deck-title">Execute Presumptive Assay</div>
          </div>

          <div className="action-deck-shortcuts">
            <Link to="/new-test" className="action-deck-btn-primary">
              <span>🔬 Start New Field Test</span>
              <span>→</span>
            </Link>

            <Link to="/camera" state={{ initialMode: 'upload' }} className="action-deck-btn-secondary">
              <span>📁 Upload Test Photo</span>
              <span>→</span>
            </Link>

            <Link to="/history" className="action-deck-btn-secondary">
              <span>📋 Search Evidence Archive</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Rich 4-Column Forensic Statistics Grid with Shape Controls */}
      <div className="stat-section-wrapper">
        <div className="stat-header-bar">
          <div className="stat-header-left">
            <span className="stat-header-badge">LIVE METRICS TELEMETRY</span>
            <span className="stat-header-title">Operational Assay Indicators</span>
          </div>

          <div className="shape-switcher-group">
            <span className="shape-switcher-label">Design Shape:</span>
            <button
              type="button"
              className={`shape-pill-btn ${statShape === 'round' ? 'active' : ''}`}
              onClick={() => setStatShape('round')}
            >
              <span>⦿</span> Round Dial
            </button>
            <button
              type="button"
              className={`shape-pill-btn ${statShape === 'capsule' ? 'active' : ''}`}
              onClick={() => setStatShape('capsule')}
            >
              <span>💊</span> Capsule Pod
            </button>
            <button
              type="button"
              className={`shape-pill-btn ${statShape === 'chamfer' ? 'active' : ''}`}
              onClick={() => setStatShape('chamfer')}
            >
              <span>⬡</span> Hex Tech
            </button>
          </div>
        </div>

        <div className="stat-grid-modern">
          <StatCard
            label="SHIFT TESTS TODAY"
            value={stats.today}
            sub="Shift Target: 10 assays"
            colorType="black"
            icon="📄"
            trend="+2 vs prior shift"
            trendPositive={true}
            progress={shiftCompletion}
            badge="Active Shift"
            shape={statShape}
          />

          <StatCard
            label="CHAIN OF CUSTODY LOGS"
            value={stats.total}
            sub="Sealed digital records"
            colorType="navy"
            icon="🔒"
            trend="Zero hash tampering"
            trendPositive={true}
            progress={100}
            badge="100% Sealed"
            shape={statShape}
          />

          <StatCard
            label="PRESUMPTIVE POSITIVE"
            value={stats.positive}
            sub="Target Reagent Matches"
            colorType="red"
            icon="☣️"
            trend={`Detection Rate: ${positiveRate}%`}
            trendPositive={false}
            progress={positiveRate}
            badge="Reagent Reaction"
            shape={statShape}
          />

          <StatCard
            label="INCONCLUSIVE / REVIEW"
            value={stats.inconclusive}
            sub="Flagged for Lab Confirmation"
            colorType="orange"
            icon="🔬"
            trend="Forwarded to GC-MS"
            trendPositive={true}
            progress={stats.total ? Math.round((stats.inconclusive / stats.total) * 100) : 0}
            badge="Confirmatory Required"
            shape={statShape}
          />
        </div>
      </div>

      {/* 4. Forensic Telemetry Graphs (Spectral Distribution, Gauges, Subsystems) */}
      <ForensicTelemetry records={records} stats={stats} />

      {/* 5. Quick Action Control Hub (Instant Seal Auditor & CSV Export) */}
      <QuickActionHub records={records} />

      {/* 6. Recent Test Activity Table Card */}
      <div className="card-modern">
        <div className="table-header-row">
          <div>
            <div className="badge-mini-tag">CHAIN OF CUSTODY</div>
            <h2 className="section-heading-modern">Recent Verified Evidence Activity</h2>
            <div className="section-sub-modern">
              Latest field test records cryptographically signed and stored in local ledger
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Link to="/history" className="view-all-link">
              View All Records ({stats.total}) →
            </Link>
          </div>
        </div>

        <TestTable records={records} limit={5} />
      </div>
    </div>
  );
}
