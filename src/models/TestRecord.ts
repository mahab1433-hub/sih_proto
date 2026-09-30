import { TestResult, ColorSpaceValues } from './TestResult';

export type VerificationStatus = 'VERIFIED' | 'FAILED' | 'PENDING';

export interface CanonicalRecordData {
  testId: string;
  operatorId: string;
  testKitId: string;
  sampleId: string;
  timestamp: string;
  latitude: number | null;
  longitude: number | null;
  result: TestResult;
  confidence: number;
  imageHash: string;
  caseNumber?: string;
}

export interface TestRecord {
  id: string;
  testId: string;
  operatorId: string;
  testKitId: string;
  sampleId: string;
  caseNumber?: string;
  timestamp: string;
  latitude: number | null;
  longitude: number | null;
  result: TestResult;
  confidence: number;
  imageUri: string;
  imageHash: string;
  recordHash: string;
  signature: string;
  verificationStatus: VerificationStatus;
  isDemo?: boolean;
  colorData?: ColorSpaceValues;
  notes?: string;
}

export interface VerificationResult {
  isValid: boolean;
  imageHashMatches: boolean;
  computedImageHash: string;
  storedImageHash: string;
  recordHashMatches: boolean;
  computedRecordHash: string;
  storedRecordHash: string;
  signatureVerified: boolean;
  timestamp: string;
  failureReason?: string;
}
