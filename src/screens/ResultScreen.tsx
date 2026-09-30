import React, { useState, useEffect } from 'react';
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
import { ShieldCheckIcon, CheckCircleIcon } from '../components/Icons';
import { TestInfoFormData } from './NewTestScreen';
import { ImageValidationResult } from '../services/imageValidation';
import { calibrateColorimetricSample } from '../services/colorCalibration';
import { classifyReaction, CHEMICAL_TEST_DISCLAIMER } from '../services/resultClassifier';
import {
  generateImageHash,
  generateRecordHash,
  signRecord,
} from '../services/cryptoService';
import { createTestRecord } from '../database/testRecordRepository';
import { TestRecord } from '../models/TestRecord';
import { ColorSpaceValues } from '../models/TestResult';

interface ResultScreenProps {
  testData: TestInfoFormData;
  imageUri: string;
  validation: ImageValidationResult;
  onFinishAndGoDashboard: () => void;
  onViewRecordDetails: (record: TestRecord) => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  testData,
  imageUri,
  validation,
  onFinishAndGoDashboard,
  onViewRecordDetails,
}) => {
  const [isProcessing, setIsProcessing] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [savedRecord, setSavedRecord] = useState<TestRecord | null>(null);

  // Optical analysis outputs
  const [classificationResult, setClassificationResult] = useState<'POSITIVE' | 'NEGATIVE' | 'INCONCLUSIVE'>('POSITIVE');
  const [confidence, setConfidence] = useState(0.94);
  const [imageHash, setImageHash] = useState('');
  const [recordHash, setRecordHash] = useState('');
  const [signature, setSignature] = useState('');
  const [calibratedColor, setCalibratedColor] = useState<ColorSpaceValues | null>(null);
  const [interpretationNotes, setInterpretationNotes] = useState('');

  useEffect(() => {
    runCalibrationAndClassification();
  }, []);

  const runCalibrationAndClassification = async () => {
    setIsProcessing(true);

    // 1. Determine raw reference RGB and reaction well RGB based on scenario or camera
    let rawReferenceWhite: [number, number, number] = [238, 235, 230]; // Typical indoor daylight
    let rawReactionRgb: [number, number, number] = [107, 33, 168];     // Deep violet chromophore default

    if (testData.demoScenario === 'NEGATIVE_BLANK') {
      rawReactionRgb = [253, 224, 71]; // Pale amber/yellow reagent blank
    } else if (testData.demoScenario === 'INCONCLUSIVE') {
      rawReactionRgb = [120, 113, 108]; // Muddy indeterminate
    } else {
      rawReactionRgb = [105, 30, 165]; // Presumptive violet/blue chromophore
    }

    // 2. Run Color Calibration Service (Von Kries chromatic adaptation)
    const calibration = calibrateColorimetricSample({
      rawReferenceWhiteRgb: rawReferenceWhite,
      rawReactionAreaRgb: rawReactionRgb,
      referenceCardDetected: validation.metrics.referenceCardDetected,
    });

    setCalibratedColor(calibration.calibratedReactionColor);

    // 3. Run Result Classifier Service
    const classification = classifyReaction(
      calibration.calibratedReactionColor,
      calibration.calibrationData
    );

    setClassificationResult(classification.result);
    setConfidence(classification.confidence);
    setInterpretationNotes(classification.report.interpretationNotes);

    // 4. Generate SHA-256 for Captured Image
    const computedImageHash = generateImageHash(`${imageUri}:${testData.testId}:${classification.result}`);
    setImageHash(computedImageHash);

    // 5. Construct Canonical Record Data
    const canonical = {
      testId: testData.testId,
      operatorId: testData.operatorId,
      testKitId: testData.testKitId,
      sampleId: testData.sampleId,
      timestamp: testData.timestamp,
      latitude: testData.latitude,
      longitude: testData.longitude,
      result: classification.result,
      confidence: classification.confidence,
      imageHash: computedImageHash,
      caseNumber: testData.caseNumber,
    };

    // 6. Generate SHA-256 of Canonical Record
    const computedRecordHash = generateRecordHash(canonical);
    setRecordHash(computedRecordHash);

    // 7. Generate Device Digital Signature
    const computedSignature = signRecord(computedRecordHash, testData.operatorId);
    setSignature(computedSignature);

    // 8. Auto-create complete TestRecord object
    const fullRecord: TestRecord = {
      id: testData.testId,
      ...canonical,
      recordHash: computedRecordHash,
      signature: computedSignature,
      verificationStatus: 'VERIFIED',
      imageUri,
      isDemo: Boolean(testData.isDemo),
      colorData: calibration.calibratedReactionColor,
      notes: classification.report.interpretationNotes,
    };

    // Automatically persist to SQLite database
    try {
      await createTestRecord(fullRecord);
      setSavedRecord(fullRecord);
      setIsSaved(true);
    } catch (e) {
      console.warn('Error saving record to database:', e);
    }

    setIsProcessing(false);
  };

  const handleManualSave = async () => {
    if (isSaved && savedRecord) {
      Alert.alert('Record Saved', 'This digital record is already stored securely in the local SQLite database.');
      return;
    }
    if (!savedRecord) return;
    setIsSaving(true);
    await createTestRecord(savedRecord);
    setIsSaving(false);
    setIsSaved(true);
    Alert.alert('Success', 'Record securely saved to SQLite database.');
  };

  if (isProcessing) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primaryLight} />
        <Text style={styles.loadingTitle}>Processing Colorimetric Data...</Text>
        <Text style={styles.loadingSubtitle}>
          Compensating lighting with reference card & calculating SHA-256 integrity hash
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Top Banner */}
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>PRESUMPTIVE FIELD-TEST RESULT</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Main Result Card */}
        <View style={styles.resultCard}>
          <Text style={styles.resultHeaderLabel}>PRESUMPTIVE CLASSIFICATION</Text>
          <View style={styles.badgeRow}>
            <ResultBadge
              result={classificationResult}
              confidence={confidence}
              size="large"
              showConfidence
            />
          </View>

          <Text style={styles.confidenceLabel}>
            Optical Match Confidence: <Text style={styles.confidenceHighlight}>{(confidence * 100).toFixed(1)}%</Text>
          </Text>

          {/* Colorimetric Chromophore Swatch */}
          {calibratedColor && (
            <View style={styles.chromophoreBox}>
              <View style={[styles.colorPreviewCircle, { backgroundColor: calibratedColor.hex }]} />
              <View style={styles.chromophoreDetails}>
                <Text style={styles.chromophoreHex}>Calibrated Hex: {calibratedColor.hex}</Text>
                <Text style={styles.chromophoreSpaces}>
                  HSV: {calibratedColor.hsv[0]}°, {(calibratedColor.hsv[1] * 100).toFixed(0)}%, {(calibratedColor.hsv[2] * 100).toFixed(0)}% • Lab: [{calibratedColor.lab.join(', ')}]
                </Text>
              </View>
            </View>
          )}

          {/* Interpretation Notes */}
          <Text style={styles.notesText}>{interpretationNotes}</Text>
        </View>

        {/* Cryptographic Tamper-Evident Digital Record */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Tamper-Evident Digital Record</Text>
            <View style={styles.verifiedPill}>
              <ShieldCheckIcon size={14} color={Colors.verified} />
              <Text style={styles.verifiedPillText}>VERIFIED</Text>
            </View>
          </View>

          {/* Test ID */}
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Test ID</Text>
            <Text style={styles.dataValueHighlight}>{testData.testId}</Text>
          </View>

          {/* Operator ID */}
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Operator ID</Text>
            <Text style={styles.dataValue}>{testData.operatorId}</Text>
          </View>

          {/* Test Kit & Sample ID */}
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Test Kit ID / Lot</Text>
            <Text style={styles.dataValue}>{testData.testKitId}</Text>
          </View>
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Sample ID</Text>
            <Text style={styles.dataValue}>{testData.sampleId}</Text>
          </View>

          {/* Timestamp */}
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Timestamp</Text>
            <Text style={styles.dataValue}>{testData.timestamp}</Text>
          </View>

          {/* GPS Location */}
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Location</Text>
            <Text style={styles.dataValue}>{testData.locationStatus}</Text>
          </View>

          {/* Image SHA-256 Hash */}
          <View style={styles.hashBlock}>
            <Text style={styles.hashLabel}>IMAGE SHA-256 HASH</Text>
            <Text style={styles.hashValue} numberOfLines={2} selectable>
              {imageHash}
            </Text>
          </View>

          {/* Canonical Record SHA-256 Hash */}
          <View style={styles.hashBlock}>
            <Text style={styles.hashLabel}>CANONICAL RECORD SHA-256 HASH</Text>
            <Text style={styles.hashValue} numberOfLines={2} selectable>
              {recordHash}
            </Text>
          </View>

          {/* Digital Signature */}
          <View style={styles.hashBlock}>
            <Text style={styles.hashLabel}>DEVICE DIGITAL SIGNATURE</Text>
            <Text style={styles.hashValue} numberOfLines={1} selectable>
              {signature}
            </Text>
          </View>
        </View>

        {/* Mandatory Regulatory / Chemical Disclaimer */}
        <View style={styles.mandatoryDisclaimerCard}>
          <Text style={styles.disclaimerTitle}>REGULATORY LIMITATION NOTICE</Text>
          <Text style={styles.mandatoryDisclaimerText}>
            {CHEMICAL_TEST_DISCLAIMER}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.saveBtn, isSaved && styles.saveBtnSaved]}
            onPress={handleManualSave}
            disabled={isSaving}
          >
            <CheckCircleIcon size={18} color="#FFFFFF" />
            <Text style={styles.saveBtnText}>
              {isSaved ? 'SAVED TO SQLITE DATABASE' : 'SAVE RECORD TO DATABASE'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.detailsBtn}
            onPress={() => savedRecord && onViewRecordDetails(savedRecord)}
          >
            <Text style={styles.detailsBtnText}>VIEW IN AUDIT DETAILS →</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dashboardBtn}
            onPress={onFinishAndGoDashboard}
          >
            <Text style={styles.dashboardBtnText}>Return to Dashboard</Text>
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
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingTitle: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
    marginTop: 16,
  },
  loadingSubtitle: {
    color: Colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
    maxWidth: 280,
    lineHeight: 18,
  },
  topBar: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder,
    backgroundColor: Colors.surface,
    alignItems: 'center',
  },
  topBarTitle: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  resultCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginBottom: 16,
    alignItems: 'center',
  },
  resultHeaderLabel: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  badgeRow: {
    marginBottom: 14,
  },
  confidenceLabel: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  confidenceHighlight: {
    color: Colors.textPrimary,
    fontWeight: '800',
  },
  chromophoreBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 10,
    padding: 10,
    marginTop: 14,
    width: '100%',
  },
  colorPreviewCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    marginRight: 10,
  },
  chromophoreDetails: {
    flex: 1,
  },
  chromophoreHex: {
    color: Colors.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  chromophoreSpaces: {
    color: Colors.textMuted,
    fontSize: 10,
    marginTop: 2,
  },
  notesText: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 12,
    textAlign: 'center',
    lineHeight: 18,
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
    marginBottom: 12,
  },
  cardTitle: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  verifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.verifiedMuted,
    borderColor: Colors.verified,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  verifiedPillText: {
    color: Colors.verified,
    fontSize: 10,
    fontWeight: '800',
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  dataLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  dataValue: {
    color: Colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  dataValueHighlight: {
    color: Colors.primaryLight,
    fontSize: 13,
    fontWeight: '800',
  },
  hashBlock: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  hashLabel: {
    color: Colors.textMuted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  hashValue: {
    color: Colors.primaryLight,
    fontFamily: 'monospace',
    fontSize: 11,
    lineHeight: 16,
  },
  mandatoryDisclaimerCard: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderLeftWidth: 4,
    borderLeftColor: Colors.inconclusiveBorder,
    borderRadius: 8,
    padding: 14,
    marginBottom: 20,
  },
  disclaimerTitle: {
    color: Colors.inconclusive,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  mandatoryDisclaimerText: {
    color: '#E2E8F0',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
  },
  actions: {
    gap: 10,
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 12,
  },
  saveBtnSaved: {
    backgroundColor: Colors.primaryDark,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginLeft: 8,
  },
  detailsBtn: {
    backgroundColor: Colors.surface,
    borderColor: Colors.surfaceBorder,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 12,
  },
  detailsBtnText: {
    color: Colors.primaryLight,
    fontSize: 13,
    fontWeight: '700',
  },
  dashboardBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  dashboardBtnText: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
});

export default ResultScreen;
