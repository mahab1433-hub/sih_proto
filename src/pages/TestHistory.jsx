import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import TestTable from '../components/TestTable';
import { getAllRecords } from '../services/storageService';

/**
 * TestHistory Page
 * Searchable, filterable audit log of all recorded field tests.
 */
export default function TestHistory() {
  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterResult, setFilterResult] = useState('ALL');

  useEffect(() => {
    setRecords(getAllRecords());
  }, []);

  const filteredRecords = records.filter((r) => {
    const matchesFilter = filterResult === 'ALL' || r.result === filterResult;
    const query = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      (r.testId && r.testId.toLowerCase().includes(query)) ||
      (r.caseId && r.caseId.toLowerCase().includes(query)) ||
      (r.sampleId && r.sampleId.toLowerCase().includes(query)) ||
      (r.category && r.category.toLowerCase().includes(query)) ||
      (r.officerId && r.officerId.toString().includes(query));

    return matchesFilter && matchesSearch;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '4px' }}>
            Field Test Audit History
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Search, filter, and inspect immutable chain-of-custody presumptive test records.
          </p>
        </div>

        <Link to="/new-test" className="btn" style={{ padding: '10px 20px', fontSize: '0.88rem' }}>
          + New Test
        </Link>
      </div>

      {/* Filter and Search Bar Card */}
      <div className="card" style={{ padding: '18px 24px', marginBottom: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', alignItems: 'center' }}>
          <div>
            <label className="form-label">SEARCH RECORDS</label>
            <input
              type="text"
              className="form-input"
              placeholder="Search by Record ID, Case ID, Sample ID, or Category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div>
            <label className="form-label">FILTER BY RESULT</label>
            <select
              className="form-select"
              value={filterResult}
              onChange={(e) => setFilterResult(e.target.value)}
            >
              <option value="ALL">All Results ({records.length})</option>
              <option value="POSITIVE">Presumptive Positive</option>
              <option value="NEGATIVE">Presumptive Negative</option>
              <option value="INCONCLUSIVE">Inconclusive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Showing {filteredRecords.length} of {records.length} records
          </div>
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setFilterResult('ALL');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Clear filters
            </button>
          )}
        </div>

        <TestTable records={filteredRecords} />
      </div>
    </div>
  );
}
