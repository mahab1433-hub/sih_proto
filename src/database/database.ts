/**
 * SQLite Database Manager
 * Handles local offline storage for colorimetric field test records.
 */

import SQLite from 'react-native-sqlite-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

SQLite.enablePromise(true);

const DATABASE_NAME = 'ColorimetricFieldTest.db';
const FALLBACK_STORAGE_KEY = '@colorimetric_field_test_records_v1';

let dbInstance: SQLite.SQLiteDatabase | null = null;
let useFallbackStorage = false;

/**
 * Initializes the SQLite database and creates the test_records table
 */
export async function getDatabase(): Promise<SQLite.SQLiteDatabase | null> {
  if (useFallbackStorage) {
    return null;
  }

  if (dbInstance) {
    return dbInstance;
  }

  try {
    const db = await SQLite.openDatabase({
      name: DATABASE_NAME,
      location: 'default',
    });

    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS test_records (
        id TEXT PRIMARY KEY,
        testId TEXT UNIQUE NOT NULL,
        operatorId TEXT NOT NULL,
        testKitId TEXT NOT NULL,
        sampleId TEXT NOT NULL,
        caseNumber TEXT,
        timestamp TEXT NOT NULL,
        latitude REAL,
        longitude REAL,
        result TEXT NOT NULL,
        confidence REAL NOT NULL,
        imageUri TEXT NOT NULL,
        imageHash TEXT NOT NULL,
        recordHash TEXT NOT NULL,
        signature TEXT NOT NULL,
        verificationStatus TEXT NOT NULL,
        isDemo INTEGER DEFAULT 0,
        colorData TEXT,
        notes TEXT
      );
    `);

    // Create index for fast lookups
    await db.executeSql(`
      CREATE INDEX IF NOT EXISTS idx_test_id ON test_records (testId);
    `);
    await db.executeSql(`
      CREATE INDEX IF NOT EXISTS idx_operator_id ON test_records (operatorId);
    `);

    dbInstance = db;
    return dbInstance;
  } catch (error) {
    console.warn('Native SQLite initialization fallback to persistent async storage:', error);
    useFallbackStorage = true;
    return null;
  }
}

export function isUsingFallback(): boolean {
  return useFallbackStorage;
}

export { FALLBACK_STORAGE_KEY };
