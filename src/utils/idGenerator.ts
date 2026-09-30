/**
 * Standard ID Generator for Field-Test Units
 */

let counter = 1;

export function generateTestId(): string {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  return `FT-${year}-${randomSuffix}`;
}

export function generateSampleId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `SMP-${code}`;
}

export function generateTestKitId(): string {
  const batch = Math.floor(100 + Math.random() * 900);
  const lot = Math.floor(10 + Math.random() * 90);
  return `TK-${batch}-L${lot}`;
}
