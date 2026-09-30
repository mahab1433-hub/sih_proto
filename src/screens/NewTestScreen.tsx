import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import Colors from '../constants/colors';
import { MapPinIcon, ClockIcon, HashIcon, RefreshIcon, CameraIcon } from '../components/Icons';
import { generateTestId, generateSampleId, generateTestKitId } from '../utils/idGenerator';
import { getCurrentCoordinates, LocationCoordinates } from '../services/locationService';
import { validateTestInfoForm } from '../utils/validation';

export interface TestInfoFormData {
  testId: string;
  operatorId: string;
  testKitId: string;
  sampleId: string;
  caseNumber?: string;
  timestamp: string;
  latitude: number | null;
  longitude: number | null;
  locationStatus: string;
  isDemo?: boolean;
  demoScenario?: 'POSITIVE_VIOLET' | 'NEGATIVE_BLANK' | 'INCONCLUSIVE';
}

interface NewTestScreenProps {
  operatorId: string;
  onProceedToCamera: (data: TestInfoFormData) => void;
  onCancel: () => void;
}

export const NewTestScreen: React.FC<NewTestScreenProps> = ({
  operatorId,
  onProceedToCamera,
  onCancel,
}) => {
  const [testId, setTestId] = useState('');
  const [testKitId, setTestKitId] = useState('');
  const [sampleId, setSampleId] = useState('');
  const [caseNumber, setCaseNumber] = useState('');
  const [timestamp, setTimestamp] = useState('');
  const [location, setLocation] = useState<LocationCoordinates>({
    latitude: null,
    longitude: null,
    isAvailable: false,
    message: 'Acquiring GPS...',
  });
  const [isLocating, setIsLocating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedDemoScenario, setSelectedDemoScenario] = useState<
    'NONE' | 'POSITIVE_VIOLET' | 'NEGATIVE_BLANK' | 'INCONCLUSIVE'
  >('NONE');

  // Initialize test IDs and fetch GPS coordinates
  useEffect(() => {
    resetForm();
    fetchLocation();
  }, []);

  const resetForm = () => {
    setTestId(generateTestId());
    setTestKitId(generateTestKitId());
    setSampleId(generateSampleId());
    setCaseNumber('');
    setTimestamp(new Date().toISOString());
  };

  const fetchLocation = async () => {
    setIsLocating(true);
    const coords = await getCurrentCoordinates();
    setLocation(coords);
    setIsLocating(false);
  };

  const handleProceed = () => {
    const validation = validateTestInfoForm({
      operatorId,
      testKitId,
      sampleId,
    });

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    const isDemo = selectedDemoScenario !== 'NONE';

    const formData: TestInfoFormData = {
      testId,
      operatorId,
      testKitId: testKitId.trim(),
      sampleId: sampleId.trim(),
      caseNumber: caseNumber.trim() || undefined,
      timestamp,
      latitude: location.latitude,
      longitude: location.longitude,
      locationStatus: location.isAvailable
        ? `${location.latitude?.toFixed(5)}, ${location.longitude?.toFixed(5)}`
        : 'Location unavailable',
      isDemo,
      demoScenario: isDemo ? selectedDemoScenario : undefined,
    };

    onProceedToCamera(formData);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onCancel} style={styles.cancelBtn}>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>NEW TEST METADATA</Text>
        <TouchableOpacity onPress={resetForm} style={styles.refreshBtn}>
          <RefreshIcon size={18} color={Colors.primaryLight} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Automatic Identifiers Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Generated Identifiers</Text>

          {/* Test ID (Automatic) */}
          <View style={styles.fieldRow}>
            <View style={styles.fieldIcon}>
              <HashIcon size={18} color={Colors.primaryLight} />
            </View>
            <View style={styles.fieldInfo}>
              <Text style={styles.fieldLabel}>TEST ID (AUTOMATIC)</Text>
              <Text style={styles.fieldValue}>{testId}</Text>
            </View>
          </View>

          {/* Operator ID (from Login) */}
          <View style={styles.fieldRow}>
            <View style={styles.fieldIcon}>
              <HashIcon size={18} color={Colors.textSecondary} />
            </View>
            <View style={styles.fieldInfo}>
              <Text style={styles.fieldLabel}>OPERATOR ID</Text>
              <Text style={styles.fieldValue}>{operatorId}</Text>
            </View>
          </View>
        </View>

        {/* Test Kit & Sample Identification Form */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sample & Kit Information</Text>

          {/* Test Kit ID */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>TEST KIT ID / LOT NUMBER *</Text>
            <TextInput
              style={[styles.input, errors.testKitId && styles.inputError]}
              value={testKitId}
              onChangeText={(t) => {
                setTestKitId(t);
                if (errors.testKitId) setErrors((prev) => ({ ...prev, testKitId: '' }));
              }}
              placeholder="e.g. TK-892-L42"
              placeholderTextColor={Colors.textMuted}
              autoCapitalize="characters"
            />
            {errors.testKitId && <Text style={styles.errorText}>{errors.testKitId}</Text>}
          </View>

          {/* Sample ID */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>SAMPLE ID / EVIDENCE BARCODE *</Text>
            <TextInput
              style={[styles.input, errors.sampleId && styles.inputError]}
              value={sampleId}
              onChangeText={(t) => {
                setSampleId(t);
                if (errors.sampleId) setErrors((prev) => ({ ...prev, sampleId: '' }));
              }}
              placeholder="e.g. SMP-AX9842"
              placeholderTextColor={Colors.textMuted}
              autoCapitalize="characters"
            />
            {errors.sampleId && <Text style={styles.errorText}>{errors.sampleId}</Text>}
          </View>

          {/* Case Reference Number (Optional) */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>CASE / REFERENCE NUMBER (OPTIONAL)</Text>
            <TextInput
              style={styles.input}
              value={caseNumber}
              onChangeText={setCaseNumber}
              placeholder="e.g. CR-2026-904"
              placeholderTextColor={Colors.textMuted}
              autoCapitalize="characters"
            />
          </View>
        </View>

        {/* Automatic Environment Telemetry */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Digital Telemetry Stamp</Text>

          {/* Timestamp */}
          <View style={styles.telemetryRow}>
            <ClockIcon size={18} color={Colors.primaryLight} />
            <View style={styles.telemetryInfo}>
              <Text style={styles.telemetryLabel}>CAPTURE TIMESTAMP</Text>
              <Text style={styles.telemetryValue}>{timestamp}</Text>
            </View>
          </View>

          {/* GPS Coordinates */}
          <View style={styles.telemetryRow}>
            <MapPinIcon size={18} color={location.isAvailable ? Colors.verified : Colors.inconclusive} />
            <View style={styles.telemetryInfo}>
              <Text style={styles.telemetryLabel}>GPS COORDINATES</Text>
              <Text style={styles.telemetryValue}>
                {location.isAvailable
                  ? `${location.latitude?.toFixed(6)}° N, ${location.longitude?.toFixed(6)}° E`
                  : 'Location unavailable'}
              </Text>
            </View>
            <TouchableOpacity onPress={fetchLocation} style={styles.locationRefreshBtn}>
              {isLocating ? (
                <ActivityIndicator size="small" color={Colors.primaryLight} />
              ) : (
                <RefreshIcon size={16} color={Colors.textSecondary} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Demo Mode / Controlled Test Input Selector (Section 14) */}
        <View style={[styles.card, styles.demoCard]}>
          <View style={styles.demoHeader}>
            <Text style={styles.demoTitle}>DEMO SIMULATION CONTROLS</Text>
            <Text style={styles.demoSubtitle}>Run end-to-end verification without physical chemical kit</Text>
          </View>

          <View style={styles.demoOptions}>
            <TouchableOpacity
              style={[
                styles.demoOptionBtn,
                selectedDemoScenario === 'POSITIVE_VIOLET' && styles.demoOptionBtnActive,
              ]}
              onPress={() => setSelectedDemoScenario('POSITIVE_VIOLET')}
            >
              <View style={[styles.demoColorCircle, { backgroundColor: '#6B21A8' }]} />
              <Text style={styles.demoOptionText}>Positive Violet (Chromophore)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.demoOptionBtn,
                selectedDemoScenario === 'NEGATIVE_BLANK' && styles.demoOptionBtnActive,
              ]}
              onPress={() => setSelectedDemoScenario('NEGATIVE_BLANK')}
            >
              <View style={[styles.demoColorCircle, { backgroundColor: '#FDE047' }]} />
              <Text style={styles.demoOptionText}>Negative Blank (Unreacted)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.demoOptionBtn,
                selectedDemoScenario === 'INCONCLUSIVE' && styles.demoOptionBtnActive,
              ]}
              onPress={() => setSelectedDemoScenario('INCONCLUSIVE')}
            >
              <View style={[styles.demoColorCircle, { backgroundColor: '#78716C' }]} />
              <Text style={styles.demoOptionText}>Inconclusive / Turbid</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.demoOptionBtn,
                selectedDemoScenario === 'NONE' && styles.demoOptionBtnActive,
              ]}
              onPress={() => setSelectedDemoScenario('NONE')}
            >
              <Text style={styles.demoOptionText}>Live Optical Camera Capture</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Button: Proceed to Camera */}
        <TouchableOpacity
          style={styles.proceedButton}
          onPress={handleProceed}
          activeOpacity={0.85}
        >
          <CameraIcon size={22} color="#FFFFFF" />
          <Text style={styles.proceedButtonText}>
            {selectedDemoScenario !== 'NONE'
              ? 'PROCEED TO CALIBRATION & CLASSIFICATION'
              : 'OPEN CAMERA CAPTURE'}
          </Text>
        </TouchableOpacity>
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
  cancelBtn: {
    padding: 6,
  },
  cancelBtnText: {
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
  refreshBtn: {
    padding: 6,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  cardTitle: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 14,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  fieldIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  fieldInfo: {
    flex: 1,
  },
  fieldLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  fieldValue: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 46,
    color: Colors.textPrimary,
    fontSize: 14,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  inputError: {
    borderColor: Colors.positive,
  },
  errorText: {
    color: Colors.positive,
    fontSize: 11,
    marginTop: 4,
  },
  telemetryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  telemetryInfo: {
    flex: 1,
    marginLeft: 12,
  },
  telemetryLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
  },
  telemetryValue: {
    color: Colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  locationRefreshBtn: {
    padding: 8,
  },
  demoCard: {
    borderColor: Colors.inconclusiveBorder,
    borderStyle: 'dashed',
    backgroundColor: 'rgba(245, 158, 11, 0.05)',
  },
  demoHeader: {
    marginBottom: 12,
  },
  demoTitle: {
    color: Colors.inconclusive,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  demoSubtitle: {
    color: Colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  demoOptions: {
    gap: 8,
  },
  demoOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  demoOptionBtnActive: {
    borderColor: Colors.primaryLight,
    backgroundColor: Colors.primaryMuted,
  },
  demoColorCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  demoOptionText: {
    color: Colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  proceedButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    borderRadius: 12,
    marginTop: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  proceedButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginLeft: 10,
  },
});

export default NewTestScreen;
