export type TestResult = 'POSITIVE' | 'NEGATIVE' | 'INCONCLUSIVE';

export interface ColorSpaceValues {
  rgb: [number, number, number]; // [R, G, B] 0-255
  hsv: [number, number, number]; // [H 0-360, S 0-1, V 0-1]
  lab: [number, number, number]; // [L* 0-100, a* -128..127, b* -128..127]
  hex: string;
}

export interface CalibrationData {
  referenceCardDetected: boolean;
  rawReferenceRgb: [number, number, number];
  whiteBalanceGain: [number, number, number]; // [gainR, gainG, gainB]
  ambientLuminance: number; // 0-255
  lightingCondition: 'OPTIMAL' | 'LOW_LIGHT' | 'OVEREXPOSED' | 'DIFFUSE';
}

export interface ClassificationReport {
  result: TestResult;
  confidence: number;
  reactionColor: ColorSpaceValues;
  calibration: CalibrationData;
  interpretationNotes: string;
  chemicalDisclaimer: string;
}
