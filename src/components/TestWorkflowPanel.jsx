import React from 'react';

/**
 * TestWorkflowPanel Component
 * Compact left-side workflow panel grouping the field test process into 3 phases:
 * 1. TEST SETUP (Kit, Category, Sample Details, Kit Details)
 * 2. CAPTURE & ANALYSIS (Instructions, Camera Capture, Analysis)
 * 3. RESULT & RECORD (Result, Digital Record)
 *
 * Provides clear orientation without consuming excessive horizontal or vertical space.
 */
export default function TestWorkflowPanel({ currentPhase = 1, currentSubStep = 'setup' }) {
  const phases = [
    {
      id: 1,
      title: 'Test Setup',
      subSteps: [
        { key: 'kit', label: 'Test Kit Selection' },
        { key: 'category', label: 'Reagent Category' },
        { key: 'sample', label: 'Sample & Case ID' },
        { key: 'kitDetails', label: 'Batch & Lot Details' },
      ],
    },
    {
      id: 2,
      title: 'Capture & Analysis',
      subSteps: [
        { key: 'instructions', label: 'Lighting Guidelines' },
        { key: 'capture', label: 'Optical Camera Capture' },
        { key: 'analysis', label: 'Spectral ML Analysis' },
      ],
    },
    {
      id: 3,
      title: 'Result & Record',
      subSteps: [
        { key: 'result', label: 'Presumptive Result' },
        { key: 'record', label: 'Cryptographic Record' },
      ],
    },
  ];

  return (
    <aside className="test-workflow-panel">
      <div className="workflow-panel-header">
        <div className="workflow-panel-title">TEST WORKFLOW</div>
        <div className="workflow-panel-step-indicator">
          Phase {currentPhase} of 3
        </div>
      </div>

      <div className="workflow-phases-list">
        {phases.map((phase) => {
          const isPhaseDone = currentPhase > phase.id;
          const isPhaseActive = currentPhase === phase.id;
          const isPhasePending = currentPhase < phase.id;

          return (
            <div
              key={phase.id}
              className={`workflow-phase-group ${
                isPhaseActive ? 'active' : isPhaseDone ? 'completed' : 'pending'
              }`}
            >
              <div className="workflow-phase-header">
                <div className="workflow-phase-icon">
                  {isPhaseDone ? '✓' : isPhaseActive ? '→' : '○'}
                </div>
                <div className="workflow-phase-name">{phase.title}</div>
              </div>

              {/* Sub-steps */}
              <div className="workflow-substep-list">
                {phase.subSteps.map((step) => {
                  const isCurrent = currentSubStep === step.key;
                  let dotClass = 'pending';
                  if (isPhaseDone) {
                    dotClass = 'done';
                  } else if (isPhaseActive) {
                    if (isCurrent) {
                      dotClass = 'current';
                    }
                  }

                  return (
                    <div
                      key={step.key}
                      className={`workflow-substep-item ${isCurrent ? 'current' : ''}`}
                    >
                      <span className={`workflow-substep-dot ${dotClass}`} />
                      <span className="workflow-substep-label">{step.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="workflow-panel-footer">
        <div className="workflow-security-note">
          <span className="lock-icon">🔒</span>
          <span>Tamper-Evident SHA-256 Ledger Active</span>
        </div>
      </div>
    </aside>
  );
}
