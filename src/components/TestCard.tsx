import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { TestRecord } from '../models/TestRecord';
import ResultBadge from './ResultBadge';
import { ShieldCheckIcon, ChevronRightIcon, MapPinIcon, ClockIcon } from './Icons';
import Colors from '../constants/colors';

interface TestCardProps {
  record: TestRecord;
  onPress: () => void;
}

export const TestCard: React.FC<TestCardProps> = ({ record, onPress }) => {
  const formattedDate = new Date(record.timestamp).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const formattedTime = new Date(record.timestamp).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });

  const isVerified = record.verificationStatus === 'VERIFIED';

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
    >
      <View style={styles.headerRow}>
        <View style={styles.idContainer}>
          <Text style={styles.testId}>{record.testId}</Text>
          {record.isDemo && (
            <View style={styles.demoBadge}>
              <Text style={styles.demoBadgeText}>DEMO RECORD</Text>
            </View>
          )}
        </View>
        <ResultBadge
          result={record.result}
          confidence={record.confidence}
          size="small"
          showConfidence
        />
      </View>

      <View style={styles.detailsRow}>
        <View style={styles.metaItem}>
          <ClockIcon size={14} color={Colors.textMuted} />
          <Text style={styles.metaText}>{formattedDate} • {formattedTime}</Text>
        </View>
      </View>

      <View style={styles.footerRow}>
        <Text style={styles.operatorText}>
          Op: <Text style={styles.operatorHighlight}>{record.operatorId}</Text> | Kit: {record.testKitId}
        </Text>

        <View style={styles.statusContainer}>
          {isVerified ? (
            <View style={styles.verifiedTag}>
              <ShieldCheckIcon size={14} color={Colors.verified} />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          ) : (
            <Text style={styles.unverifiedText}>Tamper-Evident</Text>
          )}
          <ChevronRightIcon size={16} color={Colors.textMuted} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  idContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  testId: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginRight: 8,
  },
  demoBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderColor: Colors.inconclusiveBorder,
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  demoBadgeText: {
    color: Colors.inconclusive,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginLeft: 5,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    paddingTop: 8,
  },
  operatorText: {
    color: Colors.textMuted,
    fontSize: 12,
  },
  operatorHighlight: {
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.verifiedMuted,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 4,
  },
  verifiedText: {
    color: Colors.verified,
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
  },
  unverifiedText: {
    color: Colors.textMuted,
    fontSize: 11,
    marginRight: 4,
  },
});

export default TestCard;
