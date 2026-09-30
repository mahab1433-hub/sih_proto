import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '../constants/colors';

interface StatCardProps {
  label: string;
  count: number;
  color?: string;
  subtitle?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  count,
  color = Colors.primaryLight,
  subtitle,
}) => {
  return (
    <View style={[styles.card, { borderTopColor: color }]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.count, { color }]}>{count}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    borderTopWidth: 4,
    flex: 1,
    marginHorizontal: 4,
    minWidth: 74,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  count: {
    fontSize: 24,
    fontWeight: '800',
    marginVertical: 4,
  },
  subtitle: {
    color: Colors.textMuted,
    fontSize: 10,
  },
});

export default StatCard;
