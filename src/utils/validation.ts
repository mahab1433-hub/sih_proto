/**
 * Form and Input Validation Utilities
 */

export interface FormValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateTestInfoForm(fields: {
  operatorId: string;
  testKitId: string;
  sampleId: string;
}): FormValidationResult {
  const errors: Record<string, string> = {};

  if (!fields.operatorId || fields.operatorId.trim().length === 0) {
    errors.operatorId = 'Operator ID is required';
  }

  if (!fields.testKitId || fields.testKitId.trim().length === 0) {
    errors.testKitId = 'Test Kit ID is required';
  } else if (fields.testKitId.trim().length < 3) {
    errors.testKitId = 'Test Kit ID must be at least 3 characters';
  }

  if (!fields.sampleId || fields.sampleId.trim().length === 0) {
    errors.sampleId = 'Sample ID is required';
  } else if (fields.sampleId.trim().length < 3) {
    errors.sampleId = 'Sample ID must be at least 3 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}
