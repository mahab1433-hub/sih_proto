import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Colors from '../constants/colors';
import ResultBadge from '../components/ResultBadge';
import {
  ShieldCheckIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  ClockIcon,
  MapPinIcon,
  HashIcon,
  UserIcon,
} from '../components/Icons';
import { TestRecord, VerificationResult } from '../models/TestRecord';
import { verifyRecord } from '../services/cryptoService';
import {
  updateVerificationStatus,
  deleteTestRecord,
} from '../database/testRecordRepository';
import { CHEMICAL_TEST_DISCLAIMER } from '../services/resultClassifier';

interface TestDetailsScreenProps {
  record: TestRecord;
  onBack: () => void;
  onRecordDeleted: () => void;
}

export const TestDetailsScreen: React.FC<TestDetailsScreenProps> = ({
  record: initialRecord,
  onBack,
  onRecordDeleted,
}) => {
  const [record, setRecord] = useState<TestRecord>(initialRecord);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);

  const handleVerifyRecord = () => {
    setIsVerifying(true);

    setTimeout(async () => {
      // 1. Recompute SHA-256 & verify canonical record integrity
      const result = verifyRecord(record);
      setVerificationResult(result);

      const newStatus = result.isValid ? 'VERIFIED' : 'FAILED';
      setRecord((prev) => ({ ...prev, verificationStatus: newStatus }));
      await updateVerificationStatus(record.id, newStatus);

      setIsVerifying(false);
    }, 600);
  };

  // Demonstration tool: Simulate tampering with the record to show the user how SHA-256 catches tampering
  const handleSimulateTampering = () => {
    Alert.alert(
      'Simulate Metadata Tampering',
      'This will secretly alter the test outcome in memory without updating the cryptographic hash, demonstrating cryptographic tamper detection.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Tamper Result',
          style: 'destructive',
          onPress: () => {
            const flippedResult = record.result === 'POSITIVE' ? 'NEGATIVE' : 'POSITIVE';
            setRecord((prev) => ({ ...prev, result: flippedResult }));
            setVerificationResult(null);
            Alert.alert('Tampered!', 'Result was flipped. Now tap "VERIFY RECORD" to see cryptographic detection in action.');
          },
        },
      ]
    );
  };

  const handleDelete = () => {
    Alert.alert('Delete Record', 'Are you sure you want to delete this test record from local SQLite storage?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteTestRecord(record.id);
          onRecordDeleted();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← History</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>AUDIT RECORD INSPECTOR</Text>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
          <Text style={styles.deleteBtnText}>Delete</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Verification Status Header Banner */}
        {verificationResult && (
          <View
            style={[
              styles.verificationBanner,
              verificationResult.isValid ? styles.verificationBannerSuccess : styles.verificationBannerFailed,
            ]}
          >
            {verificationResult.isValid ? (
              <CheckCircleIcon size={24} color={Colors.negative} />
            ) : (
              <AlertTriangleIcon size={24} color={Colors.positive} />
            )}
            <View style={styles.bannerTextContainer}>
              <Text
                style={[
                  styles.bannerTitle,
                  { color: verificationResult.isValid ? Colors.negative : Colors.positive },
                ]}
              >
                {verificationResult.isValid
                  ? '✓ Record Integrity Verified'
                  : '⚠ Record Integrity Check Failed'}
              </Text>
              <Text style={styles.bannerSubtitle}>
                {verificationResult.isValid
                  ? 'SHA-256 Image & Canonical hashes match. Digital signature confirmed intact.'
                  : verificationResult.failureReason || 'Cryptographic mismatch detected.'}
              </Text>
            </View>
          </View>
        )}

        {/* Primary Classification & Confidence */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.sectionHeaderLabel}>PRESUMPTIVE CLASSIFICATION</Text>
            {record.isDemo && (
              <View style={styles.demoPill}>
                <Text style={styles.demoPillText}>DEMO RECORD</Text>
              </View>
            )}
          </View>

          <View style={styles.badgeRow}>
            <ResultBadge
              result={record.result}
              confidence={record.confidence}
              size="large"
              showConfidence
            />
          </View>

          {record.colorData && (
            <View style={styles.colorDataRow}>
              <View style={[styles.swatch, { backgroundColor: record.colorData.hex }]} />
              <View style={styles.colorMeta}>
                <Text style={styles.colorHex}>Hex: {record.colorData.hex}</Text>
                <Text style={styles.colorSpaces}>
                  HSV: {record.colorData.hsv.join(', ')} • Lab: [{record.colorData.lab.join(', ')}]
                </Text>
              </View>
            </View>
          )}

          {record.notes && <Text style={styles.notesText}>{record.notes}</Text>}
        </View>

        {/* Core Field Identification */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Test Identification</Text>

          <View style={styles.fieldRow}>
            <Text style={styles.label}>Test ID</Text>
            <Text style={styles.valueHighlight}>{record.testId}</Text>
          </View>

          <View style={styles.fieldRow}>
            <Text style={styles.label}>Operator ID</Text>
            <Text style={styles.value}>{record.operatorId}</Text>
          </View>

          <View style={styles.fieldRow}>
            <Text style={styles.label}>Test Kit ID / Lot</Text>
            <Text style={styles.value}>{record.testKitId}</Text>
          </View>

          <View style={styles.fieldRow}>
            <Text style={styles.label}>Sample ID / Barcode</Text>
            <Text style={styles.value}>{record.sampleId}</Text>
          </View>

          {record.caseNumber && (
            <View style={styles.fieldRow}>
              <Text style={styles.label}>Case / Ref Number</Text>
              <Text style={styles.value}>{record.caseNumber}</Text>
            </View>
          )}

          <View style={styles.fieldRow}>
            <Text style={styles.label}>Timestamp</Text>
            <Text style={styles.value}>{record.timestamp}</Text>
          </View>

          <View style={styles.fieldRow}>
            <Text style={styles.label}>GPS Coordinates</Text>
            <Text style={styles.value}>
              {record.latitude !== null && record.longitude !== null
                ? `${record.latitude.toFixed(6)}° N, ${record.longitude.toFixed(6)}° E`
                : 'Location unavailable'}
            </Text>
          </View>

          <View style={[styles.fieldRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.label}>Captured Image URI</Text>
            <Text style={styles.valueMuted} numberOfLines={1}>{record.imageUri}</Text>
          </View>
        </View>

        {/* Cryptographic Hashes & Digital Signature */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Cryptographic Proofs</Text>

          {/* Image SHA-256 */}
          <View style={styles.hashBox}>
            <Text style={styles.hashTitle}>IMAGE SHA-256 HASH</Text>
            <Text style={styles.hashContent} selectable>{record.imageHash}</Text>
          </View>

          {/* Canonical Record Hash */}
          <View style={styles.hashBox}>
            <Text style={styles.hashTitle}>CANONICAL RECORD SHA-256 HASH</Text>
            <Text style={styles.hashContent} selectable>{record.recordHash}</Text>
          </View>

          {/* Digital Signature */}
          <View style={styles.hashBox}>
            <Text style={styles.hashTitle}>DIGITAL SIGNATURE</Text>
            <Text style={styles.hashContent} selectable>{record.signature}</Text>
          </View>
        </View>

        {/* Mandatory Regulatory Notice */}
        <View style={styles.disclaimerContainer}>
          <Text style={styles.disclaimerText}>
            {CHEMICAL_TEST_DISCLAIMER}
          </Text>
        </View>

        {/* Verification Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.verifyButton}
            onPress={handleVerifyRecord}
            disabled={isVerifying}
            activeOpacity={0.85}
          >
            {isVerifying ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <ShieldCheckIcon size={20} color="#FFFFFF" />
                <Text style={styles.verifyButtonText}>VERIFY RECORD INTEGRITY</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tamperSimBtn}
            onPress={handleSimulateTampering}
          >
            <Text style={styles.tamperSimText}>⚡ Simulate Tampering (Audit Test)</Text>
          </TouchableOpacity>
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
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder,
    backgroundColor: Colors.surface,
  },
  backBtn: {
    padding: 6,
  },
  backBtnText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  topBarTitle: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  deleteBtn: {
    padding: 6,
  },
  deleteBtnText: {
    color: Colors.positive,
    fontSize: 13,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  verificationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    marginBottom: 16,
  },
  verificationBannerSuccess: {
    backgroundColor: Colors.negativeMuted,
    borderColor: Colors.negativeBorder,
  },
  verificationBannerFailed: {
    backgroundColor: Colors.positiveMuted,
    borderColor: Colors.positiveBorder,
  },
  bannerTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  bannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  bannerSubtitle: {
    color: Colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionHeaderLabel: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  demoPill: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderColor: Colors.inconclusiveBorder,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  demoPillText: {
    color: Colors.inconclusive,
    fontSize: 10,
    fontWeight: '800',
  },
  badgeRow: {
    alignItems: 'center',
    marginVertical: 10,
  },
  colorDataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  swatch: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    marginRight: 10,
  },
  colorMeta: {
    flex: 1,
  },
  colorHex: {
    color: Colors.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  colorSpaces: {
    color: Colors.textMuted,
    fontSize: 10,
    marginTop: 2,
  },
  notesText: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 10,
    textAlign: 'center',
    lineHeight: 17,
  },
  cardTitle: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  label: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  value: {
    color: Colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  valueHighlight: {
    color: Colors.primaryLight,
    fontSize: 13,
    fontWeight: '800',
  },
  valueMuted: {
    color: Colors.textMuted,
    fontSize: 11,
    maxWidth: 180,
  },
  hashBox: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  hashTitle: {
    color: Colors.textMuted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  hashContent: {
    color: Colors.primaryLight,
    fontFamily: 'monospace',
    fontSize: 11,
    lineHeight: 16,
  },
  disclaimerContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  disclaimerText: {
    color: Colors.textMuted,
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
  actions: {
    gap: 10,
  },
  verifyButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginLeft: 8,
  },
  tamperSimBtn: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  tamperSimText: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
});

export default TestDetailsScreen;
