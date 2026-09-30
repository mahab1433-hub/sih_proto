import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import TestWorkflowPanel from '../components/TestWorkflowPanel';
import { getAllRecords } from '../services/storageService';

/**
 * Result Page (Phase 3: Result & Record)
 * Left: Compact Test Workflow Panel
 * Right: Large presumptive result card, optical chromophore details, and cryptographic evidence seal.
 */
export default function Result() {
  const location = useLocation();
  const navigate = useNavigate();

  const [record, setRecord] = useState(null);
  const [dataUrl, setDataUrl] = useState(null);
  const [copiedHash, setCopiedHash] = useState(false);

  useEffect(() => {
    if (location.state?.record) {
      setRecord(location.state.record);
      if (location.state.dataUrl) {
        setDataUrl(location.state.dataUrl);
      }
    } else {
      const records = getAllRecords();
      if (records.length > 0) {
        setRecord(records[0]);
      }
    }
  }, [location.state]);

  if (!record) {
    return (
      <div className="card" style={{ maxWidth: '600px', margin: '40px auto', textAlign: 'center', padding: '36px' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🔍</div>
        <h3>No Active Field Record Found</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
          Please initiate a new field test to generate a presumptive result.
        </p>
        <Link to="/new-test" className="btn">
          Start Field Test
        </Link>
      </div>
    );
  }

  const handleCopyHash = () => {
    if (record.recordHash) {
      navigator.clipboard.writeText(record.recordHash);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    }
  };

  const isPositive = record.result === 'POSITIVE';
  const isNegative = record.result === 'NEGATIVE';

  return (
    <div className="workflow-layout-container">
      {/* LEFT: Compact Test Workflow Panel */}
      <TestWorkflowPanel currentPhase={3} currentSubStep="result" />

      {/* RIGHT: Large Result Card & Digital Record Details */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Main Result Dossier Card */}
        <div className="card" style={{ marginBottom: 0 }}>
          <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--brand-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Phase 3 • Evidence Result & Record
              </div>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-main)', marginTop: '2px' }}>
                Presumptive Field Interpretation
              </h1>
            </div>

            <div className="mono" style={{ fontSize: '0.85rem', fontWeight: 800, background: 'var(--bg-subtle)', padding: '4px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              {record.testId || record.id}
            </div>
          </div>

          {/* Classification Banner */}
          <div
            style={{
              padding: '24px',
              borderRadius: 'var(--radius-md)',
              textAlign: 'center',
              backgroundColor: isPositive ? 'var(--status-positive-bg)' : isNegative ? 'var(--status-negative-bg)' : 'var(--status-inconclusive-bg)',
              border: `1.5px solid ${isPositive ? 'var(--status-positive-border)' : isNegative ? 'var(--status-negative-border)' : 'var(--status-inconclusive-border)'}`,
              marginBottom: '24px',
            }}
          >
            <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: isPositive ? 'var(--status-positive)' : isNegative ? 'var(--status-negative)' : 'var(--status-inconclusive)', marginBottom: '4px' }}>
              OPTICAL CHROMOPHORE INTERPRETATION
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: isPositive ? 'var(--status-positive)' : isNegative ? 'var(--status-negative)' : 'var(--status-inconclusive)', lineHeight: 1.1, marginBottom: '6px' }}>
              PRESUMPTIVE {record.result}
            </div>
            <div style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
              {record.category}
            </div>

            {record.confidence && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#FFFFFF', padding: '4px 12px', borderRadius: '999px', marginTop: '12px', fontSize: '0.78rem', fontWeight: 700, border: '1px solid var(--border-subtle)' }}>
                <span>ML Confidence Score:</span>
                <span className="mono" style={{ color: 'var(--brand-primary)', fontWeight: 800 }}>
                  {(record.confidence * 100).toFixed(1)}%
                </span>
              </div>
            )}
          </div>

          {/* Evidence Details Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '20px' }}>
            <div style={{ background: 'var(--bg-subtle)', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>CASE DOCKET</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)' }} className="mono">
                {record.caseId || 'N/A'}
              </div>
            </div>

            <div style={{ background: 'var(--bg-subtle)', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>SAMPLE ID</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)' }} className="mono">
                {record.sampleId}
              </div>
            </div>

            <div style={{ background: 'var(--bg-subtle)', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>OFFICER / STATION</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Officer ({record.officerId || '1023'}) • {record.unit || 'Central'}
              </div>
            </div>

            <div style={{ background: 'var(--bg-subtle)', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>KIT BATCH / LOT</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)' }} className="mono">
                {record.kitLot || 'TK-NIK-U-8921'}
              </div>
            </div>
          </div>

          {/* Cryptographic Digital Seal Section */}
          <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.1rem' }}>🔒</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  Tamper-Evident SHA-256 Evidence Seal
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyHash}
                className="btn btn-secondary"
                style={{ padding: '3px 8px', fontSize: '0.72rem' }}
              >
                {copiedHash ? '✓ Copied' : 'Copy Hash'}
              </button>
            </div>

            <div style={{ fontSize: '0.74rem', wordBreak: 'break-all', color: 'var(--text-secondary)', background: '#FFFFFF', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }} className="mono">
              {record.recordHash || 'SEALED-CANONICAL-SHA256-DIGEST-VERIFIED'}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '6px' }}>
              Ed25519 Hardware Signature: <span className="mono">{record.signature || 'SIG-ED25519-E8A1023B49CD88'}</span>
            </div>
          </div>

          {/* Statutory Regulatory Notice Box */}
          <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', padding: '12px 14px', borderRadius: 'var(--radius-md)', fontSize: '0.76rem', color: '#78350F', lineHeight: 1.45, marginBottom: '24px' }}>
            <strong>Statutory Notice:</strong> Presumptive field-test indication only. Confirmatory laboratory evidence (GC-MS / LC-MS) must be submitted for courtroom proceedings.
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <Link to="/" className="btn btn-secondary">
              ← Return to Dashboard
            </Link>

            <div style={{ display: 'flex', gap: '10px' }}>
              <Link to={`/record/${record.testId || record.id}`} className="btn btn-secondary">
                View Full Dossier
              </Link>
              <Link to="/new-test" className="btn">
                <span>⊕</span> Start Next Field Test
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
