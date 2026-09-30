/**
 * Image Validation Service
 * Validates captured image resolution, lighting quality (darkness/glare),
 * and presence of Reference Colour Card & Test Reaction Areas.
 * Ready for drop-in OpenCV / CoreML / TFLite pipeline upgrades.
 */

import { CalibrationThresholds } from '../constants/thresholds';

export interface ImageValidationInput {
  imageUri: string;
  width?: number;
  height?: number;
  // Optional simulated or extracted pixel statistics from ROI regions
  estimatedLuminance?: number;
  referenceCardDetected?: boolean;
  testAreaDetected?: boolean;
  glareDetected?: boolean;
}

export interface ImageValidationResult {
  valid: boolean;
  warnings: string[];
  metrics: {
    resolution: string;
    luminance: number;
    referenceCardDetected: boolean;
    testAreaDetected: boolean;
  };
}

export function validateCapturedImage(input: ImageValidationInput): ImageValidationResult {
  const warnings: string[] = [];

  // 1. Verify Image Exists
  if (!input.imageUri || input.imageUri.trim().length === 0) {
    return {
      valid: false,
      warnings: ['Image capture failed: No image data received.'],
      metrics: {
        resolution: '0x0',
        luminance: 0,
        referenceCardDetected: false,
        testAreaDetected: false,
      },
    };
  }

  const width = input.width || 1920;
  const height = input.height || 1080;
  const resolutionStr = `${width}x${height}`;

  // 2. Resolution check
  if (width < 640 || height < 480) {
    warnings.push(`Low image resolution (${resolutionStr}). Recommended: 1080p or higher.`);
  }

  // 3. Lighting & Luminance check
  const luminance = input.estimatedLuminance !== undefined ? input.estimatedLuminance : 140;

  if (luminance < CalibrationThresholds.minLuminance) {
    warnings.push('Image is excessively dark. Please increase ambient light or enable camera flash.');
  } else if (luminance > CalibrationThresholds.maxLuminance) {
    warnings.push('Image has excessive brightness or glare. Avoid direct overhead glare.');
  }

  // 4. Glare detection
  if (input.glareDetected) {
    warnings.push('Specular reflection / glare detected in test reaction area.');
  }

  // 5. Reference Colour Card detection check
  const referenceCardDetected = input.referenceCardDetected !== undefined ? input.referenceCardDetected : true;
  if (!referenceCardDetected) {
    warnings.push('Reference colour card not detected. Align card inside the blue guide frame.');
  }

  // 6. Test Reaction Area visibility check
  const testAreaDetected = input.testAreaDetected !== undefined ? input.testAreaDetected : true;
  if (!testAreaDetected) {
    warnings.push('Test reaction area not clearly visible. Align test well inside the purple guide frame.');
  }

  // The capture is valid if neither the card nor test area is missing, and lighting isn't completely pitch black
  const isFatal = !referenceCardDetected || !testAreaDetected || luminance < 20 || luminance > 250;
  const valid = !isFatal;

  return {
    valid,
    warnings,
    metrics: {
      resolution: resolutionStr,
      luminance: Math.round(luminance),
      referenceCardDetected,
      testAreaDetected,
    },
  };
}
