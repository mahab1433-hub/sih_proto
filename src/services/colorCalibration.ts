/**
 * Color Calibration Service
 * Compensates for ambient lighting variation using the in-frame Reference Colour Card
 * via Von Kries / White-Point chromatic adaptation in RGB, HSV, and CIELAB spaces.
 */

import { CalibrationData, ColorSpaceValues } from '../models/TestResult';
import { CalibrationThresholds } from '../constants/thresholds';
import { createColorSpaceValues, calculateLuminance } from '../utils/imageUtils';

export interface CalibrationPipelineInput {
  // Raw RGB measured from Reference Card White / Neutral Patch
  rawReferenceWhiteRgb: [number, number, number];
  // Raw RGB measured from the Chemical Test Reaction Well
  rawReactionAreaRgb: [number, number, number];
  referenceCardDetected?: boolean;
}

export interface CalibrationPipelineResult {
  calibratedReactionColor: ColorSpaceValues;
  calibrationData: CalibrationData;
  rawReactionColor: ColorSpaceValues;
}

/**
 * Executes the 6-stage colorimetric calibration pipeline
 */
export function calibrateColorimetricSample(
  input: CalibrationPipelineInput
): CalibrationPipelineResult {
  const { rawReferenceWhiteRgb, rawReactionAreaRgb } = input;
  const isCardDetected = input.referenceCardDetected ?? true;

  // 1. Calculate ambient luminance of the reference patch
  const ambientLuminance = calculateLuminance(rawReferenceWhiteRgb);

  // Determine lighting environment condition
  let lightingCondition: CalibrationData['lightingCondition'] = 'OPTIMAL';
  if (ambientLuminance < CalibrationThresholds.minLuminance) {
    lightingCondition = 'LOW_LIGHT';
  } else if (ambientLuminance > CalibrationThresholds.maxLuminance) {
    lightingCondition = 'OVEREXPOSED';
  } else if (Math.abs(rawReferenceWhiteRgb[0] - rawReferenceWhiteRgb[2]) > 30) {
    lightingCondition = 'DIFFUSE'; // Color cast from incandescent or blue sky
  }

  // 2. Compute Von Kries chromatic adaptation / White Balance gains
  // Standard D65 Target: [245, 245, 245]
  const targetWhite = CalibrationThresholds.standardReferenceWhite.rgb;
  
  // Guard against division by zero
  const safeRefR = Math.max(15, rawReferenceWhiteRgb[0]);
  const safeRefG = Math.max(15, rawReferenceWhiteRgb[1]);
  const safeRefB = Math.max(15, rawReferenceWhiteRgb[2]);

  const gainR = isCardDetected ? Number((targetWhite[0] / safeRefR).toFixed(4)) : 1.0;
  const gainG = isCardDetected ? Number((targetWhite[1] / safeRefG).toFixed(4)) : 1.0;
  const gainB = isCardDetected ? Number((targetWhite[2] / safeRefB).toFixed(4)) : 1.0;

  // 3. Compensate Test Reaction Area RGB using calibration gains
  const calibratedR = Math.max(0, Math.min(255, Math.round(rawReactionAreaRgb[0] * gainR)));
  const calibratedG = Math.max(0, Math.min(255, Math.round(rawReactionAreaRgb[1] * gainG)));
  const calibratedB = Math.max(0, Math.min(255, Math.round(rawReactionAreaRgb[2] * gainB)));

  const calibratedRgb: [number, number, number] = [calibratedR, calibratedG, calibratedB];

  // 4. Feature Extraction across RGB, HSV, and CIELAB color spaces
  const calibratedReactionColor = createColorSpaceValues(calibratedRgb);
  const rawReactionColor = createColorSpaceValues(rawReactionAreaRgb);

  const calibrationData: CalibrationData = {
    referenceCardDetected: isCardDetected,
    rawReferenceRgb: rawReferenceWhiteRgb,
    whiteBalanceGain: [gainR, gainG, gainB],
    ambientLuminance: Math.round(ambientLuminance),
    lightingCondition,
  };

  return {
    calibratedReactionColor,
    calibrationData,
    rawReactionColor,
  };
}
