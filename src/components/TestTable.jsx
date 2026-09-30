import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * TestTable Component
 * Forensic audit table with cryptographic hash chips, result badges,
 * and seamless navigation to evidence record details.
 */
export default function TestTable({ records = [], limit = null }) {
  const navigate = useNavigate();
  const [copiedId, setCopiedId] = useState(null);
  const displayRecords = limit ? records.slice(0, limit) : records;

  const handleCopyHash = (e, hash, id) => {
    e.stopPropagation();
    navigator.clipboard.writeText(hash);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getResultBadge = (result) => {
    switch (result) {
      case 'POSITIVE':
        return (
          <span className="badge badge-positive">
            <span className="badge-dot red-dot" /> POSITIVE
          </span>
        );
      case 'NEGATIVE':
        return (
          <span className="badge badge-negative">
            <span className="badge-dot green-dot" /> NEGATIVE
          </span>
        );
      case 'INCONCLUSIVE':
        return (
          <span className="badge badge-inconclusive">
            <span className="badge-dot amber-dot" /> INCONCLUSIVE
          </span>
        );
      default:
        return <span className="badge">{result}</span>;
    }
  };

  if (displayRecords.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>📋</div>
        <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)' }}>
          No field test records found
        </div>
        <p style={{ fontSize: '0.82rem', marginTop: '4px' }}>
          Capture and authenticate a test kit to generate a verifiable evidence record.
        </p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>RECORD ID</th>
            <th>CASE / SAMPLE ID</th>
            <th>REAGENT ASSAY</th>
            <th>PRESUMPTIVE RESULT</th>
            <th>EVIDENCE SEAL (SHA-256)</th>
            <th>DATE & TIME</th>
            <th>INTEGRITY</th>
            <th style={{ textAlign: 'right' }}>ACTION</th>
          </tr>
        </thead>
        <tbody>
          {displayRecords.map((r) => {
            const recordId = r.id || r.testId;
            const shortHash = r.recordHash
              ? `${r.recordHash.slice(0, 6)}...${r.recordHash.slice(-4)}`
              : 'SEALED';

            return (
              <tr
                key={recordId}
                onClick={() => navigate(`/record/${recordId}`)}
                style={{ cursor: 'pointer' }}
                className="table-row-interactive"
              >
                <td style={{ fontWeight: 800 }} className="mono">
                  <span className="record-id-chip">{recordId}</span>
                </td>
                <td>
                  <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                    {r.caseId || r.caseNumber || 'N/A'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }} className="mono">
                    {r.sampleId}
                  </div>
                </td>
                <td>
                  <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                    {r.category || r.reagentType || 'Presumptive Assay'}
                  </div>
                  {r.confidence && (
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }} className="mono">
                      Confidence: {(r.confidence * 100).toFixed(1)}%
                    </div>
                  )}
                </td>
                <td>{getResultBadge(r.result)}</td>
                <td>
                  {r.recordHash ? (
                    <button
                      type="button"
                      onClick={(e) => handleCopyHash(e, r.recordHash, recordId)}
                      className="hash-chip-btn mono"
                      title="Click to copy full SHA-256 hash"
                    >
                      <span>🔒 {shortHash}</span>
                      <span className="hash-copy-tag">
                        {copiedId === recordId ? 'Copied!' : 'Copy'}
                      </span>
                    </button>
                  ) : (
                    <span className="mono" style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                      Pending Seal
                    </span>
                  )}
                </td>
                <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {r.date || (r.timestamp ? new Date(r.timestamp).toLocaleString() : 'N/A')}
                </td>
                <td>
                  <span className="badge badge-verified">
                    <span>✓</span> {r.status || 'Verified'}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/record/${recordId}`);
                    }}
                    className="action-btn-inspect"
                  >
                    <span>👁️</span> Inspect
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
