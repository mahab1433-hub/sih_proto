import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Camera, useCameraDevice, PhotoFile } from 'react-native-vision-camera';
import Colors from '../constants/colors';
import CameraOverlay from '../components/CameraOverlay';
import { FlashIcon, CameraIcon, RefreshIcon } from '../components/Icons';
import { checkAndRequestCameraPermission } from '../services/cameraService';
import { TestInfoFormData } from './NewTestScreen';

interface CameraScreenProps {
  testData: TestInfoFormData;
  onImageCaptured: (imageUri: string, width: number, height: number, isDemoImage?: boolean) => void;
  onCancel: () => void;
}

export const CameraScreen: React.FC<CameraScreenProps> = ({
  testData,
  onImageCaptured,
  onCancel,
}) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [flash, setFlash] = useState<'off' | 'on'>('off');
  const [isCapturing, setIsCapturing] = useState(false);
  const cameraRef = useRef<any>(null);

  const device = useCameraDevice('back');

  useEffect(() => {
    (async () => {
      const perm = await checkAndRequestCameraPermission();
      setHasPermission(perm.hasPermission);
    })();
  }, []);

  const handleCapture = async () => {
    if (isCapturing) return;
    setIsCapturing(true);

    try {
      if (cameraRef.current && device && typeof cameraRef.current.takePhoto === 'function') {
        const photo: any = await cameraRef.current.takePhoto({
          flash,
          enableShutterSound: false,
        });

        const rawPath = photo?.filePath || photo?.path || '';
        const uri = rawPath ? (rawPath.startsWith('file://') ? rawPath : `file://${rawPath}`) : `file:///field_test_captures/${testData.testId}_optical.jpg`;
        setIsCapturing(false);
        onImageCaptured(uri, photo?.width || 1920, photo?.height || 1080, false);
      } else {
        // Fallback for emulator / environments without physical camera sensor
        handleSimulatedCapture();
      }
    } catch (err) {
      console.warn('Physical camera capture error, using simulation fallback:', err);
      handleSimulatedCapture();
    }
  };

  const handleSimulatedCapture = () => {
    setIsCapturing(false);
    const mockUri = `file:///field_test_captures/${testData.testId}_optical.jpg`;
    onImageCaptured(mockUri, 1920, 1080, true);
  };

  const toggleFlash = () => {
    setFlash((prev) => (prev === 'off' ? 'on' : 'off'));
  };

  if (hasPermission === null) {
    return (
      <SafeAreaView style={styles.permissionContainer}>
        <ActivityIndicator size="large" color={Colors.primaryLight} />
        <Text style={styles.permissionText}>Verifying Camera Permissions...</Text>
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.permissionContainer}>
        <Text style={styles.permissionTitle}>Camera Permission Required</Text>
        <Text style={styles.permissionSub}>
          The application requires camera access to scan field-test reactions and calibrate lighting.
        </Text>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={async () => {
            const perm = await checkAndRequestCameraPermission();
            setHasPermission(perm.hasPermission);
          }}
        >
          <Text style={styles.actionBtnText}>GRANT PERMISSION</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.fallbackBtn]}
          onPress={handleSimulatedCapture}
        >
          <Text style={styles.fallbackBtnText}>USE SIMULATED CAMERA FOR DEMO</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelLink} onPress={onCancel}>
          <Text style={styles.cancelLinkText}>Return to Form</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar hidden />

      {/* Camera Live Viewfinder or Fallback Viewfinder */}
      {device ? (
        <Camera
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={true}
        />
      ) : (
        <View style={styles.simulatedViewfinder}>
          <Text style={styles.simulatedText}>[Optical Viewfinder Active - Standard Lens]</Text>
          <Text style={styles.simulatedSubtext}>Ready to capture reaction & reference card</Text>
        </View>
      )}

      {/* Optical Alignment Guide Overlay */}
      <CameraOverlay cardDetected={true} reactionDetected={true} />

      {/* Top Camera Controls */}
      <View style={styles.topControls}>
        <TouchableOpacity style={styles.controlPill} onPress={onCancel}>
          <Text style={styles.controlPillText}>Cancel</Text>
        </TouchableOpacity>

        <View style={styles.testInfoTag}>
          <Text style={styles.testInfoTagText}>{testData.testId}</Text>
        </View>

        <TouchableOpacity
          style={[styles.iconButton, flash === 'on' && styles.iconButtonActive]}
          onPress={toggleFlash}
        >
          <FlashIcon size={20} color={flash === 'on' ? Colors.inconclusive : '#FFFFFF'} active={flash === 'on'} />
        </TouchableOpacity>
      </View>

      {/* Bottom Shutter Controls */}
      <View style={styles.bottomControls}>
        {/* Simulation / Demo helper */}
        <TouchableOpacity style={styles.demoHelperBtn} onPress={handleSimulatedCapture}>
          <RefreshIcon size={16} color={Colors.textSecondary} />
          <Text style={styles.demoHelperText}>Sample Photo</Text>
        </TouchableOpacity>

        {/* Main Shutter Button */}
        <TouchableOpacity
          style={styles.shutterButton}
          onPress={handleCapture}
          disabled={isCapturing}
          activeOpacity={0.8}
        >
          <View style={styles.shutterButtonInner}>
            {isCapturing ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <View style={styles.shutterCore} />
            )}
          </View>
        </TouchableOpacity>

        <View style={styles.spacer} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  permissionTitle: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    marginTop: 16,
    textAlign: 'center',
  },
  permissionSub: {
    color: Colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    marginVertical: 12,
    lineHeight: 18,
  },
  permissionText: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginTop: 14,
  },
  actionBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginTop: 16,
    width: '100%',
    alignItems: 'center',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  fallbackBtn: {
    backgroundColor: Colors.surfaceElevated,
    borderColor: Colors.primaryDark,
    borderWidth: 1,
    marginTop: 10,
  },
  fallbackBtnText: {
    color: Colors.primaryLight,
    fontSize: 13,
    fontWeight: '700',
  },
  cancelLink: {
    marginTop: 16,
    padding: 8,
  },
  cancelLinkText: {
    color: Colors.textMuted,
    fontSize: 13,
  },
  simulatedViewfinder: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#070D18',
    alignItems: 'center',
    justifyContent: 'center',
  },
  simulatedText: {
    color: Colors.primaryLight,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  simulatedSubtext: {
    color: Colors.textMuted,
    fontSize: 11,
    marginTop: 6,
  },
  topControls: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 20,
  },
  controlPill: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  controlPillText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  testInfoTag: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderColor: Colors.surfaceBorder,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  testInfoTagText: {
    color: Colors.primaryLight,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  iconButtonActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.3)',
    borderColor: Colors.inconclusive,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    zIndex: 20,
    paddingHorizontal: 20,
  },
  demoHelperBtn: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  demoHelperText: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
  },
  shutterButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterButtonInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterCore: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: Colors.background,
  },
  spacer: {
    width: 60,
  },
});

export default CameraScreen;
