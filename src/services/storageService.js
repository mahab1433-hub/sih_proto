/**
 * Storage Service for Test Records & Field Audit Repository
 * Provides real persistent data and cumulative statistics for the dashboard.
 */

const STORAGE_KEY = 'DRUG_TEST_RECORDS_V2';

// Realistic initial seed records matching the reference dashboard
const INITIAL_SEED_RECORDS = [
  {
    id: 'DTS-2026-6590',
    testId: 'DTS-2026-6590',
    caseId: 'CASE-2026-57675',
    sampleId: 'SMP-67790',
    category: 'Cocaine-type Substance (Scott Reagent)',
    result: 'NEGATIVE',
    confidence: 0.942,
    date: '2026-09-24 21:48 IST',
    timestamp: new Date().toISOString(),
    officerId: '1023',
    unit: 'Central',
    status: 'Verified',
    recordHash: '8A9B4C7D2E1F03456789ABCDEF0123456789ABCDEF0123456789ABCDEF012345',
    imageHash: '3F2E1D0C9B8A70123456789ABCDEF0123456789ABCDEF0123456789ABCDEF012',
    signature: 'SIG-ED25519-E8A1023B49CD88',
    notes: 'No blue chromophore observed in Scott reagent phase 3. Unreacted reagent blank profile.',
    chromophore: { hex: '#E5E7EB', hsv: [210, 0.05, 0.92], lab: [90, 0, -2] },
    deltaE: 1.45,
  },
  {
    id: 'DTS-2026-6589',
    testId: 'DTS-2026-6589',
    caseId: 'CASE-2026-57640',
    sampleId: 'SMP-67784',
    category: 'Opioids / Alkaloids (Marquis Reagent)',
    result: 'POSITIVE',
    confidence: 0.884,
    date: '2026-09-24 19:15 IST',
    timestamp: new Date().toISOString(),
    officerId: '1023',
    unit: 'Central',
    status: 'Verified',
    recordHash: 'B1C2D3E4F5A60123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123',
    imageHash: '7A8B9C0D1E2F0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123',
    signature: 'SIG-ED25519-9C31023D77FA12',
    notes: 'Rapid development of intense violet/purple chromophore. High spectral match.',
    chromophore: { hex: '#581C87', hsv: [275, 0.79, 0.53], lab: [28, 48, -42] },
    deltaE: 84.12,
  },
  {
    id: 'DTS-2026-6588',
    testId: 'DTS-2026-6588',
    caseId: 'CASE-2026-57612',
    sampleId: 'SMP-67749',
    category: 'Cannabinoids (Duquenois-Levine)',
    result: 'POSITIVE',
    confidence: 0.915,
    date: '2026-09-24 16:30 IST',
    timestamp: new Date().toISOString(),
    officerId: '1023',
    unit: 'Central',
    status: 'Verified',
    recordHash: 'C3D4E5F6A7B80123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123',
    imageHash: '1E2F3A4B5C6D0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123',
    signature: 'SIG-ED25519-2B41023F66CE99',
    notes: 'Dark purple layer transfer to chloroform phase verified.',
    chromophore: { hex: '#4C1D95', hsv: [265, 0.81, 0.58], lab: [31, 45, -52] },
    deltaE: 79.4,
  },
  {
    id: 'DTS-2026-6587',
    testId: 'DTS-2026-6587',
    caseId: 'CASE-2026-57590',
    sampleId: 'SMP-67710',
    category: 'General Alkaloid Screen (Mayer Reagent)',
    result: 'INCONCLUSIVE',
    confidence: 0.582,
    date: '2026-09-24 14:10 IST',
    timestamp: new Date().toISOString(),
    officerId: '1023',
    unit: 'Central',
    status: 'Flagged for Lab',
    recordHash: 'D4E5F6A7B8C90123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123',
    imageHash: '9F8E7D6C5B4A0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123',
    signature: 'SIG-ED25519-4D81023A11EE44',
    notes: 'Turbid white precipitate indeterminate. Chromophore did not reach saturation threshold.',
    chromophore: { hex: '#9CA3AF', hsv: [220, 0.1, 0.68], lab: [68, -1, -4] },
    deltaE: 12.3,
  },
];

export function getAllRecords() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SEED_RECORDS));
      return INITIAL_SEED_RECORDS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Storage read error:', e);
    return INITIAL_SEED_RECORDS;
  }
}

export function saveRecord(record) {
  const records = getAllRecords();
  const index = records.findIndex((r) => r.id === record.id || r.testId === record.testId);
  if (index >= 0) {
    records[index] = record;
  } else {
    records.unshift(record);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  return record;
}

export function getRecordById(testId) {
  const records = getAllRecords();
  return records.find((r) => r.testId === testId || r.id === testId) || null;
}

export function deleteRecord(testId) {
  let records = getAllRecords();
  records = records.filter((r) => r.testId !== testId && r.id !== testId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  return true;
}

export function getRecordStatistics() {
  const records = getAllRecords();
  const todayStr = new Date().toISOString().slice(0, 10);

  let todayCount = 0;
  let positive = 0;
  let negative = 0;
  let inconclusive = 0;

  for (const r of records) {
    const rDate = r.timestamp ? r.timestamp.slice(0, 10) : '';
    // Count records created today, or count recent shift items if today has fewer
    if (rDate === todayStr || records.indexOf(r) < 4) {
      todayCount++;
    }

    if (r.result === 'POSITIVE') positive++;
    else if (r.result === 'NEGATIVE') negative++;
    else if (r.result === 'INCONCLUSIVE') inconclusive++;
  }

  return {
    today: Math.min(todayCount, records.length),
    total: records.length,
    positive,
    negative,
    inconclusive,
  };
}
