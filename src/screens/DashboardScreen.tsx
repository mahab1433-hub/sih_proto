import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
} from 'react-native';
import Colors from '../constants/colors';
import { StatCard } from '../components/StatCard';
import { TestCard } from '../components/TestCard';
import { ShieldCheckIcon, PlusIcon } from '../components/Icons';
import { TestRecord } from '../models/TestRecord';
import {
  getTestRecords,
  getRecordStatistics,
  RecordStatistics,
  createTestRecord,
} from '../database/testRecordRepository';
import { generateImageHash, generateRecordHash, signRecord } from '../services/cryptoService';
import { generateTestId, generateSampleId, generateTestKitId } from '../utils/idGenerator';

interface DashboardScreenProps {
  operatorId: string;
  onNavigateNewTest: () => void;
  onNavigateRecordDetails: (record: TestRecord) => void;
  onNavigateHistory: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  operatorId,
  onNavigateNewTest,
  onNavigateRecordDetails,
  onNavigateHistory,
}) => {
  const [stats, setStats] = useState<RecordStatistics>({
    total: 0,
    positive: 0,
    negative: 0,
    inconclusive: 0,
  });
  const [recentRecords, setRecentRecords] = useState<TestRecord[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const currentStats = await getRecordStatistics();
      setStats(currentStats);

      const allRecords = await getTestRecords();
      setRecentRecords(allRecords.slice(0, 5));
    } catch (error) {
      console.warn('Error loading dashboard data:', error);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Seed sample initial records if the database is completely empty
  const handleSeedDemoRecords = async () => {
    const timestamp = new Date().toISOString();
    const demoTestId = generateTestId();
    const demoKit = generateTestKitId();
    const demoSample = generateSampleId();
    const imageHash = generateImageHash(`DEMO_SAMPLE_IMAGE_${demoTestId}`);

    const canonical = {
      testId: demoTestId,
      operatorId,
      testKitId: demoKit,
      sampleId: demoSample,
      timestamp,
      latitude: 28.6139,
      longitude: 77.2090,
      result: 'POSITIVE' as const,
      confidence: 0.95,
      imageHash,
    };

    const recordHash = generateRecordHash(canonical);
    const signature = signRecord(recordHash, operatorId);

    const record: TestRecord = {
      id: demoTestId,
      ...canonical,
      recordHash,
      signature,
      verificationStatus: 'VERIFIED',
      imageUri: 'demo://sample_positive_violet.png',
      isDemo: true,
      notes: 'Calibrated Cobalt Thiocyanate Presumptive Positive reaction.',
    };

    await createTestRecord(record);
    await loadData();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Top App Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>FIELD TESTING SYSTEM</Text>
          <Text style={styles.headerSubtitle}>
            Operator: <Text style={styles.operatorIdHighlight}>{operatorId}</Text>
          </Text>
        </View>
        <View style={styles.systemStatusPill}>
          <View style={styles.statusDot} />
          <Text style={styles.statusPillText}>READY</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primaryLight} />
        }
      >
        {/* Primary Action Button: + NEW TEST */}
        <TouchableOpacity
          style={styles.newTestButton}
          onPress={onNavigateNewTest}
          activeOpacity={0.85}
        >
          <View style={styles.newTestButtonInner}>
            <View style={styles.plusIconCircle}>
              <PlusIcon size={24} color="#FFFFFF" />
            </View>
            <View style={styles.buttonTextContainer}>
              <Text style={styles.newTestTitle}>+ NEW TEST</Text>
              <Text style={styles.newTestSubtitle}>Start Camera Calibration & Analysis</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Dashboard Statistics Overview */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Overview Statistics</Text>
          <Text style={styles.sectionBadge}>Field Cumulative</Text>
        </View>

        <View style={styles.statsRow}>
          <StatCard label="Total" count={stats.total} color={Colors.primaryLight} />
          <StatCard label="Positive" count={stats.positive} color={Colors.positive} />
          <StatCard label="Negative" count={stats.negative} color={Colors.negative} />
          <StatCard label="Inconclusive" count={stats.inconclusive} color={Colors.inconclusive} />
        </View>

        {/* Recent Tests Section */}
        <View style={[styles.sectionHeader, { marginTop: 24 }]}>
          <Text style={styles.sectionTitle}>Recent Field Tests</Text>
          <TouchableOpacity onPress={onNavigateHistory}>
            <Text style={styles.viewAllText}>View All History →</Text>
          </TouchableOpacity>
        </View>

        {recentRecords.length === 0 ? (
          <View style={styles.emptyCard}>
            <ShieldCheckIcon size={36} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No field tests recorded yet</Text>
            <Text style={styles.emptySubtitle}>
              Tap "+ NEW TEST" above to perform optical capture or load a demo record.
            </Text>
            <TouchableOpacity
              style={styles.seedButton}
              onPress={handleSeedDemoRecords}
            >
              <Text style={styles.seedButtonText}>+ Generate Sample Demo Record</Text>
            </TouchableOpacity>
          </View>
        ) : (
          recentRecords.map((record) => (
            <TestCard
              key={record.id || record.testId}
              record={record}
              onPress={() => onNavigateRecordDetails(record)}
            />
          ))
        )}

        {/* Legal and Technical Disclaimer */}
        <View style={styles.disclaimerBox}>
          <Text style={styles.disclaimerText}>
            Notice: This system performs optical classification of colorimetric reactions. It does not replace laboratory confirmation.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder,
    backgroundColor: Colors.surface,
  },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  headerSubtitle: {
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  operatorIdHighlight: {
    color: Colors.primaryLight,
    fontWeight: '700',
  },
  systemStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primaryDark,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.guideActive,
    marginRight: 6,
  },
  statusPillText: {
    color: Colors.primaryLight,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 40,
  },
  newTestButton: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  newTestButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  plusIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  buttonTextContainer: {
    flex: 1,
  },
  newTestTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1,
  },
  newTestSubtitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  sectionBadge: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  viewAllText: {
    color: Colors.primaryLight,
    fontSize: 13,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: -4,
  },
  emptyCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    padding: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    marginTop: 12,
  },
  emptySubtitle: {
    color: Colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    maxWidth: 260,
  },
  seedButton: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primaryDark,
  },
  seedButtonText: {
    color: Colors.primaryLight,
    fontSize: 12,
    fontWeight: '700',
  },
  disclaimerBox: {
    marginTop: 24,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  disclaimerText: {
    color: Colors.textMuted,
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 14,
  },
});

export default DashboardScreen;
