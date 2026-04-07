import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput, Animated, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDocumentStore } from '../../store/documentStore';
import { useTheme } from '../../contexts/ThemeContext';
import { DOC_TYPE_CONFIG, DOC_TYPES, FILTER_CATEGORIES } from '../../constants/DocumentTypes';
import { hexToRgba } from '../../utils/colorUtils';

const SMART_SUGGESTIONS = [
  'aadhaar', 'pan', 'passport', 'driving license', 'certificate',
  'health report', 'insurance', 'property', 'birth certificate', 'education',
];

function SearchResultItem({ doc, onPress, C }) {
  const typeConfig = DOC_TYPE_CONFIG[doc.type] || DOC_TYPE_CONFIG[DOC_TYPES.OTHER];
  return (
    <TouchableOpacity
      style={{
        flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface,
        borderRadius: 12, padding: 13, marginBottom: 8, borderWidth: 1, borderColor: C.border,
      }}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={{
        width: 42, height: 42, borderRadius: 11, backgroundColor: typeConfig.getBg(C),
        alignItems: 'center', justifyContent: 'center', marginRight: 12,
      }}>
        <Ionicons name={typeConfig.icon} size={20} color={typeConfig.getColor(C)} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: C.text, fontSize: 14, fontWeight: '600', marginBottom: 3 }} numberOfLines={1}>{doc.name}</Text>
        <Text style={{ color: C.textMuted, fontSize: 12 }} numberOfLines={1}>
          {doc.tags.slice(0, 3).map(t => `#${t}`).join('  ')}
        </Text>
      </View>
      {doc.encrypted && <Ionicons name="lock-closed" size={13} color={C.textMuted} />}
    </TouchableOpacity>
  );
}

export default function SearchScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { C } = useTheme();
  const inputRef = useRef(null);

  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchHistory, setSearchHistory] = useState([]);

  const documents = useDocumentStore(s => s.documents);
  const incrementAccess = useDocumentStore(s => s.incrementAccess);

  const styles = useMemo(() => createStyles(C), [C]);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: Platform.OS !== 'web' }).start();
    setTimeout(() => inputRef.current?.focus(), 200);
  }, []);

  const results = useCallback(() => {
    if (!query.trim() && activeFilter === 'all') return [];
    let res = documents;
    if (activeFilter !== 'all') {
      res = res.filter(d => d.type === activeFilter || d.fileType === activeFilter);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      res = res.filter(d =>
        d.name.toLowerCase().includes(q) ||
        d.tags.some(t => t.includes(q)) ||
        (d.ocrText || '').toLowerCase().includes(q) ||
        (d.description || '').toLowerCase().includes(q) ||
        (d.category || '').toLowerCase().includes(q)
      );
    }
    return res;
  }, [query, activeFilter, documents])();

  const showSuggestions = !query.trim() && activeFilter === 'all';

  const openDoc = (doc) => {
    if (query.trim() && !searchHistory.includes(query.trim())) {
      setSearchHistory(prev => [query.trim(), ...prev.slice(0, 7)]);
    }
    incrementAccess(doc.id);
    router.push(`/document/${doc.id}`);
  };

  return (
    <Animated.View style={[styles.root, { paddingTop: insets.top, opacity: fadeAnim }]}>
      {/* Search bar */}
      <View style={styles.searchHeader}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={C.textMuted} />
          <TextInput
            ref={inputRef}
            style={styles.searchInput}
            placeholder="Search documents, tags, content…"
            placeholderTextColor={C.textMuted}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={18} color={C.textMuted} />
            </TouchableOpacity>
          )}
        </View>
        {query.length > 0 && (
          <TouchableOpacity style={styles.cancelBtn} onPress={() => { setQuery(''); setActiveFilter('all'); }}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter row */}
      <FlatList
        data={FILTER_CATEGORIES}
        keyExtractor={i => i.key}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.chip, activeFilter === item.key && styles.chipActive]}
            onPress={() => setActiveFilter(item.key)}
          >
            <Ionicons name={item.icon} size={13} color={activeFilter === item.key ? '#FFFFFF' : C.textMuted} />
            <Text style={[styles.chipText, activeFilter === item.key && styles.chipTextActive]}>{item.label}</Text>
          </TouchableOpacity>
        )}
      />

      {showSuggestions ? (
        <FlatList
          data={[]}
          ListHeaderComponent={
            <View>
              {searchHistory.length > 0 && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Recent Searches</Text>
                    <TouchableOpacity onPress={() => setSearchHistory([])}>
                      <Text style={styles.clearText}>Clear</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.pillRow}>
                    {searchHistory.map(h => (
                      <TouchableOpacity key={h} style={styles.historyPill} onPress={() => setQuery(h)}>
                        <Ionicons name="time-outline" size={13} color={C.textMuted} />
                        <Text style={styles.historyText}>{h}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Smart Suggestions</Text>
                <View style={styles.pillRow}>
                  {SMART_SUGGESTIONS.map(s => (
                    <TouchableOpacity key={s} style={styles.suggPill} onPress={() => setQuery(s)}>
                      <Ionicons name="sparkles-outline" size={12} color={C.primary} />
                      <Text style={styles.suggText}>{s}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Browse by Category</Text>
                <View style={styles.categoryGrid}>
                  {FILTER_CATEGORIES.filter(c => c.key !== 'all').map(cat => (
                    <TouchableOpacity
                      key={cat.key}
                      style={styles.catCard}
                      onPress={() => setActiveFilter(cat.key)}
                    >
                      <Ionicons name={cat.icon} size={20} color={C.primary} />
                      <Text style={styles.catLabel}>{cat.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          }
          renderItem={() => null}
          keyExtractor={() => 'header'}
        />
      ) : (
        <FlatList
          data={results}
          keyExtractor={d => d.id}
          contentContainerStyle={[styles.resultList, results.length === 0 && { flexGrow: 1 }]}
          renderItem={({ item }) => <SearchResultItem doc={item} onPress={() => openDoc(item)} C={C} />}
          ListHeaderComponent={
            results.length > 0 ? (
              <Text style={styles.resultCount}>{results.length} result{results.length !== 1 ? 's' : ''}</Text>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Ionicons name="search-circle-outline" size={56} color={C.textMuted} />
              <Text style={styles.emptyTitle}>No results for "{query}"</Text>
              <Text style={styles.emptySubtitle}>Try different keywords, tags, or check spelling</Text>
            </View>
          }
        />
      )}
    </Animated.View>
  );
}

function createStyles(C) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: C.backgroundSecondary },
    searchHeader: {
      flexDirection: 'row', alignItems: 'center',
      paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12, gap: 10,
    },
    searchBar: {
      flex: 1, flexDirection: 'row', alignItems: 'center',
      backgroundColor: C.surface, borderRadius: 12, paddingHorizontal: 14,
      borderWidth: 1, borderColor: C.border, gap: 10,
    },
    searchInput: { flex: 1, color: C.text, fontSize: 15, paddingVertical: 12 },
    cancelBtn: { paddingVertical: 8 },
    cancelText: { color: C.primary, fontSize: 14, fontWeight: '500' },
    filterList: { paddingHorizontal: 20, gap: 8, paddingBottom: 10 },
    chip: {
      flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6,
      borderRadius: 16, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, gap: 5,
    },
    chipActive: { backgroundColor: C.primary, borderColor: C.primary },
    chipText: { color: C.textMuted, fontSize: 12 },
    chipTextActive: { color: '#FFFFFF' },
    section: { paddingHorizontal: 20, marginBottom: 24 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    sectionTitle: { color: C.text, fontSize: 16, fontWeight: '700' },
    clearText: { color: C.error, fontSize: 13 },
    pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    historyPill: {
      flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: C.surface,
      borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: C.border,
    },
    historyText: { color: C.textSecondary, fontSize: 13 },
    suggPill: {
      flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: C.primaryMuted,
      borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: hexToRgba(C.primary, 0.27),
    },
    suggText: { color: C.primary, fontSize: 13 },
    categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    catCard: {
      width: '30%', backgroundColor: C.surface, borderRadius: 12,
      padding: 14, alignItems: 'center', gap: 6, borderWidth: 1, borderColor: C.border,
    },
    catLabel: { color: C.textSecondary, fontSize: 11, textAlign: 'center' },
    resultList: { paddingHorizontal: 20, paddingBottom: 100 },
    resultCount: { color: C.textMuted, fontSize: 13, marginBottom: 12 },
    emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60, gap: 12 },
    emptyTitle: { color: C.text, fontSize: 17, fontWeight: '700', textAlign: 'center' },
    emptySubtitle: { color: C.textMuted, fontSize: 13, textAlign: 'center', lineHeight: 20, paddingHorizontal: 20 },
  });
}
