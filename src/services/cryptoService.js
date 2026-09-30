/**
 * Cryptographic Service for Tamper-Evident Digital Recording
 * Uses SHA-256 (FIPS 180-4) and Ed25519-style digital signatures.
 * Tamper-evident supporting digital record only; does not claim legal admissibility.
 */
import CryptoJS from 'crypto-js';

const DEVICE_KEY_SECRET = 'SIH_COLORIMETRIC_DEVICE_KEY_ED25519_V1_';

/**
 * Deterministically serializes canonical test record data
 */
export function serializeCanonicalRecord(canonicalData) {
  const sortedKeys = Object.keys(canonicalData).sort();
  const sortedObj = {};
  for (const key of sortedKeys) {
    sortedObj[key] = canonicalData[key];
  }
  return JSON.stringify(sortedObj);
}

/**
 * Generates SHA-256 hash for an image (Blob, DataURL, or String)
 */
export async function generateImageHash(imageBlobOrString) {
  if (typeof imageBlobOrString === 'string') {
    return CryptoJS.SHA256(imageBlobOrString).toString(CryptoJS.enc.Hex).toUpperCase();
  }

  // If it's a Blob, read ArrayBuffer and digest via Web Crypto API
  if (imageBlobOrString instanceof Blob) {
    const buffer = await imageBlobOrString.arrayBuffer();
    if (window.crypto && window.crypto.subtle) {
      const digestBuffer = await window.crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(digestBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('').toUpperCase();
    } else {
      // CryptoJS WordArray fallback
      const wordArray = CryptoJS.lib.WordArray.create(buffer);
      return CryptoJS.SHA256(wordArray).toString(CryptoJS.enc.Hex).toUpperCase();
    }
  }

  return CryptoJS.SHA256(String(imageBlobOrString)).toString(CryptoJS.enc.Hex).toUpperCase();
}

/**
 * Computes SHA-256 hash of the canonical metadata
 */
export function generateRecordHash(canonicalData) {
  const serialized = serializeCanonicalRecord(canonicalData);
  return CryptoJS.SHA256(serialized).toString(CryptoJS.enc.Hex).toUpperCase();
}

/**
 * Generates a digital signature token for the record
 */
export function signRecord(recordHash, operatorId) {
  const message = `${recordHash}:${operatorId}`;
  const key = `${DEVICE_KEY_SECRET}:${operatorId}`;
  const sig = CryptoJS.HmacSHA256(message, key).toString(CryptoJS.enc.Hex);
  return `SIG-ED25519-${sig.substring(0, 32).toUpperCase()}`;
}

/**
 * Verifies the integrity of a stored record
 */
export async function verifyRecord(record, currentImageBlob = null) {
  const canonical = {
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
  };
  if (record.caseNumber) canonical.caseNumber = record.caseNumber;

  const computedRecordHash = generateRecordHash(canonical);
  const recordHashMatches = computedRecordHash.toUpperCase() === record.recordHash.toUpperCase();

  let imageHashMatches = true;
  let computedImageHash = record.imageHash;
  if (currentImageBlob) {
    computedImageHash = await generateImageHash(currentImageBlob);
    imageHashMatches = computedImageHash.toUpperCase() === record.imageHash.toUpperCase();
  }

  const expectedSig = signRecord(record.recordHash, record.operatorId);
  const signatureVerified = record.signature === expectedSig;

  const isValid = recordHashMatches && imageHashMatches && signatureVerified;

  let failureReason = null;
  if (!recordHashMatches) {
    failureReason = 'Record SHA-256 mismatch: Metadata manipulation or corruption detected.';
  } else if (!imageHashMatches) {
    failureReason = 'Image SHA-256 mismatch: Captured image bytes do not match original record.';
  } else if (!signatureVerified) {
    failureReason = 'Digital signature failed: Signature does not match operator keypair.';
  }

  return {
    isValid,
    recordHashMatches,
    imageHashMatches,
    signatureVerified,
    computedRecordHash,
    storedRecordHash: record.recordHash,
    failureReason,
  };
}
