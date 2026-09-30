import React, { useState, useEffect, useRef, useCallback } from 'react';
import CameraPreview from './CameraPreview';
import CaptureButton from './CaptureButton';

/**
 * Camera Component
 * Interacts with browser native MediaDevices API or allows direct photo file upload
 */
export default function Camera({ onCapture, onCancel }) {
  const [stream, setStream] = useState(null);
  const [facingMode, setFacingMode] = useState('environment'); // Prefer rear camera on mobile
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState('prompt'); // 'prompt' | 'granted' | 'denied' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [isCapturing, setIsCapturing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  // Check if multiple camera devices exist (front + rear)
  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices
        .enumerateDevices()
        .then((devices) => {
          const videoInputs = devices.filter((d) => d.kind === 'videoinput');
          setHasMultipleCameras(videoInputs.length > 1);
        })
        .catch(() => {});
    }
  }, []);

  /**
   * Initializes native camera stream using getUserMedia()
   */
  const startCameraStream = useCallback(async () => {
    // 1. Insecure context check (getUserMedia requires localhost or HTTPS)
    if (!window.isSecureContext && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      setPermissionStatus('error');
      setErrorMessage(
        'Camera access requires a secure connection (HTTPS) or localhost. Please access via HTTPS or localhost.'
      );
      return;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setPermissionStatus('error');
      setErrorMessage('Your browser or device does not support native MediaDevices camera access.');
      return;
    }

    // Stop any existing stream tracks before starting a new one
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    try {
      const constraints = {
        video: {
          facingMode: { ideal: facingMode }, // Prefer rear camera on smartphones
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      };

      // Request camera permission from the user
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      setPermissionStatus('granted');
      setErrorMessage('');

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Camera getUserMedia error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionStatus('denied');
        setErrorMessage(
          'Camera permission was denied. Please allow camera permissions in your browser address bar settings to continue.'
        );
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setPermissionStatus('error');
        setErrorMessage('No camera device was detected on your hardware.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setPermissionStatus('error');
        setErrorMessage('Camera is currently in use by another application. Please close other camera apps and retry.');
      } else {
        setPermissionStatus('error');
        setErrorMessage(`Camera error: ${err.message || 'Unable to access camera.'}`);
      }
    }
  }, [facingMode]);

  // Start stream on mount or when facingMode changes
  useEffect(() => {
    startCameraStream();

    // Cleanup: Stop all camera tracks when component unmounts
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [startCameraStream]);

  // Re-attach video stream if ref mounts after stream is active
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  /**
   * Switch between front (user) and rear (environment) camera
   */
  const handleSwitchCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  /**
   * Process photo file selected or dropped by the user
   */
  const processPhotoFile = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPEG, PNG, WEBP, etc.)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      onCapture(file, dataUrl, true);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processPhotoFile(file);
    }
  };

  /**
   * Captures a frame from the live video element using an HTML5 <canvas>
   */
  const handleCaptureFrame = () => {
    if (!videoRef.current || isCapturing) return;
    setIsCapturing(true);

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1920;
    canvas.height = video.videoHeight || 1080;

    const ctx = canvas.getContext('2d');
    // If using front camera, un-mirror the captured photo for true orientation
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert frame into a Blob and DataURL
    canvas.toBlob(
      (blob) => {
        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
        setIsCapturing(false);

        // Stop stream before proceeding
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }

        onCapture(blob, dataUrl, false);
      },
      'image/jpeg',
      0.92
    );
  };

  // Render Permission Denied State with direct Photo Upload fallback
  if (permissionStatus === 'denied') {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '36px 20px' }}>
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileInputChange}
        />
        <div style={{ fontSize: '2.4rem', marginBottom: '14px' }}>🔒</div>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Camera Permission Blocked</h3>
        <p style={{ fontSize: '0.85rem', marginBottom: '18px', maxWidth: '460px', margin: '0 auto 18px auto' }}>
          {errorMessage}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
          <button
            type="button"
            className="btn"
            onClick={() => fileInputRef.current?.click()}
            style={{ padding: '12px 24px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <span>📁</span>
            <span>Upload Photo From Device</span>
          </button>

          <button type="button" className="btn btn-secondary" onClick={startCameraStream} style={{ fontSize: '0.82rem' }}>
            🔄 Retry Camera Permission
          </button>

          {onCancel && (
            <button type="button" className="btn btn-secondary" style={{ marginTop: '4px', fontSize: '0.82rem' }} onClick={onCancel}>
              ← Return to Setup
            </button>
          )}
        </div>
      </div>
    );
  }

  // Render Hardware / Insecure Context Error State with direct Photo Upload fallback
  if (permissionStatus === 'error') {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '36px 20px' }}>
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileInputChange}
        />
        <div style={{ fontSize: '2.4rem', marginBottom: '14px' }}>⚠️</div>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Camera Initialization Issue</h3>
        <p style={{ fontSize: '0.85rem', marginBottom: '18px', maxWidth: '460px', margin: '0 auto 18px auto' }}>
          {errorMessage}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
          <button
            type="button"
            className="btn"
            onClick={() => fileInputRef.current?.click()}
            style={{ padding: '12px 24px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <span>📁</span>
            <span>Upload Photo From Device Instead</span>
          </button>

          <button type="button" className="btn btn-secondary" onClick={startCameraStream} style={{ fontSize: '0.82rem' }}>
            🔄 Re-initialize Camera Sensor
          </button>

          {onCancel && (
            <button type="button" className="btn btn-secondary" style={{ marginTop: '4px', fontSize: '0.82rem' }} onClick={onCancel}>
              ← Return to Setup
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', width: '100%', position: 'relative' }}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
          processPhotoFile(file);
        }
      }}
    >
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileInputChange}
      />

      {/* Drag & Drop Visual Glow Overlay */}
      {isDragging && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 50,
            background: 'rgba(0, 0, 0, 0.85)',
            border: '3px dashed var(--brand-primary)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            backdropFilter: 'blur(4px)',
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '8px' }}>📥</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>Drop Test Strip Photo Here</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginTop: '4px' }}>Release to immediately analyze optical reaction</div>
        </div>
      )}

      {/* Live Viewfinder */}
      <CameraPreview
        videoRef={videoRef}
        facingMode={facingMode}
        onSwitchCamera={handleSwitchCamera}
        hasMultipleCameras={hasMultipleCameras}
      />

      {/* Shutter Capture & Upload Controls */}
      <CaptureButton
        onClick={handleCaptureFrame}
        isCapturing={isCapturing}
        onUploadClick={() => fileInputRef.current?.click()}
      />
    </div>
  );
}
