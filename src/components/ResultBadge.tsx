import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TestResult } from '../models/TestResult';
import Colors from '../constants/colors';

interface ResultBadgeProps {
  result: TestResult;
  confidence?: number;
  size?: 'small' | 'medium' | 'large';
  showConfidence?: boolean;
}

export const ResultBadge: React.FC<ResultBadgeProps> = ({
  result,
  confidence,
  size = 'medium',
  showConfidence = false,
}) => {
  let backgroundColor = Colors.inconclusiveMuted;
  let borderColor = Colors.inconclusiveBorder;
  let textColor = Colors.inconclusive;
  let label = 'INCONCLUSIVE';

  if (result === 'POSITIVE') {
    backgroundColor = Colors.positiveMuted;
    borderColor = Colors.positiveBorder;
    textColor = Colors.positive;
    label = 'POSITIVE';
  } else if (result === 'NEGATIVE') {
    backgroundColor = Colors.negativeMuted;
    borderColor = Colors.negativeBorder;
    textColor = Colors.negative;
    label = 'NEGATIVE';
  }

  const isSmall = size === 'small';
  const isLarge = size === 'large';

  return (
    <View
      style={[
        styles.container,
        { backgroundColor, borderColor },
        isSmall && styles.containerSmall,
        isLarge && styles.containerLarge,
      ]}
    >
      <View style={[styles.dot, { backgroundColor: textColor }]} />
      <Text
        style={[
          styles.text,
          { color: textColor },
          isSmall && styles.textSmall,
          isLarge && styles.textLarge,
        ]}
      >
        {label}
      </Text>
      {showConfidence && confidence !== undefined && (
        <View style={[styles.confidencePill, { backgroundColor: borderColor }]}>
          <Text style={styles.confidenceText}>{(confidence * 100).toFixed(0)}%</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1.5,
    alignSelf: 'flex-start',
  },
  containerSmall: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  containerLarge: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 2,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  text: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  textSmall: {
    fontSize: 11,
    fontWeight: '700',
  },
  textLarge: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
  },
  confidencePill: {
    marginLeft: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  confidenceText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
});

export default ResultBadge;
