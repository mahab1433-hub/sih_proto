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
} from 'react-native';
import Colors from '../constants/colors';
import { ShieldCheckIcon, UserIcon, LockIcon } from '../components/Icons';
import { getRecordStatistics, RecordStatistics } from '../database/testRecordRepository';
import { CHEMICAL_TEST_DISCLAIMER } from '../services/resultClassifier';

interface ProfileScreenProps {
  operatorId: string;
  onLogout: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ operatorId, onLogout }) => {
  const [stats, setStats] = useState<RecordStatistics>({
    total: 0,
    positive: 0,
    negative: 0,
    inconclusive: 0,
  });

  useEffect(() => {
    (async () => {
      const s = await getRecordStatistics();
      setStats(s);
    })();
  }, []);

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to end your operator session?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: onLogout },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>OPERATOR PROFILE & SETTINGS</Text>
        <Text style={styles.headerSubtitle}>Terminal Configuration & Device Security</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Operator Badge Card */}
        <View style={styles.card}>
          <View style={styles.profileHeaderRow}>
            <View style={styles.avatar}>
              <UserIcon size={32} color={Colors.primaryLight} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.operatorTitle}>{operatorId}</Text>
              <Text style={styles.roleTitle}>Certified Field Officer</Text>
              <View style={styles.activePill}>
                <View style={styles.activeDot} />
                <Text style={styles.activePillText}>AUTHENTICATED SESSION</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Device & System Security Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Device Security & Encryption</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Hashing Algorithm</Text>
            <Text style={styles.infoValue}>SHA-256 (FIPS 180-4)</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Digital Signature Engine</Text>
            <Text style={styles.infoValue}>Ed25519 Secure Enclave</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Local Database Engine</Text>
            <Text style={styles.infoValue}>SQLite Local Storage</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Network Requirement</Text>
            <Text style={[styles.infoValue, { color: Colors.negative }]}>100% Offline Capable</Text>
          </View>

          <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.infoLabel}>Application Version</Text>
            <Text style={styles.infoValue}>1.0.0-PROTOTYPE</Text>
          </View>
        </View>

        {/* Field Testing Summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Terminal Audit Statistics</Text>

          <View style={styles.statGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.total}</Text>
              <Text style={styles.statText}>Tests Recorded</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: Colors.positive }]}>{stats.positive}</Text>
              <Text style={styles.statText}>Positives</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: Colors.negative }]}>{stats.negative}</Text>
              <Text style={styles.statText}>Negatives</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: Colors.inconclusive }]}>{stats.inconclusive}</Text>
              <Text style={styles.statText}>Inconclusive</Text>
            </View>
          </View>
        </View>

        {/* Regulatory & Operating Notice */}
        <View style={styles.disclaimerBox}>
          <Text style={styles.disclaimerTitle}>REGULATORY AND FIELD PROTOCOL NOTICE</Text>
          <Text style={styles.disclaimerText}>
            {CHEMICAL_TEST_DISCLAIMER}
            {'\n\n'}
            This mobile computer-vision software assists trained operators in recording colorimetric presumptive tests. It records optical characteristics alongside in-frame calibration targets. Digital records are saved as tamper-evident supporting data.
          </Text>
        </View>

        {/* Logout Action */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>LOG OUT OPERATOR SESSION</Text>
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
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder,
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
    marginBottom: 12,
  },
  profileHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 2,
    borderColor: Colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  operatorTitle: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
  },
  roleTitle: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.guideActive,
    marginRight: 6,
  },
  activePillText: {
    color: Colors.primaryLight,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  infoLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  infoValue: {
    color: Colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  statGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  statNumber: {
    color: Colors.primaryLight,
    fontSize: 20,
    fontWeight: '800',
  },
  statText: {
    color: Colors.textMuted,
    fontSize: 10,
    marginTop: 4,
  },
  disclaimerBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 10,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  disclaimerTitle: {
    color: Colors.inconclusive,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  disclaimerText: {
    color: Colors.textSecondary,
    fontSize: 11,
    lineHeight: 16,
  },
  logoutButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: Colors.positiveBorder,
    borderWidth: 1,
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButtonText: {
    color: Colors.positive,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
});

export default ProfileScreen;
