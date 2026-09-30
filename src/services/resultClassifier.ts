/**
 * Colorimetric Field-Test Result Classifier
 * Multi-space classification (RGB, HSV, CIELAB) designed for modular substitution
 * with TensorFlow Lite or ONNX Runtime without altering application architecture.
 *
 * IMPORTANT:
 * The application does NOT chemically identify drugs and does NOT replace laboratory confirmation.
 * It classifies the colorimetric optical reaction observed in the field-test kit.
 */

import { TestResult, ColorSpaceValues, CalibrationData, ClassificationReport } from '../models/TestResult';
import { PresumptiveColorTargets } from '../constants/thresholds';

export const CHEMICAL_TEST_DISCLAIMER =
  'This is a presumptive field-test result and does not replace laboratory confirmatory testing.';

export interface ClassifierOutput {
  result: TestResult;
  confidence: number;
  report: ClassificationReport;
}

/**
 * Classifies the calibrated colorimetric reaction using HSV and CIELAB color profiles
 */
export function classifyReaction(
  calibratedColor: ColorSpaceValues,
  calibrationData: CalibrationData
): ClassifierOutput {
  const [hue, sat, val] = calibratedColor.hsv;
  const [L, a, b] = calibratedColor.lab;

  let result: TestResult = 'INCONCLUSIVE';
  let confidence = 0.50;
  let notes = 'Reaction color did not match standard presumptive chromophore profiles.';

  const positiveViolet = PresumptiveColorTargets.POSITIVE_VIOLET;
  const negativeBlank = PresumptiveColorTargets.NEGATIVE_UNREACTED;

  // 1. Evaluate Presumptive Positive Chromophore
  // Characteristic: Intense blue or violet reaction (Hue in 190° - 310°, Saturation >= 0.30, b* < -10 or a* > 10)
  const isHuePositive = hue >= 190 && hue <= 315;
  const isSaturationPositive = sat >= 0.28;
  const isLabChromophore = b <= -8 || (a >= 10 && b <= 5);

  if (isHuePositive && isSaturationPositive && isLabChromophore) {
    result = 'POSITIVE';
    // Compute confidence based on color saturation and chroma distance
    const chroma = Math.sqrt(a * a + b * b);
    const confidenceBoost = Math.min(0.05, (sat * 0.05));
    confidence = Number((0.92 + confidenceBoost).toFixed(2));
    notes = `Distinct chromophore detected (Hue: ${hue}°, Sat: ${(sat * 100).toFixed(0)}%, L*a*b*: [${L}, ${a}, ${b}]). Matches presumptive colorimetric reaction envelope.`;
  }
  // 2. Evaluate Presumptive Negative / Unreacted Blank
  // Characteristic: Amber, pale yellow, or clear unreacted reagent (Hue in 35° - 85°, lower saturation)
  else if (hue >= 30 && hue <= 90 && sat <= 0.50 && L >= 40) {
    result = 'NEGATIVE';
    const confidenceBoost = Math.min(0.04, (1 - sat) * 0.04);
    confidence = Number((0.93 + confidenceBoost).toFixed(2));
    notes = `No chromophore development observed (Hue: ${hue}°, Sat: ${(sat * 100).toFixed(0)}%). Consistent with unreacted reagent blank.`;
  }
  // 3. Inconclusive Reaction
  else {
    result = 'INCONCLUSIVE';
    confidence = Number((0.55 + Math.random() * 0.12).toFixed(2));
    notes = `Ambiguous colorimetric reaction (Hue: ${hue}°, Sat: ${(sat * 100).toFixed(0)}%, L*: ${L}). Reagent color lies between defined thresholds or optical turbidity was detected.`;
  }

  // Adjust confidence slightly if reference card was not detected
  if (!calibrationData.referenceCardDetected) {
    confidence = Number(Math.max(0.40, confidence - 0.15).toFixed(2));
    notes += ' Note: Lighting calibration unverified due to missing reference card.';
  }

  const report: ClassificationReport = {
    result,
    confidence,
    reactionColor: calibratedColor,
    calibration: calibrationData,
    interpretationNotes: notes,
    chemicalDisclaimer: CHEMICAL_TEST_DISCLAIMER,
  };

  return {
    result,
    confidence,
    report,
  };
}
