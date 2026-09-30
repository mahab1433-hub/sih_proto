import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Test Setup Page
 * Captures field metadata, kit lot, sample ID, operator telemetry, and GPS before opening the camera.
 */
export default function Test() {
  const navigate = useNavigate();

  // Generate unique Test ID
  const generateTestId = () => {
    const d = new Date();
    const dateStr = d.toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `TEST-${dateStr}-${rand}`;
  };

  const [formData, setFormData] = useState({
    testId: generateTestId(),
    operatorId: 'OP-FIELD-042',
    testKitId: 'TK-NIK-U-8921',
    sampleId: 'SMP-98234-A',
    caseNumber: 'CR-2026-0814',
    reagentType: 'Scott Reagent (Presumptive Cocaine)',
    scenario: 'POSITIVE', // 'POSITIVE' | 'NEGATIVE_BLANK' | 'INCONCLUSIVE'
    latitude: 12.9716,
    longitude: 77.5946,
    locationStatus: 'Locating GPS telemetry...',
  });

  // Attempt real GPS location via browser Geolocation API
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setFormData((prev) => ({
            ...prev,
            latitude: Number(pos.coords.latitude.toFixed(6)),
            longitude: Number(pos.coords.longitude.toFixed(6)),
            locationStatus: 'GPS Locked (High Accuracy)',
          }));
        },
        (err) => {
          console.warn('Geolocation error:', err.message);
          setFormData((prev) => ({
            ...prev,
            locationStatus: 'Default Station Coordinates (GPS Unavailable)',
          }));
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 10000 }
      );
    } else {
      setFormData((prev) => ({
        ...prev,
        locationStatus: 'GPS Not Supported by Browser',
      }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStartCapture = (e) => {
    e.preventDefault();
    // Navigate to camera page with metadata in router state
    navigate('/camera', { state: { metadata: formData } });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '18px' }}>
        <h1 style={{ fontSize: '1.3rem', fontWeight: 900, marginBottom: '4px' }}>
          NEW FIELD-TEST METADATA
        </h1>
        <p style={{ fontSize: '0.82rem' }}>
          Initialize forensic metadata and telemetry before camera capture.
        </p>
      </div>

      <form onSubmit={handleStartCapture}>
        {/* Test Identifiers Card */}
        <div className="card">
          <div className="card-title">Test Identification</div>

          <div style={{ marginBottom: '14px' }}>
            <label className="field-label">TEST IDENTIFIER (AUTO)</label>
            <input
              type="text"
              name="testId"
              className="input mono"
              value={formData.testId}
              readOnly
              style={{ backgroundColor: 'var(--surface-elevated)' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
            <div>
              <label className="field-label">OPERATOR ID</label>
              <input
                type="text"
                name="operatorId"
                className="input"
                value={formData.operatorId}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="field-label">CASE NUMBER</label>
              <input
                type="text"
                name="caseNumber"
                className="input"
                value={formData.caseNumber}
                onChange={handleChange}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label className="field-label">TEST KIT LOT #</label>
              <input
                type="text"
                name="testKitId"
                className="input mono"
                value={formData.testKitId}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="field-label">SAMPLE TUBE ID</label>
              <input
                type="text"
                name="sampleId"
                className="input mono"
                value={formData.sampleId}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        {/* Assay Configuration Card */}
        <div className="card">
          <div className="card-title">Assay & Reagent Envelope</div>

          <div style={{ marginBottom: '14px' }}>
            <label className="field-label">REAGENT SPECIFICATION</label>
            <select
              name="reagentType"
              className="input"
              value={formData.reagentType}
              onChange={handleChange}
            >
              <option value="Scott Reagent (Presumptive Cocaine)">Scott Reagent (Presumptive Cocaine HCl / Base)</option>
              <option value="Marquis Reagent (Opioids / Alkaloids)">Marquis Reagent (Opioids / Alkaloids)</option>
              <option value="Duquenois-Levine (Cannabinoids)">Duquenois-Levine (Cannabinoids)</option>
              <option value="Ehrlich Reagent (Indoles / Tryptamines)">Ehrlich Reagent (Indoles / Tryptamines)</option>
            </select>
          </div>

          <div>
            <label className="field-label">DEMO / SIMULATION TARGET (IF ML OFFLINE)</label>
            <select
              name="scenario"
              className="input"
              value={formData.scenario}
              onChange={handleChange}
              style={{ color: 'var(--primary-light)', fontWeight: 700 }}
            >
              <option value="POSITIVE">Positive Reaction (Intense Chromophore Envelope)</option>
              <option value="NEGATIVE_BLANK">Negative Blank (Unreacted Reagent Reference)</option>
              <option value="INCONCLUSIVE">Inconclusive Reaction (Turbidity / Sub-threshold)</option>
            </select>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Used for validation if external ML model server (VITE_API_URL) is unavailable.
            </div>
          </div>
        </div>

        {/* GPS Telemetry */}
        <div className="card">
          <div className="card-title">GPS Field Telemetry</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Status:</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--primary-light)', fontWeight: 700 }}>
              {formData.locationStatus}
            </span>
          </div>
          <div className="mono" style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
            LAT: {formData.latitude.toFixed(6)}° N • LON: {formData.longitude.toFixed(6)}° E
          </div>
        </div>

        {/* Proceed Button */}
        <button
          type="submit"
          className="btn"
          style={{
            height: '56px',
            fontSize: '1.05rem',
            fontWeight: 800,
            marginBottom: '20px',
            boxShadow: 'var(--shadow-primary)',
          }}
        >
          OPEN REAL CAMERA →
        </button>
      </form>
    </div>
  );
}
