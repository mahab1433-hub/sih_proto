import React from 'react';

/**
 * CameraPreview Component
 * Renders the live HTML5 <video> feed alongside the optical calibration HUD guides.
 */
export default function CameraPreview({ videoRef, facingMode, onSwitchCamera, hasMultipleCameras }) {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '420px',
        backgroundColor: '#000000',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        border: '1px solid var(--surface-border)',
        boxShadow: 'var(--shadow-lg)',
      }}
    >
      {/* Live MediaDevices Video Stream */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          transform: facingMode === 'user' ? 'scaleX(-1)' : 'none', // Mirror selfie camera
        }}
      />

      {/* Optical Alignment HUD Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '14px',
          pointerEvents: 'none',
        }}
      >
        {/* Top Guidelines Banner */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.82)',
            backdropFilter: 'blur(8px)',
            border: '1px solid var(--surface-border)',
            borderRadius: 'var(--radius-sm)',
            padding: '8px 12px',
            fontSize: '0.72rem',
            color: '#E2E8F0',
            lineHeight: 1.4,
          }}
        >
          <div style={{ color: 'var(--primary-light)', fontWeight: 800, marginBottom: '2px', letterSpacing: '0.5px' }}>
            FIELD-TEST OPTICAL ALIGNMENT
          </div>
          <div>• Ensure the reference colour card is visible.</div>
          <div>• Avoid glare and strong shadows.</div>
        </div>

        {/* Reticles & Calibration Zones */}
        <div
          style={{
            flex: 1,
            margin: '10px 0',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-around',
            position: 'relative',
          }}
        >
          {/* 1. Reference Card Target */}
          <div
            style={{
              border: '2px dashed var(--guide-card)',
              borderRadius: '8px',
              backgroundColor: 'rgba(56, 189, 248, 0.1)',
              padding: '6px 10px',
              textAlign: 'center',
            }}
          >
            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--guide-card)', letterSpacing: '0.5px' }}>
              REFERENCE COLOUR CARD
            </span>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '4px' }}>
              <div style={{ width: '24px', height: '14px', background: '#FFFFFF', borderRadius: '2px' }}></div>
              <div style={{ width: '24px', height: '14px', background: '#808080', borderRadius: '2px' }}></div>
              <div style={{ width: '24px', height: '14px', background: '#000000', borderRadius: '2px' }}></div>
              <div style={{ width: '24px', height: '14px', background: 'var(--primary)', borderRadius: '2px' }}></div>
            </div>
          </div>

          {/* 2. Reaction Well Target */}
          <div
            style={{
              border: '2px solid var(--guide-reaction)',
              borderRadius: '8px',
              backgroundColor: 'rgba(168, 85, 247, 0.08)',
              height: '110px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--guide-reaction)', letterSpacing: '0.5px' }}>
              TEST REACTION AREA
            </span>
            {/* Center target crosshair */}
            <div style={{ width: '36px', height: '1px', background: 'var(--guide-reaction)', position: 'absolute' }}></div>
            <div style={{ width: '1px', height: '36px', background: 'var(--guide-reaction)', position: 'absolute' }}></div>
          </div>
        </div>

        {/* Bottom Status Tag */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div
            style={{
              background: 'rgba(11, 15, 23, 0.85)',
              padding: '4px 10px',
              borderRadius: '16px',
              fontSize: '0.68rem',
              color: 'var(--text-secondary)',
              border: '1px solid var(--surface-border)',
            }}
          >
            ● Live Sensor Active
          </div>

          {/* Switch Camera Button (Rear / Front) */}
          {hasMultipleCameras && (
            <button
              type="button"
              onClick={onSwitchCamera}
              style={{
                pointerEvents: 'auto',
                background: 'rgba(15, 23, 42, 0.85)',
                border: '1px solid var(--surface-border)',
                color: 'var(--text-primary)',
                padding: '6px 12px',
                borderRadius: '16px',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              🔄 Flip ({facingMode === 'environment' ? 'Rear' : 'Front'})
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
