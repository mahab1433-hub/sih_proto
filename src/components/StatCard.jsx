import React from 'react';

/**
 * StatCard Component
 * High-impact forensic statistic card with customizable shapes:
 * - 'round': Precision Circular Radial Dial with centered icon sphere (Default)
 * - 'capsule': Ultra-rounded stadium pill geometry
 * - 'chamfer': Futuristic laboratory angled tech pod
 * Completely themed in authoritative Black with White.
 */
export default function StatCard({
  label,
  value,
  sub,
  icon,
  colorType = 'black',
  trend,
  trendPositive = true,
  progress = null,
  badge = null,
  shape = 'round',
}) {
  const colorThemes = {
    black: {
      accent: '#000000',
      dialColor: '#000000',
      gradient: 'linear-gradient(135deg, #18181B 0%, #000000 100%)',
      glow: 'rgba(0, 0, 0, 0.25)',
      lightBg: '#F4F4F5',
      borderHover: '#000000',
      trackColor: '#E4E4E7',
    },
    blue: {
      accent: '#000000',
      dialColor: '#000000',
      gradient: 'linear-gradient(135deg, #18181B 0%, #000000 100%)',
      glow: 'rgba(0, 0, 0, 0.25)',
      lightBg: '#F4F4F5',
      borderHover: '#000000',
      trackColor: '#E4E4E7',
    },
    navy: {
      accent: '#0F172A',
      dialColor: '#0F172A',
      gradient: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
      glow: 'rgba(15, 23, 42, 0.25)',
      lightBg: '#F1F5F9',
      borderHover: '#0F172A',
      trackColor: '#E2E8F0',
    },
    red: {
      accent: '#E11D48',
      dialColor: '#E11D48',
      gradient: 'linear-gradient(135deg, #E11D48 0%, #BE123C 100%)',
      glow: 'rgba(225, 29, 72, 0.25)',
      lightBg: 'rgba(225, 29, 72, 0.08)',
      borderHover: 'rgba(225, 29, 72, 0.4)',
      trackColor: 'rgba(225, 29, 72, 0.15)',
    },
    orange: {
      accent: '#D97706',
      dialColor: '#D97706',
      gradient: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
      glow: 'rgba(217, 119, 6, 0.25)',
      lightBg: 'rgba(217, 119, 6, 0.08)',
      borderHover: 'rgba(217, 119, 6, 0.4)',
      trackColor: 'rgba(217, 119, 6, 0.15)',
    },
    emerald: {
      accent: '#059669',
      dialColor: '#059669',
      gradient: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
      glow: 'rgba(5, 150, 105, 0.25)',
      lightBg: 'rgba(5, 150, 105, 0.08)',
      borderHover: 'rgba(5, 150, 105, 0.4)',
      trackColor: 'rgba(5, 150, 105, 0.15)',
    },
  };

  const theme = colorThemes[colorType] || colorThemes.black;

  // Circular Dial Math (Radius 27, viewBox 68x68, cx=34, cy=34)
  const radius = 27;
  const circumference = 2 * Math.PI * radius; // ~169.6
  const validProgress = progress !== null ? Math.min(100, Math.max(0, progress)) : 100;
  const strokeDashoffset = circumference - (circumference * validProgress) / 100;

  return (
    <div
      className={`stat-card-shape stat-card-${shape}`}
      style={{
        '--card-glow': theme.glow,
        '--card-border-hover': theme.borderHover,
        '--dial-accent': theme.dialColor,
      }}
    >
      {/* Top Meta Strip */}
      <div className="stat-shape-header">
        <span className="stat-shape-tag">
          {badge || 'FORENSIC TELEMETRY'}
        </span>
        {trend && (
          <span
            className={`stat-trend-pill ${
              trendPositive ? 'trend-positive' : 'trend-neutral'
            }`}
          >
            {trend}
          </span>
        )}
      </div>

      {/* Main Round Dial & Value Body */}
      <div className="stat-shape-body">
        {/* Round Dial Widget */}
        <div className="stat-round-dial-wrapper">
          <svg width="68" height="68" viewBox="0 0 68 68" className="stat-round-svg">
            {/* Background Dial Track */}
            <circle
              cx="34"
              cy="34"
              r={radius}
              fill="none"
              stroke={theme.trackColor}
              strokeWidth="5"
            />
            {/* Active Circular Dial Ring */}
            <circle
              cx="34"
              cy="34"
              r={radius}
              fill="none"
              stroke={theme.dialColor}
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              transform="rotate(-90 34 34)"
              style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}
            />
          </svg>

          {/* Centered Circular Icon Sphere */}
          <div
            className="stat-round-icon-sphere"
            style={{
              background: theme.gradient,
              boxShadow: `0 4px 12px ${theme.glow}`,
            }}
          >
            <span className="stat-sphere-emoji">{icon}</span>
          </div>

          {/* Micro Progress Badge */}
          {progress !== null && (
            <span className="stat-round-pct-tag mono">
              {progress}%
            </span>
          )}
        </div>

        {/* Text & Metrics Block */}
        <div className="stat-shape-info">
          <div className="stat-shape-value mono">{value}</div>
          <div className="stat-shape-label">{label}</div>
          <div className="stat-shape-sub">{sub}</div>
        </div>
      </div>

      {/* Footer Strip */}
      <div className="stat-shape-footer">
        <div className="stat-status-dot-row">
          <span className="stat-live-pulse-dot" style={{ backgroundColor: theme.dialColor }} />
          <span className="stat-status-text">
            {progress !== null ? `${progress}% Cycle Capacity` : 'Ledger Verified'}
          </span>
        </div>
        <span className="stat-shape-pill mono">SEC-OK</span>
      </div>
    </div>
  );
}
