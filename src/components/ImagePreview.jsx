import React from 'react';

/**
 * ImagePreview Component
 * Displays captured test image, quality audit metrics, and Retake / Continue controls.
 */
export default function ImagePreview({ imageSrc, dataUrl, validationResult, onRetake, onContinue, isUploaded = false }) {
  const currentSrc = dataUrl || imageSrc;
  const isValid = validationResult?.valid !== false;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {/* Captured Image Frame */}
      <div
        style={{
          width: '100%',
          height: '340px',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          backgroundColor: '#000000',
          border: '1px solid var(--border-subtle)',
          position: 'relative',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img
          src={currentSrc}
          alt="Captured Field Test"
          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
        />

        {/* Source Badge */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            padding: '4px 10px',
            borderRadius: '20px',
            fontSize: '0.72rem',
            fontWeight: 700,
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span>{isUploaded ? '📁' : '📷'}</span>
          <span>{isUploaded ? 'Uploaded Photo File' : 'Live Camera Frame'}</span>
        </div>

        {/* Resolution Badge */}
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            left: '12px',
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            padding: '4px 10px',
            borderRadius: '6px',
            fontSize: '0.72rem',
            fontFamily: 'monospace',
            color: '#E2E8F0',
          }}
        >
          Resolution: {validationResult?.metrics?.resolution || '1920x1080'}
        </div>
      </div>

      {/* Validation Status Banner */}
      <div
        className="card"
        style={{
          backgroundColor: isValid ? 'var(--status-negative-bg)' : 'var(--status-positive-bg)',
          borderColor: isValid ? 'var(--status-negative-border)' : 'var(--status-positive-border)',
          padding: '14px',
          marginBottom: '14px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 800,
            fontSize: '0.85rem',
            color: isValid ? 'var(--status-negative)' : 'var(--status-positive)',
          }}
        >
          <span>{isValid ? '✓' : '⚠️'}</span>
          <span>{isValid ? 'OPTICAL QUALITY AUDIT PASSED' : 'LIGHTING OR CLARITY WARNING'}</span>
        </div>
        <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
          {isValid
            ? 'Ambient illumination & reference card within calibration limits.'
            : validationResult?.warnings?.join('. ') || 'Image requires optical verification.'}
        </div>
      </div>

      {/* Metrics Row */}
      {validationResult?.metrics && (
        <div className="card" style={{ padding: '12px 16px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '6px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Luminance:</span>
            <span style={{ fontWeight: 700 }}>{validationResult.metrics.luminance} / 255 (Optimal: 40 - 230)</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Specular Glare:</span>
            <span style={{ fontWeight: 700 }}>{validationResult.metrics.glareRatio}% (Limit: max 12%)</span>
          </div>
        </div>
      )}

      {/* Action Buttons: Retake vs Continue */}
      <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onRetake}
          style={{ flex: 1 }}
        >
          {isUploaded ? '📁 CHOOSE ANOTHER PHOTO' : '🔄 RETAKE PHOTO'}
        </button>
        <button
          type="button"
          className="btn"
          onClick={onContinue}
          style={{ flex: 2, padding: '12px' }}
        >
          RUN SPECTRAL ANALYSIS →
        </button>
      </div>
    </div>
  );
}
