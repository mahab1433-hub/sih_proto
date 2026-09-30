import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TestWorkflowPanel from '../components/TestWorkflowPanel';

/**
 * NewTest Page (Phase 1: Test Setup)
 * Clean, structured field kit & sample registration interface.
 * Left: Compact Test Workflow Panel
 * Right: Setup form with prefilled IDs, reagent selection, and GPS telemetry.
 */
export default function NewTest() {
  const navigate = useNavigate();

  const generateIds = () => {
    const rand = Math.floor(1000 + Math.random() * 9000);
    const caseRand = Math.floor(50000 + Math.random() * 40000);
    const sampleRand = Math.floor(60000 + Math.random() * 30000);
    return {
      testId: `DTS-2026-${rand}`,
      caseId: `CASE-2026-${caseRand}`,
      sampleId: `SMP-${sampleRand}`,
    };
  };

  const [formData, setFormData] = useState({
    ...generateIds(),
    category: 'Cocaine-type Substance (Scott Reagent)',
    officerId: '1023',
    unit: 'Central',
    kitLot: 'TK-NIK-U-8921',
    latitude: 12.9716,
    longitude: 77.5946,
    locationStatus: 'Acquiring GPS fix...',
  });

  const [selectedSubStep, setSelectedSubStep] = useState('kit');

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
        () => {
          setFormData((prev) => ({
            ...prev,
            locationStatus: 'Station Fixed Coordinates',
          }));
        },
        { enableHighAccuracy: true, timeout: 4000 }
      );
    }
  }, []);

  const reagentOptions = [
    {
      name: 'Scott Reagent (Cocaine-type)',
      value: 'Cocaine-type Substance (Scott Reagent)',
      kitLot: 'TK-NIK-G-9021',
      desc: 'Cobalt thiocyanate test for cocaine HCl and freebase crack.',
    },
    {
      name: 'Marquis Reagent (Opioids & Alkaloids)',
      value: 'Opioids / Alkaloids (Marquis Reagent)',
      kitLot: 'TK-NIK-A-8812',
      desc: 'Formaldehyde-sulfuric acid test for opiates, amphetamines, and MDMA.',
    },
    {
      name: 'Duquenois-Levine (Cannabinoids)',
      value: 'Cannabinoids (Duquenois-Levine)',
      kitLot: 'TK-NIK-E-7734',
      desc: 'Acetaldehyde & vanillin test for marijuana, hashish, and THC concentrates.',
    },
    {
      name: 'Mecke Reagent (Heroin / Morphine)',
      value: 'Heroin / Morphine (Mecke Reagent)',
      kitLot: 'TK-NIK-M-5510',
      desc: 'Selenious acid test distinguishing heroin, codeine, and morphine.',
    },
    {
      name: 'General Alkaloid Screen (Mayer)',
      value: 'General Alkaloid Screen (Mayer Reagent)',
      kitLot: 'TK-NIK-B-4419',
      desc: 'Potassium mercuric iodide screening for nitrogenous alkaloids.',
    },
  ];

  const handleSelectReagent = (opt) => {
    setFormData((prev) => ({
      ...prev,
      category: opt.value,
      kitLot: opt.kitLot,
    }));
    setSelectedSubStep('category');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProceed = (e) => {
    e.preventDefault();
    navigate('/camera', { state: { metadata: formData } });
  };

  return (
    <div className="workflow-layout-container">
      {/* LEFT: Compact Test Workflow Panel */}
      <TestWorkflowPanel currentPhase={1} currentSubStep={selectedSubStep} />

      {/* RIGHT: Main Setup Form Task Area */}
      <div className="card" style={{ marginBottom: 0 }}>
        <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px', marginBottom: '20px' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--brand-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Phase 1 • Setup & Calibration Target
          </div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-main)', marginTop: '2px' }}>
            Register Field Test Sample
          </h1>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
            Specify presumptive reagent test kit and case evidence identifiers before image capture.
          </p>
        </div>

        <form onSubmit={handleProceed} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Reagent Kit Selection */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
              Select Reagent Test Kit
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
              {reagentOptions.map((opt) => {
                const isSelected = formData.category === opt.value;
                return (
                  <div
                    key={opt.value}
                    onClick={() => handleSelectReagent(opt)}
                    style={{
                      border: `1.5px solid ${isSelected ? 'var(--brand-primary)' : 'var(--border-subtle)'}`,
                      backgroundColor: isSelected ? 'var(--brand-primary-light)' : '#FFFFFF',
                      borderRadius: 'var(--radius-md)',
                      padding: '12px 14px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.85rem', color: isSelected ? 'var(--brand-primary)' : 'var(--text-main)' }}>
                        {opt.name}
                      </span>
                      {isSelected && <span style={{ color: 'var(--brand-primary)', fontWeight: 800 }}>✓</span>}
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.35, margin: 0 }}>
                      {opt.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form Fields: Case, Sample, IDs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Test Record ID
              </label>
              <input
                type="text"
                name="testId"
                value={formData.testId}
                readOnly
                className="mono"
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  backgroundColor: 'var(--bg-subtle)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.86rem',
                  fontWeight: 700,
                  color: 'var(--text-main)',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Case Docket Number
              </label>
              <input
                type="text"
                name="caseId"
                value={formData.caseId}
                onChange={handleChange}
                onFocus={() => setSelectedSubStep('sample')}
                required
                className="mono"
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.86rem',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Sample Evidence ID
              </label>
              <input
                type="text"
                name="sampleId"
                value={formData.sampleId}
                onChange={handleChange}
                onFocus={() => setSelectedSubStep('sample')}
                required
                className="mono"
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.86rem',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Kit Batch / Lot
              </label>
              <input
                type="text"
                name="kitLot"
                value={formData.kitLot}
                onChange={handleChange}
                onFocus={() => setSelectedSubStep('kitDetails')}
                required
                className="mono"
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.86rem',
                }}
              />
            </div>
          </div>

          {/* Telemetry Bar */}
          <div
            style={{
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.78rem',
            }}
          >
            <div>
              <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>Location Telemetry: </span>
              <span className="mono" style={{ color: 'var(--text-secondary)' }}>
                {formData.latitude}° N, {formData.longitude}° E
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#16A34A', fontWeight: 700 }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#16A34A' }} />
              {formData.locationStatus}
            </div>
          </div>

          {/* Action Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', flexWrap: 'wrap', gap: '12px' }}>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="btn btn-secondary"
            >
              Cancel
            </button>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => navigate('/camera', { state: { metadata: formData, initialMode: 'upload' } })}
                className="btn btn-secondary"
                style={{ padding: '12px 20px', fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                <span>📁</span>
                <span>Upload Photo Directly</span>
              </button>
              <button
                type="submit"
                className="btn"
                style={{ padding: '12px 26px', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                <span>📷</span>
                <span>Open Camera Capture →</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
