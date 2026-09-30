// Configurable Calibration and Classification Thresholds

export interface ColorTarget {
  name: string;
  expectedRgb: [number, number, number];
  expectedHsv: [number, number, number];
  expectedLab: [number, number, number];
  tolerance: number;
}

export const CalibrationThresholds = {
  // Exposure & Lighting thresholds (0 - 255 luminance scale)
  minLuminance: 40,   // Flag underexposure/darkness
  maxLuminance: 235,  // Flag overexposure/glare
  minContrastRatio: 1.8,
  
  // Reference Colour Card detection requirements
  minReferenceAreaRatio: 0.04, // Card must occupy at least 4% of ROI
  maxSpecularGlareRatio: 0.12, // Max allowed saturated white specular reflection
  
  // Reference White and Neutral Grey Targets (Standard CIE D65 / Calibration Card)
  standardReferenceWhite: {
    rgb: [245, 245, 245] as [number, number, number],
    lab: [96.0, 0.0, 0.0] as [number, number, number],
  },
  standardReferenceGrey: {
    rgb: [128, 128, 128] as [number, number, number],
    lab: [53.5, 0.0, 0.0] as [number, number, number],
  },
};

// Presumptive Colorimetric Reaction Target Definitions (RGB / HSV / Lab)
// Example: Cobalt Thiocyanate / Scott's Reagent (Blue precipitate/reaction)
// Marquis Reagent (Purple/Violet reaction)
// Mecke Reagent (Green to Dark Brown)
export const PresumptiveColorTargets = {
  // Positive Reaction Profiles (e.g., Intense Blue or Purple/Violet chromophores)
  POSITIVE_VIOLET: {
    name: 'Cobalt/Marquis Chromophore (Intense Blue/Violet)',
    minHue: 200,
    maxHue: 300,
    minSaturation: 0.35,
    minLab_b_negative: -15, // strong blue chromophore in Lab space (negative b*)
    confidenceBaseline: 0.94,
  },
  // Negative Reaction Profiles (e.g., Light yellow, pale amber, or unchanged reagent blank)
  NEGATIVE_UNREACTED: {
    name: 'Unreacted Field Reagent / Reagent Blank (Clear / Pale Amber)',
    minHue: 35,
    maxHue: 75,
    maxSaturation: 0.40,
    confidenceBaseline: 0.96,
  },
  // Inconclusive Profile (indeterminate hue, low saturation, or out-of-gamut)
  INCONCLUSIVE_RANGE: {
    name: 'Indeterminate Reaction / Optical Turbidity',
    confidenceBaseline: 0.62,
  },
};
