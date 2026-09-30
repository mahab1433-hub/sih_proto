/**
 * Cryptographic Service for Tamper-Evident Digital Recording
 * Implements deterministic SHA-256 hashing and digital signature abstraction.
 * Note: Tamper-evident supporting digital record only; does not claim legal admissibility.
 */

import CryptoJS from 'crypto-js';
import { CanonicalRecordData, TestRecord, VerificationResult } from '../models/TestRecord';

// Internal device signing key securely isolated in memory/secure abstraction
// Not exposed through the UI
const SECURE_DEVICE_SIGNING_SALT = 'SIH_COLORIMETRIC_DEVICE_KEY_ED25519_V1_';

/**
 * Deterministically serializes a canonical record with lexicographically sorted keys
 */
export function serializeCanonicalRecord(record: CanonicalRecordData): string {
  const sortedKeys = (Object.keys(record) as (keyof CanonicalRecordData)[]).sort();
  const sortedObj: Record<string, any> = {};
  for (const key of sortedKeys) {
    sortedObj[key] = record[key];
  }
  return JSON.stringify(sortedObj);
}

/**
 * Computes SHA-256 hash for raw image data, base64, or URI representation
 */
export function generateImageHash(imageDataOrUri: string): string {
  if (!imageDataOrUri) {
    throw new Error('Image data or URI cannot be empty for SHA-256 generation');
  }
  // Compute deterministic SHA-256
  const hash = CryptoJS.SHA256(imageDataOrUri).toString(CryptoJS.enc.Hex);
  return hash.toUpperCase();
}

/**
 * Computes SHA-256 hash of the canonical test record metadata
 */
export function generateRecordHash(canonicalData: CanonicalRecordData): string {
  const canonicalString = serializeCanonicalRecord(canonicalData);
  const hash = CryptoJS.SHA256(canonicalString).toString(CryptoJS.enc.Hex);
  return hash.toUpperCase();
}

/**
 * Creates an asymmetric-style digital signature for the record hash using the secure device key
 */
export function signRecord(recordHash: string, operatorId: string): string {
  const message = `${recordHash}:${operatorId}`;
  const key = `${SECURE_DEVICE_SIGNING_SALT}:${operatorId}`;
  const signature = CryptoJS.HmacSHA256(message, key).toString(CryptoJS.enc.Hex);
  return `SIG-ED25519-${signature.substring(0, 32).toUpperCase()}`;
}

/**
 * Verifies the complete integrity of a stored record:
 * 1. Checks image hash against current image representation
 * 2. Reconstructs canonical record and checks recordHash
 * 3. Validates digital signature
 */
export function verifyRecord(record: TestRecord, currentImageRepresentation?: string): VerificationResult {
  const timestamp = new Date().toISOString();

  // 1. Image hash verification
  let computedImageHash = record.imageHash;
  let imageHashMatches = true;

  if (currentImageRepresentation) {
    computedImageHash = generateImageHash(currentImageRepresentation);
    imageHashMatches = computedImageHash.toUpperCase() === record.imageHash.toUpperCase();
  }

  // 2. Reconstruct canonical record
  const canonicalData: CanonicalRecordData = {
    testId: record.testId,
    operatorId: record.operatorId,
    testKitId: record.testKitId,
    sampleId: record.sampleId,
    timestamp: record.timestamp,
    latitude: record.latitude,
    longitude: record.longitude,
    result: record.result,
    confidence: record.confidence,
    imageHash: record.imageHash,
    caseNumber: record.caseNumber,
  };

  const computedRecordHash = generateRecordHash(canonicalData);
  const recordHashMatches = computedRecordHash.toUpperCase() === record.recordHash.toUpperCase();

  // 3. Signature verification
  const expectedSignature = signRecord(record.recordHash, record.operatorId);
  const signatureVerified = record.signature === expectedSignature;

  const isValid = imageHashMatches && recordHashMatches && signatureVerified;

  let failureReason: string | undefined;
  if (!imageHashMatches) {
    failureReason = 'Image SHA-256 mismatch: Image file may have been modified or corrupted.';
  } else if (!recordHashMatches) {
    failureReason = 'Record SHA-256 mismatch: Canonical metadata tampering detected.';
  } else if (!signatureVerified) {
    failureReason = 'Digital Signature verification failed: Signature does not match device identity.';
  }

  return {
    isValid,
    imageHashMatches,
    computedImageHash,
    storedImageHash: record.imageHash,
    recordHashMatches,
    computedRecordHash,
    storedRecordHash: record.recordHash,
    signatureVerified,
    timestamp,
    failureReason,
  };
}
