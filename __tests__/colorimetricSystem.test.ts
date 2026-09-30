import {
  generateImageHash,
  generateRecordHash,
  signRecord,
  verifyRecord,
  serializeCanonicalRecord,
} from '../src/services/cryptoService';
import { calibrateColorimetricSample } from '../src/services/colorCalibration';
import { classifyReaction, CHEMICAL_TEST_DISCLAIMER } from '../src/services/resultClassifier';
import { validateCapturedImage } from '../src/services/imageValidation';
import { rgbToHsv, rgbToLab, rgbToHex, calculateLuminance } from '../src/utils/imageUtils';
import { generateTestId, generateSampleId, generateTestKitId } from '../src/utils/idGenerator';
import { TestRecord, CanonicalRecordData } from '../src/models/TestRecord';

describe('Colorimetric Field Test System - Cryptographic Pipeline', () => {
  it('generates deterministic SHA-256 hashes for captured images', () => {
    const rawImage = 'file:///field_captures/FT-2026-000001_raw.jpg';
    const hash1 = generateImageHash(rawImage);
    const hash2 = generateImageHash(rawImage);

    expect(hash1).toBeDefined();
    expect(hash1.length).toBe(64); // SHA-256 hex string length
    expect(hash1).toBe(hash2);
  });

  it('generates canonical record hash and verifies integrity', () => {
    const canonical: CanonicalRecordData = {
      testId: 'FT-2026-104921',
      operatorId: 'OP-FIELD-01',
      testKitId: 'TK-891-L32',
      sampleId: 'SMP-QW8931',
      timestamp: '2026-09-29T18:30:00.000Z',
      latitude: 28.6139,
      longitude: 77.2090,
      result: 'POSITIVE',
      confidence: 0.95,
      imageHash: generateImageHash('mock_image_bytes'),
    };

    const recordHash = generateRecordHash(canonical);
    const signature = signRecord(recordHash, canonical.operatorId);

    const record: TestRecord = {
      id: canonical.testId,
      ...canonical,
      recordHash,
      signature,
      verificationStatus: 'VERIFIED',
      imageUri: 'demo://sample_positive.png',
    };

    const verification = verifyRecord(record);
    expect(verification.isValid).toBe(true);
    expect(verification.imageHashMatches).toBe(true);
    expect(verification.recordHashMatches).toBe(true);
    expect(verification.signatureVerified).toBe(true);
  });

  it('detects tampering when metadata is manipulated', () => {
    const canonical: CanonicalRecordData = {
      testId: 'FT-2026-999999',
      operatorId: 'OP-01',
      testKitId: 'TK-100',
      sampleId: 'SMP-200',
      timestamp: '2026-09-29T18:30:00.000Z',
      latitude: 12.9716,
      longitude: 77.5946,
      result: 'POSITIVE',
      confidence: 0.94,
      imageHash: generateImageHash('valid_image'),
    };

    const recordHash = generateRecordHash(canonical);
    const signature = signRecord(recordHash, canonical.operatorId);

    const record: TestRecord = {
      id: canonical.testId,
      ...canonical,
      recordHash,
      signature,
      verificationStatus: 'VERIFIED',
      imageUri: 'demo://sample.png',
    };

    // Tamper with result field in memory
    const tamperedRecord = { ...record, result: 'NEGATIVE' as const };
    const verification = verifyRecord(tamperedRecord);

    expect(verification.isValid).toBe(false);
    expect(verification.recordHashMatches).toBe(false);
    expect(verification.failureReason).toContain('Record SHA-256 mismatch');
  });
});

describe('Color Calibration & Chromatic Adaptation Pipeline', () => {
  it('correctly adapts raw RGB values using in-frame reference card', () => {
    const rawRefWhite: [number, number, number] = [230, 220, 210]; // Warm tint illumination
    const rawReaction: [number, number, number] = [100, 30, 160];

    const result = calibrateColorimetricSample({
      rawReferenceWhiteRgb: rawRefWhite,
      rawReactionAreaRgb: rawReaction,
      referenceCardDetected: true,
    });

    expect(result.calibrationData.referenceCardDetected).toBe(true);
    expect(result.calibrationData.whiteBalanceGain[0]).toBeGreaterThan(1.0);
    expect(result.calibratedReactionColor.rgb).toBeDefined();
    expect(result.calibratedReactionColor.hex.startsWith('#')).toBe(true);
  });

  it('converts RGB to HSV and CIELAB color spaces accurately', () => {
    const pureWhite: [number, number, number] = [255, 255, 255];
    const labWhite = rgbToLab(pureWhite);
    expect(labWhite[0]).toBeCloseTo(100, 0); // L* for pure white is ~100

    const pureRed: [number, number, number] = [255, 0, 0];
    const hsvRed = rgbToHsv(pureRed);
    expect(hsvRed[0]).toBe(0); // Hue for pure red is 0
    expect(hsvRed[1]).toBe(1); // Saturation is 1
  });
});

describe('Result Classifier', () => {
  it('classifies distinct violet/blue chromophore as POSITIVE with high confidence', () => {
    // Calibrated intense violet chromophore (e.g. Cobalt Thiocyanate/Marquis)
    const rawColor = {
      rgb: [105, 30, 165] as [number, number, number],
      hsv: [273, 0.82, 0.65] as [number, number, number],
      lab: [30, 45, -45] as [number, number, number],
      hex: '#691EA5',
    };

    const calibrationData = {
      referenceCardDetected: true,
      rawReferenceRgb: [245, 245, 245] as [number, number, number],
      whiteBalanceGain: [1.0, 1.0, 1.0] as [number, number, number],
      ambientLuminance: 150,
      lightingCondition: 'OPTIMAL' as const,
    };

    const output = classifyReaction(rawColor, calibrationData);

    expect(output.result).toBe('POSITIVE');
    expect(output.confidence).toBeGreaterThanOrEqual(0.90);
    expect(output.report.chemicalDisclaimer).toBe(CHEMICAL_TEST_DISCLAIMER);
  });

  it('classifies pale unreacted reagent blank as NEGATIVE', () => {
    const rawColor = {
      rgb: [250, 235, 180] as [number, number, number],
      hsv: [47, 0.28, 0.98] as [number, number, number],
      lab: [92, -3, 28] as [number, number, number],
      hex: '#FAEB84',
    };

    const calibrationData = {
      referenceCardDetected: true,
      rawReferenceRgb: [245, 245, 245] as [number, number, number],
      whiteBalanceGain: [1.0, 1.0, 1.0] as [number, number, number],
      ambientLuminance: 160,
      lightingCondition: 'OPTIMAL' as const,
    };

    const output = classifyReaction(rawColor, calibrationData);

    expect(output.result).toBe('NEGATIVE');
    expect(output.confidence).toBeGreaterThanOrEqual(0.90);
  });
});

describe('Image Validation Service', () => {
  it('flags image when reference card is not detected', () => {
    const validation = validateCapturedImage({
      imageUri: 'file:///photo.jpg',
      width: 1920,
      height: 1080,
      referenceCardDetected: false,
    });

    expect(validation.valid).toBe(false);
    expect(validation.warnings.some((w) => w.includes('Reference colour card not detected'))).toBe(true);
  });

  it('passes validation when conditions are optimal', () => {
    const validation = validateCapturedImage({
      imageUri: 'file:///valid_capture.jpg',
      width: 1920,
      height: 1080,
      referenceCardDetected: true,
      testAreaDetected: true,
      estimatedLuminance: 140,
    });

    expect(validation.valid).toBe(true);
    expect(validation.warnings.length).toBe(0);
  });
});

describe('ID Generator Utilities', () => {
  it('generates standard formatted IDs', () => {
    const testId = generateTestId();
    expect(testId).toMatch(/^FT-\d{4}-\d{6}$/);

    const sampleId = generateSampleId();
    expect(sampleId).toMatch(/^SMP-[A-Z0-9]{6}$/);

    const testKitId = generateTestKitId();
    expect(testKitId).toMatch(/^TK-\d{3}-L\d{2}$/);
  });
});
