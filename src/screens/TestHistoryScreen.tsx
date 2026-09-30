import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  StatusBar,
  RefreshControl,
} from 'react-native';
import Colors from '../constants/colors';
import { TestCard } from '../components/TestCard';
import { SearchIcon, ShieldCheckIcon } from '../components/Icons';
import { TestRecord } from '../models/TestRecord';
import { searchTestRecords, getTestRecords } from '../database/testRecordRepository';

interface TestHistoryScreenProps {
  onSelectRecord: (record: TestRecord) => void;
  onNavigateNewTest: () => void;
}

type FilterTab = 'ALL' | 'POSITIVE' | 'NEGATIVE' | 'INCONCLUSIVE';

export const TestHistoryScreen: React.FC<TestHistoryScreenProps> = ({
  onSelectRecord,
  onNavigateNewTest,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterTab>('ALL');
  const [records, setRecords] = useState<TestRecord[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRecords = useCallback(async () => {
    try {
      const results = await searchTestRecords(searchQuery, activeFilter);
      setRecords(results);
    } catch (e) {
      console.warn('Error querying history records:', e);
    }
  }, [searchQuery, activeFilter]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRecords();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>TEST RECORDS AUDIT TRAIL</Text>
        <Text style={styles.headerSubtitle}>Searchable SQLite Field Database</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <SearchIcon size={18} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Test ID, Operator, Kit, or Sample..."
            placeholderTextColor={Colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchBtn}>
              <Text style={styles.clearSearchText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Pills: All, Positive, Negative, Inconclusive */}
        <View style={styles.filterPillsRow}>
          {(['ALL', 'POSITIVE', 'NEGATIVE', 'INCONCLUSIVE'] as FilterTab[]).map((tab) => {
            const isActive = activeFilter === tab;
            let activeColor = Colors.primary;
            if (tab === 'POSITIVE') activeColor = Colors.positive;
            if (tab === 'NEGATIVE') activeColor = Colors.negative;
            if (tab === 'INCONCLUSIVE') activeColor = Colors.inconclusive;

            return (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.filterPill,
                  isActive && { backgroundColor: activeColor, borderColor: activeColor },
                ]}
                onPress={() => setActiveFilter(tab)}
              >
                <Text style={[styles.filterPillText, isActive && styles.filterPillTextActive]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Record List */}
      <FlatList
        data={records}
        keyExtractor={(item) => item.id || item.testId}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primaryLight} />
        }
        renderItem={({ item }) => (
          <TestCard record={item} onPress={() => onSelectRecord(item)} />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <ShieldCheckIcon size={40} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No matching test records</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery
                ? 'Try broadening your search query or reset the filter.'
                : 'Start a new field test to generate a verified digital record.'}
            </Text>
            <TouchableOpacity style={styles.newTestBtn} onPress={onNavigateNewTest}>
              <Text style={styles.newTestBtnText}>+ Start New Test</Text>
            </TouchableOpacity>
          </View>
        }
      />
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
  searchSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  searchInput: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 13,
    marginLeft: 8,
  },
  clearSearchBtn: {
    padding: 6,
  },
  clearSearchText: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  filterPillsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    gap: 6,
  },
  filterPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  filterPillText: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
    paddingBottom: 30,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
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
  newTestBtn: {
    marginTop: 16,
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  newTestBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});

export default TestHistoryScreen;
