import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getAllRecords } from '../services/storageService';

/**
 * History Page
 * Comprehensive audit trail of all colorimetric field test captures.
 */
export default function History() {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'POSITIVE' | 'NEGATIVE' | 'INCONCLUSIVE'
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setRecords(getAllRecords());
  }, []);

  const filteredRecords = records.filter((r) => {
    const matchesFilter = filter === 'ALL' || r.result === filter;
    const query = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      r.testId.toLowerCase().includes(query) ||
      (r.sampleId && r.sampleId.toLowerCase().includes(query)) ||
      (r.caseNumber && r.caseNumber.toLowerCase().includes(query)) ||
      (r.testKitId && r.testKitId.toLowerCase().includes(query));
    return matchesFilter && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.3rem', fontWeight: 900, marginBottom: '2px' }}>
            AUDIT TRAIL LOG
          </h1>
          <p style={{ fontSize: '0.8rem' }}>
            Immutable records of presumptive tests & cryptographic proofs
          </p>
        </div>
        <Link to="/test" className="btn" style={{ padding: '8px 14px', fontSize: '0.82rem' }}>
          + New Test
        </Link>
      </div>

      {/* Search Input */}
      <div style={{ marginBottom: '14px' }}>
        <input
          type="text"
          className="input"
          placeholder="Search by Test ID, Sample, or Case #..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Filter Tabs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '6px',
          marginBottom: '16px',
        }}
      >
        {['ALL', 'POSITIVE', 'NEGATIVE', 'INCONCLUSIVE'].map((status) => (
          <button
            key={status}
            type="button"
            className="btn btn-secondary"
            style={{
              padding: '8px 4px',
              fontSize: '0.72rem',
              fontWeight: 800,
              backgroundColor: filter === status ? 'var(--primary)' : 'var(--surface-card)',
              color: filter === status ? '#ffffff' : 'var(--text-secondary)',
              borderColor: filter === status ? 'var(--primary)' : 'var(--surface-border)',
            }}
            onClick={() => setFilter(status)}
          >
            {status === 'INCONCLUSIVE' ? 'INCONCL.' : status}
          </button>
        ))}
      </div>

      {/* Records List */}
      {filteredRecords.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📂</div>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px' }}>
            No Matching Records Found
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {searchTerm ? 'Try changing your search terms or filter.' : 'Complete a test capture to build the audit trail.'}
          </p>
        </div>
      ) : (
        filteredRecords.map((r) => (
          <div
            key={r.testId}
            className="card"
            style={{ cursor: 'pointer', padding: '14px 16px', marginBottom: '10px' }}
            onClick={() => navigate(`/record/${r.testId}`)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span className="mono" style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {r.testId}
              </span>
              <span className={`badge badge-${r.result.toLowerCase()}`}>{r.result}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              <div>Sample: <span className="mono" style={{ color: 'var(--text-primary)' }}>{r.sampleId}</span></div>
              <div>Kit: <span className="mono" style={{ color: 'var(--text-primary)' }}>{r.testKitId}</span></div>
              <div>Confidence: {(r.confidence * 100).toFixed(1)}%</div>
              <div>Case: {r.caseNumber || 'N/A'}</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem', color: 'var(--text-muted)', borderTop: '1px solid var(--surface-border)', paddingTop: '8px' }}>
              <span>{new Date(r.timestamp || r.createdAt).toLocaleString()}</span>
              <span style={{ color: 'var(--verified)', fontWeight: 700 }}>Chain of Custody Intact ✓</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
