import React, { useState, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import TestWorkflowPanel from '../components/TestWorkflowPanel';
import Camera from '../components/Camera';
import ImagePreview from '../components/ImagePreview';
import { validateImage } from '../utils/imageProcessing';

/**
 * CameraPage Component (Phase 2: Capture & Optical Analysis)
 * Supports both Live Hardware Camera Capture and Direct Photo File Upload
 */
export default function CameraPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const metadata = location.state?.metadata || {
    testId: `DTS-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    caseId: 'CASE-2026-57682',
    sampleId: 'SMP-67801',
    category: 'Cocaine-type Substance (Scott Reagent)',
    officerId: '1023',
    unit: 'Central',
  };

  const initialMode = location.state?.initialMode === 'upload' ? 'upload' : 'camera';

  const [activeTab, setActiveTab] = useState(initialMode); // 'camera' | 'upload'
  const [capturedBlob, setCapturedBlob] = useState(null);
  const [capturedDataUrl, setCapturedDataUrl] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);

  const [currentMetadata, setCurrentMetadata] = useState(metadata);

  /**
   * Handle image acquired either via camera shutter or file upload
   */
  const handleCapture = async (blob, dataUrl, fromUpload = false, overrideMeta = null) => {
    setCapturedBlob(blob);
    setCapturedDataUrl(dataUrl);
    setIsUploaded(fromUpload);
    if (overrideMeta) {
      setCurrentMetadata(overrideMeta);
    }

    // Run optical quality audit
    const val = await validateImage(blob);
    setValidationResult(val);
    setIsReviewing(true);
  };

  const handleRetake = () => {
    setCapturedBlob(null);
    setCapturedDataUrl(null);
    setValidationResult(null);
    setIsReviewing(false);
    setIsUploaded(false);
  };

  const handleContinueToAnalysis = () => {
    navigate('/analysis', {
      state: {
        blob: capturedBlob,
        dataUrl: capturedDataUrl,
        metadata: currentMetadata,
        isUploaded,
      },
    });
  };

  /**
   * Process a photo file chosen or dropped
   */
  const handleFileUpload = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPEG, PNG, WEBP, etc.)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      handleCapture(file, dataUrl, true);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  /**
   * Synthesize realistic colorimetric test card samples for instant demo testing
   */
  const handleSelectSample = (sampleType) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext('2d');

    // Background card (matte dark slate)
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Card boundary with rounded corners
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 4;
    ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);

    // 1. LEFT ZONE: Reference Color Card (x: 15% to 40%)
    const refX = canvas.width * 0.14;
    const refY = canvas.height * 0.22;
    const refW = canvas.width * 0.26;
    const refH = canvas.height * 0.55;

    ctx.fillStyle = '#1E293B';
    ctx.fillRect(refX, refY, refW, refH);
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 3;
    ctx.setLineDash([6, 6]);
    ctx.strokeRect(refX, refY, refW, refH);
    ctx.setLineDash([]);

    // Reference patches (White, Neutral Gray, Black, Reference Cyan)
    const patchW = refW * 0.75;
    const patchH = refH * 0.16;
    const patchX = refX + (refW - patchW) / 2;

    const patches = [
      { fill: '#F8FAFC', label: 'WHITE 100%' },
      { fill: '#94A3B8', label: 'GRAY 18%' },
      { fill: '#0F172A', label: 'BLACK 0%' },
      { fill: '#0284C7', label: 'CYAN REF' },
    ];

    patches.forEach((p, idx) => {
      const py = refY + 20 + idx * (patchH + 12);
      ctx.fillStyle = p.fill;
      ctx.fillRect(patchX, py, patchW, patchH);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1;
      ctx.strokeRect(patchX, py, patchW, patchH);
    });

    ctx.fillStyle = '#38BDF8';
    ctx.font = 'bold 16px monospace';
    ctx.fillText('REF CARD ZONE', refX + 20, refY - 12);

    // 2. RIGHT ZONE: Reaction Well Chamber (x: 58% to 88%)
    const reactX = canvas.width * 0.58;
    const reactY = canvas.height * 0.22;
    const reactW = canvas.width * 0.28;
    const reactH = canvas.height * 0.55;

    ctx.fillStyle = '#1E293B';
    ctx.fillRect(reactX, reactY, reactW, reactH);
    ctx.strokeStyle = '#A855F7';
    ctx.lineWidth = 3;
    ctx.strokeRect(reactX, reactY, reactW, reactH);

    ctx.fillStyle = '#C084FC';
    ctx.font = 'bold 16px monospace';
    ctx.fillText('REACTION WELL', reactX + 20, reactY - 12);

    // Radial gradient reaction chromophore
    const centerX = reactX + reactW / 2;
    const centerY = reactY + reactH / 2;
    const radius = Math.min(reactW, reactH) * 0.38;

    let chromophoreCenter = '#1E40AF';
    let chromophoreEdge = '#172554';
    let reactionLabel = 'COCAINE POSITIVE (SCOTT)';
    let sampleMeta = { ...metadata };

    if (sampleType === 'cocaine') {
      chromophoreCenter = '#1E40AF';
      chromophoreEdge = '#172554';
      reactionLabel = 'COCAINE POSITIVE (SCOTT)';
      sampleMeta = {
        ...metadata,
        category: 'Cocaine-type Substance (Scott Reagent)',
        scenario: 'POSITIVE',
      };
    } else if (sampleType === 'marquis') {
      chromophoreCenter = '#581C87';
      chromophoreEdge = '#3B0764';
      reactionLabel = 'OPIOID POSITIVE (MARQUIS)';
      sampleMeta = {
        ...metadata,
        category: 'Opioids / Alkaloids (Marquis Reagent)',
        scenario: 'POSITIVE',
      };
    } else if (sampleType === 'cannabinoid') {
      chromophoreCenter = '#4C1D95';
      chromophoreEdge = '#2E1065';
      reactionLabel = 'THC POSITIVE (DUQUENOIS)';
      sampleMeta = {
        ...metadata,
        category: 'Cannabinoids (Duquenois-Levine)',
        scenario: 'POSITIVE',
      };
    } else if (sampleType === 'negative') {
      chromophoreCenter = '#FEF08A';
      chromophoreEdge = '#EAB308';
      reactionLabel = 'FIELD BLANK (NEGATIVE CONTROL)';
      sampleMeta = {
        ...metadata,
        scenario: 'NEGATIVE_BLANK',
        sampleId: 'SMP-BLANK-01',
      };
    } else if (sampleType === 'inconclusive') {
      chromophoreCenter = '#78350F';
      chromophoreEdge = '#451A03';
      reactionLabel = 'CONTAMINATED TURBID (INCONCLUSIVE)';
      sampleMeta = {
        ...metadata,
        scenario: 'INCONCLUSIVE',
        sampleId: 'SMP-TURBID-01',
      };
    }

    const radGrad = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, radius);
    radGrad.addColorStop(0, chromophoreCenter);
    radGrad.addColorStop(1, chromophoreEdge);

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fillStyle = radGrad;
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Top Card Header Metadata
    ctx.fillStyle = '#F8FAFC';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('COLORIMETRIC FIELD-TEST CARD', 50, 70);

    ctx.fillStyle = '#94A3B8';
    ctx.font = '14px monospace';
    ctx.fillText(`KIT LOT: ${sampleMeta.kitLot || 'TK-NIK-8921'}  •  SAMPLE: ${sampleMeta.sampleId}  •  ${reactionLabel}`, 50, 98);

    // Export to blob & dataUrl
    canvas.toBlob(
      (blob) => {
        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
        handleCapture(blob, dataUrl, true, sampleMeta);
      },
      'image/jpeg',
      0.95
    );
  };

  return (
    <div className="workflow-layout-container">
      {/* LEFT: Compact Test Workflow Panel */}
      <TestWorkflowPanel currentPhase={2} currentSubStep="capture" />

      {/* RIGHT: Main Camera Viewfinder / Photo Upload / Review Area */}
      <div className="card" style={{ marginBottom: 0 }}>
        {/* Header Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--brand-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Phase 2 • Optical Capture & Spectral Analysis
            </div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-main)', marginTop: '2px' }}>
              {isReviewing
                ? (isUploaded ? 'Uploaded Photo Quality Audit' : 'Camera Frame Quality Audit')
                : (activeTab === 'upload' ? 'Upload Test Photo' : 'Live Camera Viewfinder')}
            </h1>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }} className="mono">
              {metadata.testId} • {metadata.category.split('(')[0]}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Mode Switcher Pill */}
            {!isReviewing && (
              <div
                style={{
                  display: 'flex',
                  backgroundColor: 'var(--bg-subtle)',
                  padding: '4px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <button
                  type="button"
                  onClick={() => setActiveTab('camera')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: activeTab === 'camera' ? 'var(--brand-primary)' : 'transparent',
                    color: activeTab === 'camera' ? '#FFFFFF' : 'var(--text-secondary)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  📷 Live Camera
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('upload')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: activeTab === 'upload' ? 'var(--brand-primary)' : 'transparent',
                    color: activeTab === 'upload' ? '#FFFFFF' : 'var(--text-secondary)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  📁 Upload Photo
                </button>
              </div>
            )}

            <Link to="/new-test" className="btn btn-secondary" style={{ padding: '7px 12px', fontSize: '0.78rem' }}>
              ← Back to Setup
            </Link>
          </div>
        </div>

        {/* Dynamic Mode Area: Review, Upload, or Live Camera */}
        {isReviewing ? (
          <ImagePreview
            dataUrl={capturedDataUrl}
            validationResult={validationResult}
            onRetake={handleRetake}
            onContinue={handleContinueToAnalysis}
            isUploaded={isUploaded}
          />
        ) : activeTab === 'upload' ? (
          /* ==============================================================
             UPLOAD PHOTO MODE
             ============================================================== */
          <div>
            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => {
                if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
              }}
            />

            {/* Drag & Drop Upload Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              style={{
                border: `2px dashed ${isDragging ? 'var(--brand-primary)' : 'var(--border-medium)'}`,
                backgroundColor: isDragging ? 'var(--brand-primary-light)' : '#FAFAFA',
                borderRadius: 'var(--radius-lg)',
                padding: '48px 24px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative',
              }}
            >
              <div style={{ fontSize: '3.2rem', marginBottom: '12px' }}>
                {isDragging ? '📥' : '📁'}
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' }}>
                {isDragging ? 'Drop Image to Upload' : 'Upload Field-Test Photo'}
              </h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto 18px auto' }}>
                Drag & drop a photo of your colorimetric field test strip / card here, or click to browse files from your computer or phone.
              </p>

              <button
                type="button"
                className="btn"
                style={{ padding: '10px 24px', fontSize: '0.86rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                <span>📂</span>
                <span>Select Photo From Device</span>
              </button>

              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '14px' }}>
                Supports JPEG, PNG, WEBP, TIFF • Up to 25 MB • High-resolution recommended
              </div>
            </div>

            {/* Quick Preset Samples for One-Click Testing */}
            <div style={{ marginTop: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.76rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                  Or Test with Standard Reference Test Card Samples
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>1-Click Instant Demo</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                {/* 1. Cocaine Scott Sample */}
                <div
                  onClick={() => handleSelectSample('cocaine')}
                  style={{
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px',
                    backgroundColor: '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--brand-primary)'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#1E40AF' }} />
                    <span style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--text-main)' }}>Cocaine (Scott Reagent)</span>
                  </div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: 0 }}>
                    Cobalt blue chromophore reaction with reference card.
                  </p>
                </div>

                {/* 2. Marquis Reagent Sample */}
                <div
                  onClick={() => handleSelectSample('marquis')}
                  style={{
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px',
                    backgroundColor: '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--brand-primary)'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#581C87' }} />
                    <span style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--text-main)' }}>Opioids (Marquis Reagent)</span>
                  </div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: 0 }}>
                    Deep violet reaction profile for morphine & heroin.
                  </p>
                </div>

                {/* 3. Cannabinoid Sample */}
                <div
                  onClick={() => handleSelectSample('cannabinoid')}
                  style={{
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px',
                    backgroundColor: '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--brand-primary)'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#4C1D95' }} />
                    <span style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--text-main)' }}>Cannabinoids (Duquenois)</span>
                  </div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: 0 }}>
                    Indigo/purple envelope for marijuana/THC extracts.
                  </p>
                </div>

                {/* 4. Negative Sample */}
                <div
                  onClick={() => handleSelectSample('negative')}
                  style={{
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px',
                    backgroundColor: '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--brand-primary)'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#EAB308' }} />
                    <span style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--text-main)' }}>Field Blank (Negative)</span>
                  </div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: 0 }}>
                    Negative reagent blank control without reaction.
                  </p>
                </div>

                {/* 5. Inconclusive Sample */}
                <div
                  onClick={() => handleSelectSample('inconclusive')}
                  style={{
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px',
                    backgroundColor: '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--brand-primary)'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#D97706' }} />
                    <span style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--text-main)' }}>Turbid (Inconclusive)</span>
                  </div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: 0 }}>
                    Contaminated / off-target turbidity requiring lab GC-MS.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ==============================================================
             LIVE CAMERA MODE
             ============================================================== */
          <div>
            <Camera
              onCapture={(blob, dataUrl, fromUpload) => handleCapture(blob, dataUrl, fromUpload)}
              onCancel={() => navigate('/new-test')}
            />
          </div>
        )}
      </div>
    </div>
  );
}
