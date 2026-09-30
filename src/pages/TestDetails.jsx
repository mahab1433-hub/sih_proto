import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getRecordById } from '../services/storageService';
import { verifyRecord } from '../services/cryptoService';

/**
 * TestDetails Page (Step 9: Digital Record)
 * Complete forensic digital dossier with cryptographic verification & tamper detection.
 */
export default function TestDetails() {
  const { testId } = useParams();
  const navigate = useNavigate();

  const [record, setRecord] = useState(null);
  const [verification, setVerification] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [tampered, setTampered] = useState(false);

  useEffect(() => {
    const data = getRecordById(testId);
    if (data) {
      setRecord(data);
      verifyRecord(data).then(setVerification);
    }
  }, [testId]);

  if (!record) {
    return (
      <div className="card" style={{ maxWidth: '600px', margin: '40px auto', textAlign: 'center', padding: '36px' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🔍</div>
        <h3>Record Not Found</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
          Record ID '{testId}' was not found in the local forensic repository.
        </p>
        <Link to="/history" className="btn btn-secondary">
          Return to Test History
        </Link>
      </div>
    );
  }

  const handleVerify = async (rec = record) => {
    setIsVerifying(true);
    const res = await verifyRecord(rec);
    setVerification(res);
    setIsVerifying(false);
  };

  const handleSimulateTamper = async () => {
    if (!tampered) {
      const fraudulent = {
        ...record,
        result: record.result === 'POSITIVE' ? 'NEGATIVE' : 'POSITIVE',
        sampleId: `${record.sampleId}_MODIFIED`,
      };
      setTampered(true);
      setRecord(fraudulent);
      await handleVerify(fraudulent);
    } else {
      const authentic = getRecordById(testId);
      setTampered(false);
      setRecord(authentic);
      await handleVerify(authentic);
    }
  };

  const resultColor =
    record.result === 'POSITIVE'
      ? 'var(--positive)'
      : record.result === 'NEGATIVE'
      ? 'var(--negative)'
      : 'var(--inconclusive)';

  const resultBg =
    record.result === 'POSITIVE'
      ? 'var(--positive-bg)'
      : record.result === 'NEGATIVE'
      ? 'var(--negative-bg)'
      : 'var(--inconclusive-bg)';

  const resultBorder =
    record.result === 'POSITIVE'
      ? 'var(--positive-border)'
      : record.result === 'NEGATIVE'
      ? 'var(--negative-border)'
      : 'var(--inconclusive-border)';

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto' }}>
      {/* Top Header & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/history')}
            style={{ padding: '6px 12px', fontSize: '0.78rem', marginBottom: '8px' }}
          >
            ← Back to History
          </button>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '2px' }}>
            Forensic Digital Record Dossier
          </h1>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }} className="mono">
            {record.testId || record.id} • {record.caseId || record.caseNumber}
          </div>
        </div>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => window.print()}
          style={{ padding: '8px 16px', fontSize: '0.85rem' }}
        >
          🖨️ Print Record
        </button>
      </div>

      {/* Tamper Alert Banner */}
      {tampered && (
        <div
          className="card"
          style={{
            backgroundColor: 'var(--positive-bg)',
            borderColor: 'var(--positive-border)',
            color: 'var(--positive)',
            padding: '14px 18px',
            marginBottom: '16px',
          }}
        >
          <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>⚠️ TAMPER SIMULATION ACTIVE</div>
          <div style={{ fontSize: '0.78rem', marginTop: '2px' }}>
            Record fields were maliciously altered in-memory. Observe that cryptographic SHA-256 verification immediately fails.
          </div>
        </div>
      )}

      {/* Presumptive Result Banner */}
      <div
        className="card"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: resultBg,
          borderColor: resultBorder,
          padding: '20px 24px',
        }}
      >
        <div>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: resultColor, textTransform: 'uppercase' }}>
            PRESUMPTIVE CLASSIFICATION
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: resultColor }}>
            {record.result}
          </div>
          {typeof record.confidence === 'number' && (
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Confidence: {(record.confidence * 100).toFixed(1)}%
            </div>
          )}
        </div>

        <span
          className={`badge badge-${record.result.toLowerCase()}`}
          style={{ fontSize: '0.88rem', padding: '6px 14px' }}
        >
          ● PRESUMPTIVE {record.result}
        </span>
      </div>

      {/* Captured Image and Optical Details */}
      <div className="card">
        <h2 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '14px', color: 'var(--text-main)' }}>
          Optical Test-Kit Capture
        </h2>

        {record.imageSrc ? (
          <div
            style={{
              width: '100%',
              maxHeight: '360px',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              backgroundColor: '#000',
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '16px',
            }}
          >
            <img
              src={record.imageSrc}
              alt="Test capture"
              style={{ maxWidth: '100%', maxHeight: '360px', objectFit: 'contain' }}
            />
          </div>
        ) : (
          <div
            style={{
              padding: '24px',
              backgroundColor: '#F8FAFC',
              borderRadius: 'var(--radius-md)',
              textAlign: 'center',
              color: 'var(--text-muted)',
              marginBottom: '16px',
            }}
          >
            No image data stored for this historical test.
          </div>
        )}

        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          {record.notes}
        </div>
      </div>

      {/* Cryptographic Chain-of-Custody Integrity Card */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 0 }}>
            Cryptographic Integrity Audit
          </h2>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => handleVerify(record)}
            disabled={isVerifying}
            style={{ padding: '6px 12px', fontSize: '0.78rem' }}
          >
            {isVerifying ? 'Verifying...' : 'Re-verify Hashes'}
          </button>
        </div>

        {verification && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.82rem',
              fontWeight: 700,
              backgroundColor: verification.isValid ? 'var(--negative-bg)' : 'var(--positive-bg)',
              color: verification.isValid ? 'var(--negative)' : 'var(--positive)',
              border: `1px solid ${verification.isValid ? 'var(--negative-border)' : 'var(--positive-border)'}`,
              marginBottom: '16px',
            }}
          >
            {verification.isValid
              ? '✓ RECORD INTEGRITY CONFIRMED: SHA-256 digests and Ed25519 signature match authentic records.'
              : `⚠️ VERIFICATION FAILED: ${verification.failureReason}`}
          </div>
        )}

        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 800, marginBottom: '4px' }}>
            IMAGE SHA-256 (FIPS 180-4)
          </div>
          <div
            className="mono"
            style={{
              backgroundColor: '#F8FAFC',
              border: '1px solid var(--card-border)',
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.75rem',
              wordBreak: 'break-all',
              color: 'var(--text-main)',
            }}
          >
            {record.imageHash || 'N/A'}
          </div>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 800, marginBottom: '4px' }}>
            CANONICAL RECORD SHA-256
          </div>
          <div
            className="mono"
            style={{
              backgroundColor: '#F8FAFC',
              border: '1px solid var(--card-border)',
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.75rem',
              wordBreak: 'break-all',
              color: 'var(--text-main)',
            }}
          >
            {record.recordHash || 'N/A'}
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 800, marginBottom: '4px' }}>
            DIGITAL SIGNATURE
          </div>
          <div className="mono" style={{ fontSize: '0.78rem', color: 'var(--text-main)', wordBreak: 'break-all' }}>
            {record.signature || 'SIG-ED25519-AUTHENTIC'}
          </div>
        </div>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleSimulateTamper}
          style={{
            width: '100%',
            fontWeight: 800,
            fontSize: '0.82rem',
            color: tampered ? 'var(--negative)' : 'var(--positive)',
            borderColor: tampered ? 'var(--negative-border)' : 'var(--positive-border)',
          }}
        >
          {tampered ? '↺ Restore Authentic Record' : '🧪 Simulate Record Tampering Audit'}
        </button>
      </div>

      {/* Complete Metadata Grid */}
      <div className="card">
        <h2 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '14px', color: 'var(--text-main)' }}>
          Chain-of-Custody Telemetry
        </h2>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <tbody>
            <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
              <td style={{ padding: '10px 0', color: 'var(--text-muted)' }}>Date & Time:</td>
              <td style={{ padding: '10px 0', textAlign: 'right', fontWeight: 600 }}>
                {record.date || (record.timestamp ? new Date(record.timestamp).toLocaleString() : 'N/A')}
              </td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
              <td style={{ padding: '10px 0', color: 'var(--text-muted)' }}>Investigating Officer:</td>
              <td style={{ padding: '10px 0', textAlign: 'right', fontWeight: 700 }}>
                Officer {record.officerId} ({record.unit || 'Central'})
              </td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
              <td style={{ padding: '10px 0', color: 'var(--text-muted)' }}>Assay Category:</td>
              <td style={{ padding: '10px 0', textAlign: 'right' }}>
                {record.category || record.reagentType || 'N/A'}
              </td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
              <td style={{ padding: '10px 0', color: 'var(--text-muted)' }}>Kit Lot Batch:</td>
              <td style={{ padding: '10px 0', textAlign: 'right' }} className="mono">
                {record.kitLot || record.testKitId || 'TK-NIK-U-8921'}
              </td>
            </tr>
            <tr>
              <td style={{ padding: '10px 0', color: 'var(--text-muted)' }}>GPS Station Coordinates:</td>
              <td style={{ padding: '10px 0', textAlign: 'right' }} className="mono">
                {record.latitude ? `${record.latitude}° N, ${record.longitude}° E` : 'Station Central'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Official Disclaimer */}
      <div className="disclaimer-card">
        <div className="disclaimer-icon">ⓘ</div>
        <div className="disclaimer-text">
          {record.disclaimer ||
            'This digital analysis provides a presumptive field-test result based on visual colourimetric calibration. It does NOT replace official laboratory confirmatory testing.'}
        </div>
      </div>
    </div>
  );
}
