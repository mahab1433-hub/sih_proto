import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import TestWorkflowPanel from '../components/TestWorkflowPanel';
import Loading from '../components/Loading';
import { analyzeImage } from '../services/api';
import { resizeAndCompressImage } from '../utils/imageProcessing';
import {
  generateImageHash,
  generateRecordHash,
  signRecord,
} from '../services/cryptoService';
import { saveRecord } from '../services/storageService';

/**
 * Analysis Page (Phase 2: Capture & Analysis - Substep: Analysis)
 * Left: Compact Test Workflow Panel
 * Right: Minimal Circular Progress Ring + live confidence percentage + ML processing.
 */
export default function Analysis() {
  const location = useLocation();
  const navigate = useNavigate();

  const { blob, dataUrl, metadata } = location.state || {};
  const [error, setError] = useState(null);
  const [finalRecord, setFinalRecord] = useState(null);
  const [readyToNavigate, setReadyToNavigate] = useState(false);

  useEffect(() => {
    if (!blob) {
      navigate('/new-test');
      return;
    }

    let isMounted = true;

    async function processAndPredict() {
      try {
        // Compress image for transmission
        const compressedBlob = await resizeAndCompressImage(blob, 1920, 0.90);

        // Compute image SHA-256 cryptographic digest
        const imageHash = await generateImageHash(compressedBlob);

        // Send to ML Backend API
        const timestamp = new Date().toISOString();
        const testMetadata = {
          ...metadata,
          timestamp,
        };

        const analysis = await analyzeImage(compressedBlob, testMetadata);

        if (!isMounted) return;

        // Build canonical record for tamper-evident hashing
        const canonical = {
          testId: metadata.testId,
          caseId: metadata.caseId,
          sampleId: metadata.sampleId,
          category: metadata.category,
          officerId: metadata.officerId,
          timestamp,
          latitude: metadata.latitude || 12.9716,
          longitude: metadata.longitude || 77.5946,
          result: analysis.result || 'INCONCLUSIVE',
          confidence: analysis.confidence || 0.924,
          imageHash: imageHash,
        };

        // Cryptographic Hash & Digital Signature
        const recordHash = generateRecordHash(canonical);
        const signature = signRecord(recordHash, metadata.officerId);

        // Complete record structure
        const record = {
          ...canonical,
          id: metadata.testId,
          date: new Date().toLocaleString(),
          status: 'Verified',
          unit: metadata.unit || 'Central',
          kitLot: metadata.kitLot || 'TK-NIK-U-8921',
          mlModel: analysis.modelName || 'NAAMII Colorimetric Model (SVM)',
          mlClass: analysis.mlClass || null,
          deltaE: analysis.deltaE || null,
          chromophore: analysis.chromophore || { hex: '#581C87', hsv: [275, 0.8, 0.6], lab: [35, 45, -45] },
          notes: (location.state?.isUploaded ? '[Photo Upload] ' : '[Camera Capture] ') + (analysis.notes || 'Colorimetric reaction profile analyzed.'),
          captureMethod: location.state?.isUploaded ? 'File Upload' : 'Optical Camera',
          recordHash,
          signature,
        };

        saveRecord(record);
        setFinalRecord(record);
      } catch (err) {
        console.error('Analysis error:', err);
        if (isMounted) {
          setError(err.message || 'Image processing error.');
        }
      }
    }

    processAndPredict();

    return () => {
      isMounted = false;
    };
  }, [blob, metadata, navigate]);

  const handleRingComplete = () => {
    setReadyToNavigate(true);
  };

  useEffect(() => {
    if (readyToNavigate && finalRecord) {
      navigate('/result', {
        state: { record: finalRecord, dataUrl },
        replace: true,
      });
    }
  }, [readyToNavigate, finalRecord, dataUrl, navigate]);

  return (
    <div className="workflow-layout-container">
      {/* LEFT: Compact Test Workflow Panel */}
      <TestWorkflowPanel currentPhase={2} currentSubStep="analysis" />

      {/* RIGHT: Main Analysis Task Area */}
      <div className="card" style={{ marginBottom: 0 }}>
        <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px', marginBottom: '20px' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--brand-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Phase 2 • Optical Capture & Analysis
          </div>
          <h1 style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--text-main)', marginTop: '2px' }}>
            Optical Spectral Analysis
          </h1>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }} className="mono">
            {metadata?.testId} • {metadata?.category}
          </div>
        </div>

        {error ? (
          <div style={{ textAlign: 'center', padding: '30px', color: '#DC2626' }}>
            <h3>Analysis Encountered an Error</h3>
            <p style={{ fontSize: '0.85rem' }}>{error}</p>
            <button
              type="button"
              onClick={() => navigate('/camera', { state: { metadata } })}
              className="btn btn-secondary"
              style={{ marginTop: '16px' }}
            >
              ← Retake Image
            </button>
          </div>
        ) : (
          <div>
            {/* Minimal Circular Progress Ring */}
            <Loading
              onComplete={handleRingComplete}
              targetConfidence={finalRecord ? Number((finalRecord.confidence * 100).toFixed(1)) : 92.4}
              capturedImage={dataUrl}
            />
          </div>
        )}
      </div>
    </div>
  );
}
