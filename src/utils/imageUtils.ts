/**
 * Color Science and Image Processing Utilities
 * Supports RGB, HSV, and CIELAB (L*a*b*) color space conversions.
 */

import { ColorSpaceValues } from '../models/TestResult';

/**
 * Calculates perceived relative luminance from RGB (0-255)
 * Rec. 709 formula: Y = 0.2126*R + 0.7152*G + 0.0722*B
 */
export function calculateLuminance(rgb: [number, number, number]): number {
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}

/**
 * Converts RGB [0-255] to HSV [H: 0-360, S: 0-1, V: 0-1]
 */
export function rgbToHsv(rgb: [number, number, number]): [number, number, number] {
  const r = rgb[0] / 255;
  const g = rgb[1] / 255;
  const b = rgb[2] / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;

  let h = 0;
  if (diff === 0) {
    h = 0;
  } else if (max === r) {
    h = ((g - b) / diff) % 6;
  } else if (max === g) {
    h = (b - r) / diff + 2;
  } else {
    h = (r - g) / diff + 4;
  }

  h = Math.round(h * 60);
  if (h < 0) h += 360;

  const s = max === 0 ? 0 : diff / max;
  const v = max;

  return [h, Number(s.toFixed(3)), Number(v.toFixed(3))];
}

/**
 * Converts RGB [0-255] to CIELAB [L*: 0-100, a*: -128..127, b*: -128..127]
 * Standard Illuminant D65 reference white
 */
export function rgbToLab(rgb: [number, number, number]): [number, number, number] {
  // 1. Convert sRGB to linear RGB
  let r = rgb[0] / 255;
  let g = rgb[1] / 255;
  let b = rgb[2] / 255;

  r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

  // 2. Convert Linear RGB to XYZ (D65 illuminant matrix)
  const x = (r * 0.4124564 + g * 0.3575761 + b * 0.1804375) * 100;
  const y = (r * 0.2126729 + g * 0.7151522 + b * 0.0721750) * 100;
  const z = (r * 0.0193339 + g * 0.1191920 + b * 0.9503041) * 100;

  // D65 Standard White Reference values
  const xRef = 95.047;
  const yRef = 100.000;
  const zRef = 108.883;

  let xr = x / xRef;
  let yr = y / yRef;
  let zr = z / zRef;

  const epsilon = 0.008856; // (6/29)^3
  const kappa = 903.3;      // (29/3)^3

  const fx = xr > epsilon ? Math.cbrt(xr) : (kappa * xr + 16) / 116;
  const fy = yr > epsilon ? Math.cbrt(yr) : (kappa * yr + 16) / 116;
  const fz = zr > epsilon ? Math.cbrt(zr) : (kappa * zr + 16) / 116;

  const L = Math.max(0, Math.min(100, 116 * fy - 16));
  const a = 500 * (fx - fy);
  const lab_b = 200 * (fy - fz);

  return [Number(L.toFixed(2)), Number(a.toFixed(2)), Number(lab_b.toFixed(2))];
}

/**
 * Converts RGB to HEX color code
 */
export function rgbToHex(rgb: [number, number, number]): string {
  const toHex = (c: number) => {
    const clamped = Math.max(0, Math.min(255, Math.round(c)));
    const hex = clamped.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(rgb[0])}${toHex(rgb[1])}${toHex(rgb[2])}`.toUpperCase();
}

/**
 * Calculates CIE76 Color Difference (Delta E) between two Lab coordinates
 */
export function deltaE76(lab1: [number, number, number], lab2: [number, number, number]): number {
  const dL = lab1[0] - lab2[0];
  const da = lab1[1] - lab2[1];
  const db = lab1[2] - lab2[2];
  return Math.sqrt(dL * dL + da * da + db * db);
}

/**
 * Packs all color space representations into a unified structure
 */
export function createColorSpaceValues(rgb: [number, number, number]): ColorSpaceValues {
  return {
    rgb,
    hsv: rgbToHsv(rgb),
    lab: rgbToLab(rgb),
    hex: rgbToHex(rgb),
  };
}
