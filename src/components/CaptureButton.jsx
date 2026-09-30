import React from 'react';

/**
 * CaptureButton Component
 * Large accessible shutter button for mobile and desktop camera capture.
 */
export default function CaptureButton({ onClick, disabled = false, isCapturing = false, onUploadClick }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '14px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <button
          type="button"
          onClick={onClick}
          disabled={disabled || isCapturing}
          aria-label="Capture photo"
          style={{
            width: '74px',
            height: '74px',
            borderRadius: '50%',
            background: 'rgba(0, 0, 0, 0.08)',
            border: '4px solid var(--brand-primary)',
            padding: '4px',
            cursor: disabled ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.15s ease, background 0.2s',
            outline: 'none',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
          }}
          onMouseDown={(e) => {
            if (!disabled) e.currentTarget.style.transform = 'scale(0.92)';
          }}
          onMouseUp={(e) => {
            if (!disabled) e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: isCapturing ? '#222222' : 'var(--brand-primary)',
              border: '2px solid rgba(255, 255, 255, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              fontWeight: 800,
            }}
          >
            {isCapturing ? '...' : ''}
          </div>
        </button>

        {onUploadClick && (
          <button
            type="button"
            onClick={onUploadClick}
            className="btn btn-secondary"
            style={{
              padding: '10px 18px',
              fontSize: '0.84rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              borderRadius: '24px',
              backgroundColor: '#FFFFFF',
              border: '1.5px solid var(--border-medium)',
              boxShadow: 'var(--shadow-sm)',
              fontWeight: 700,
            }}
          >
            <span style={{ fontSize: '1.1rem' }}>📁</span>
            <span>Upload Photo</span>
          </button>
        )}
      </div>

      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '10px', fontWeight: 600 }}>
        Tap circular shutter to capture optical reaction or click Upload Photo
      </span>
    </div>
  );
}
