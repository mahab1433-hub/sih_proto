/**
 * Test Record Repository
 * Provides CRUD, searching, and filtering operations on test records
 * with unified support for SQLite and fallback offline storage.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { TestRecord, VerificationStatus } from '../models/TestRecord';
import { getDatabase, FALLBACK_STORAGE_KEY } from './database';

export interface RecordStatistics {
  total: number;
  positive: number;
  negative: number;
  inconclusive: number;
}

/**
 * Creates a new test record in the database
 */
export async function createTestRecord(record: TestRecord): Promise<TestRecord> {
  const db = await getDatabase();

  if (db) {
    try {
      await db.executeSql(
        `INSERT OR REPLACE INTO test_records (
          id, testId, operatorId, testKitId, sampleId, caseNumber,
          timestamp, latitude, longitude, result, confidence,
          imageUri, imageHash, recordHash, signature, verificationStatus,
          isDemo, colorData, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          record.id,
          record.testId,
          record.operatorId,
          record.testKitId,
          record.sampleId,
          record.caseNumber || '',
          record.timestamp,
          record.latitude,
          record.longitude,
          record.result,
          record.confidence,
          record.imageUri,
          record.imageHash,
          record.recordHash,
          record.signature,
          record.verificationStatus,
          record.isDemo ? 1 : 0,
          record.colorData ? JSON.stringify(record.colorData) : null,
          record.notes || '',
        ]
      );
      return record;
    } catch (err) {
      console.warn('SQLite insert error, falling back to local storage:', err);
    }
  }

  // Fallback persistent storage
  const existing = await getFallbackRecords();
  const index = existing.findIndex((r) => r.id === record.id || r.testId === record.testId);
  if (index >= 0) {
    existing[index] = record;
  } else {
    existing.unshift(record);
  }
  await saveFallbackRecords(existing);
  return record;
}

/**
 * Retrieves all test records ordered by most recent
 */
export async function getTestRecords(): Promise<TestRecord[]> {
  const db = await getDatabase();

  if (db) {
    try {
      const results = await db.executeSql(
        'SELECT * FROM test_records ORDER BY timestamp DESC;'
      );
      const records: TestRecord[] = [];
      const rows = results[0].rows;
      for (let i = 0; i < rows.length; i++) {
        const item = rows.item(i);
        records.push(mapRowToRecord(item));
      }
      return records;
    } catch (err) {
      console.warn('SQLite read error, using fallback:', err);
    }
  }

  return getFallbackRecords();
}

/**
 * Retrieves a single test record by internal ID or Test ID
 */
export async function getTestRecordById(idOrTestId: string): Promise<TestRecord | null> {
  const db = await getDatabase();

  if (db) {
    try {
      const results = await db.executeSql(
        'SELECT * FROM test_records WHERE id = ? OR testId = ? LIMIT 1;',
        [idOrTestId, idOrTestId]
      );
      if (results[0].rows.length > 0) {
        return mapRowToRecord(results[0].rows.item(0));
      }
      return null;
    } catch (err) {
      console.warn('SQLite find error:', err);
    }
  }

  const list = await getFallbackRecords();
  return list.find((r) => r.id === idOrTestId || r.testId === idOrTestId) || null;
}

/**
 * Searches test records by Test ID, Operator ID, Test Kit ID, or Sample ID, with optional result filter
 */
export async function searchTestRecords(
  query: string,
  filterResult?: 'ALL' | 'POSITIVE' | 'NEGATIVE' | 'INCONCLUSIVE'
): Promise<TestRecord[]> {
  const allRecords = await getTestRecords();
  const cleanQuery = (query || '').trim().toLowerCase();

  return allRecords.filter((record) => {
    // 1. Result filter
    if (filterResult && filterResult !== 'ALL') {
      if (record.result !== filterResult) {
        return false;
      }
    }

    // 2. Query filter
    if (!cleanQuery) return true;

    return (
      record.testId.toLowerCase().includes(cleanQuery) ||
      record.operatorId.toLowerCase().includes(cleanQuery) ||
      record.testKitId.toLowerCase().includes(cleanQuery) ||
      record.sampleId.toLowerCase().includes(cleanQuery) ||
      (record.caseNumber && record.caseNumber.toLowerCase().includes(cleanQuery))
    );
  });
}

/**
 * Deletes a test record by ID
 */
export async function deleteTestRecord(id: string): Promise<boolean> {
  const db = await getDatabase();

  if (db) {
    try {
      await db.executeSql('DELETE FROM test_records WHERE id = ? OR testId = ?;', [id, id]);
    } catch (err) {
      console.warn('SQLite delete error:', err);
    }
  }

  const list = await getFallbackRecords();
  const filtered = list.filter((r) => r.id !== id && r.testId !== id);
  await saveFallbackRecords(filtered);
  return true;
}

/**
 * Updates verification status for a test record
 */
export async function updateVerificationStatus(
  id: string,
  status: VerificationStatus
): Promise<boolean> {
  const db = await getDatabase();

  if (db) {
    try {
      await db.executeSql(
        'UPDATE test_records SET verificationStatus = ? WHERE id = ? OR testId = ?;',
        [status, id, id]
      );
    } catch (err) {
      console.warn('SQLite update error:', err);
    }
  }

  const list = await getFallbackRecords();
  const record = list.find((r) => r.id === id || r.testId === id);
  if (record) {
    record.verificationStatus = status;
    await saveFallbackRecords(list);
  }
  return true;
}

/**
 * Calculates dashboard statistics
 */
export async function getRecordStatistics(): Promise<RecordStatistics> {
  const records = await getTestRecords();

  let positive = 0;
  let negative = 0;
  let inconclusive = 0;

  for (const r of records) {
    if (r.result === 'POSITIVE') positive++;
    else if (r.result === 'NEGATIVE') negative++;
    else if (r.result === 'INCONCLUSIVE') inconclusive++;
  }

  return {
    total: records.length,
    positive,
    negative,
    inconclusive,
  };
}

// Helpers
function mapRowToRecord(row: any): TestRecord {
  return {
    id: row.id,
    testId: row.testId,
    operatorId: row.operatorId,
    testKitId: row.testKitId,
    sampleId: row.sampleId,
    caseNumber: row.caseNumber || undefined,
    timestamp: row.timestamp,
    latitude: row.latitude !== null ? Number(row.latitude) : null,
    longitude: row.longitude !== null ? Number(row.longitude) : null,
    result: row.result,
    confidence: Number(row.confidence),
    imageUri: row.imageUri,
    imageHash: row.imageHash,
    recordHash: row.recordHash,
    signature: row.signature,
    verificationStatus: row.verificationStatus,
    isDemo: Boolean(row.isDemo),
    colorData: row.colorData ? JSON.parse(row.colorData) : undefined,
    notes: row.notes || undefined,
  };
}

async function getFallbackRecords(): Promise<TestRecord[]> {
  try {
    const raw = await AsyncStorage.getItem(FALLBACK_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.warn('Fallback storage read error:', err);
    return [];
  }
}

async function saveFallbackRecords(records: TestRecord[]): Promise<void> {
  try {
    await AsyncStorage.setItem(FALLBACK_STORAGE_KEY, JSON.stringify(records));
  } catch (err) {
    console.warn('Fallback storage write error:', err);
  }
}
