import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Colors from '../constants/colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface CameraOverlayProps {
  cardDetected?: boolean;
  reactionDetected?: boolean;
}

export const CameraOverlay: React.FC<CameraOverlayProps> = ({
  cardDetected = true,
  reactionDetected = true,
}) => {
  return (
    <View style={styles.overlay} pointerEvents="none">
      {/* Top Banner Guide Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionTitle}>FIELD TEST ALIGNMENT</Text>
        <Text style={styles.instructionStep}>• Place the completed field-test kit inside the frame.</Text>
        <Text style={styles.instructionStep}>• Ensure the reference colour card is visible.</Text>
        <Text style={styles.instructionStep}>• Avoid glare and strong shadows.</Text>
        <Text style={styles.instructionStep}>• Keep the camera steady.</Text>
      </View>

      {/* Main Alignment Bounding Box */}
      <View style={styles.captureFrame}>
        {/* Corner Reticles */}
        <View style={[styles.corner, styles.cornerTL]} />
        <View style={[styles.corner, styles.cornerTR]} />
        <View style={[styles.corner, styles.cornerBL]} />
        <View style={[styles.corner, styles.cornerBR]} />

        {/* 1. REFERENCE COLOUR CARD ROI GUIDE */}
        <View
          style={[
            styles.roiBox,
            styles.referenceCardBox,
            cardDetected && styles.roiDetected,
          ]}
        >
          <View style={styles.roiHeader}>
            <View style={[styles.roiIndicator, { backgroundColor: Colors.referenceGuideBorder }]} />
            <Text style={styles.roiLabel}>REFERENCE COLOUR CARD</Text>
          </View>
          <View style={styles.colorCardPatches}>
            <View style={[styles.patch, { backgroundColor: '#FFFFFF' }]} />
            <View style={[styles.patch, { backgroundColor: '#808080' }]} />
            <View style={[styles.patch, { backgroundColor: '#000000' }]} />
            <View style={[styles.patch, { backgroundColor: '#0D9488' }]} />
          </View>
        </View>

        {/* 2. TEST REACTION AREA ROI GUIDE */}
        <View
          style={[
            styles.roiBox,
            styles.reactionAreaBox,
            reactionDetected && styles.roiDetectedReaction,
          ]}
        >
          <View style={styles.roiHeader}>
            <View style={[styles.roiIndicator, { backgroundColor: Colors.reactionGuideBorder }]} />
            <Text style={[styles.roiLabel, { color: Colors.reactionGuideBorder }]}>
              TEST REACTION AREA
            </Text>
          </View>
          {/* Reaction crosshair */}
          <View style={styles.crosshairH} />
          <View style={styles.crosshairV} />
        </View>
      </View>

      {/* Bottom Status Prompt */}
      <View style={styles.statusBar}>
        <View style={styles.statusDot} />
        <Text style={styles.statusText}>Optical Alignment Active • Lighting Auto-Compensating</Text>
      </View>
    </View>
  );
};

const FRAME_WIDTH = SCREEN_WIDTH * 0.88;
const FRAME_HEIGHT = SCREEN_HEIGHT * 0.52;

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 40,
    zIndex: 10,
  },
  instructionsContainer: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderColor: Colors.surfaceBorder,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    width: SCREEN_WIDTH * 0.9,
  },
  instructionTitle: {
    color: Colors.primaryLight,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  instructionStep: {
    color: '#E2E8F0',
    fontSize: 11,
    lineHeight: 16,
  },
  captureFrame: {
    width: FRAME_WIDTH,
    height: FRAME_HEIGHT,
    position: 'relative',
    justifyContent: 'space-between',
    padding: 16,
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: Colors.primaryLight,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  roiBox: {
    borderRadius: 8,
    borderWidth: 2,
    padding: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
  },
  referenceCardBox: {
    borderColor: Colors.referenceGuideBorder,
    height: FRAME_HEIGHT * 0.36,
  },
  roiDetected: {
    borderColor: '#38BDF8',
  },
  reactionAreaBox: {
    borderColor: Colors.reactionGuideBorder,
    height: FRAME_HEIGHT * 0.44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roiDetectedReaction: {
    borderColor: '#C084FC',
  },
  roiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    alignSelf: 'flex-start',
  },
  roiIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  roiLabel: {
    color: Colors.referenceGuideBorder,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  colorCardPatches: {
    flexDirection: 'row',
    marginTop: 8,
    justifyContent: 'space-around',
  },
  patch: {
    width: 32,
    height: 22,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  crosshairH: {
    position: 'absolute',
    width: 40,
    height: 1.5,
    backgroundColor: 'rgba(168, 85, 247, 0.7)',
  },
  crosshairV: {
    position: 'absolute',
    width: 1.5,
    height: 40,
    backgroundColor: 'rgba(168, 85, 247, 0.7)',
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(11, 15, 23, 0.85)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.guideActive,
    marginRight: 8,
  },
  statusText: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
});

export default CameraOverlay;
