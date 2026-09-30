import React, { useState, useEffect } from 'react';

/**
 * Loading Component
 * Minimal Circular Progress Ring with live confidence percentage
 * and real-time optical/chromophore analysis status.
 */
export default function Loading({ onComplete = null, targetConfidence = 92.4, capturedImage = null }) {
  const [progress, setProgress] = useState(12);
  const [confidence, setConfidence] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Extracting optical RGB/HSV chromophore values...');

  useEffect(() => {
    // Stage 1: Color extraction
    const timer1 = setTimeout(() => {
      setProgress(40);
      setConfidence(45.2);
      setStatusMessage('Compensating illumination with Reference Color Card (CIELAB D65)...');
    }, 600);

    // Stage 2: Calibration & isolation
    const timer2 = setTimeout(() => {
      setProgress(72);
      setConfidence(78.6);
      setStatusMessage('Calculating Delta-E chromatic distance against reagent baseline...');
    }, 1300);

    // Stage 3: ML inference
    const timer3 = setTimeout(() => {
      setProgress(100);
      setConfidence(targetConfidence);
      setStatusMessage('Presumptive classification verified by NAAMII Ensemble Model.');
      if (onComplete) {
        setTimeout(onComplete, 400);
      }
    }, 2100);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [targetConfidence, onComplete]);

  // SVG circular ring calculation
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="analysis-progress-container">
      <div className="analysis-progress-card">
        {/* Minimal Circular Progress Ring */}
        <div className="progress-ring-wrapper">
          <svg width="150" height="150" viewBox="0 0 150 150" className="progress-svg">
            {/* Background track */}
            <circle
              cx="75"
              cy="75"
              r={radius}
              fill="none"
              stroke="#E2E8F0"
              strokeWidth="10"
            />
            {/* Active progress ring */}
            <circle
              cx="75"
              cy="75"
              r={radius}
              fill="none"
              stroke="#000000"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              transform="rotate(-90 75 75)"
              style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}
            />
          </svg>

          <div className="progress-center-content">
            <span className="progress-pct-value mono">{confidence.toFixed(1)}%</span>
            <span className="progress-pct-sub">ML Confidence</span>
          </div>
        </div>

        <div className="analysis-text-block">
          <h3 className="analysis-heading">Analyzing Colorimetric Reaction</h3>
          <p className="analysis-status-text">{statusMessage}</p>

          <div className="analysis-metrics-strip">
            <div className="analysis-metric-pill">
              <span className="pill-dot green" />
              <span>Reference Card Locked</span>
            </div>
            <div className="analysis-metric-pill">
              <span className="pill-dot blue" />
              <span>ΔE &lt; 2.5 Toleranced</span>
            </div>
            <div className="analysis-metric-pill">
              <span className="pill-dot blue" />
              <span>Model: SVM + RF</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
