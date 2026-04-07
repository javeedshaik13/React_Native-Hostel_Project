import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDocumentStore } from '../../store/documentStore';
import { useTheme } from '../../contexts/ThemeContext';
import { FILTER_CATEGORIES, SORT_OPTIONS, DOC_TYPE_CONFIG, DOC_TYPES } from '../../constants/DocumentTypes';

function formatBytes(bytes) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' });
}

function DocumentListItem({ doc, onPress, C }) {
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
        width: 46, height: 46, borderRadius: 12, backgroundColor: typeConfig.getBg(C),
        alignItems: 'center', justifyContent: 'center', marginRight: 12,
      }}>
        <Ionicons name={typeConfig.icon} size={22} color={typeConfig.getColor(C)} />
      </View>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 }}>
          <Text style={{ color: C.text, fontSize: 15, fontWeight: '600', flex: 1 }} numberOfLines={1}>{doc.name}</Text>
          {doc.isStarred && <Ionicons name="star" size={13} color={C.warning} />}
        </View>
        <Text style={{ color: C.textMuted, fontSize: 12, marginBottom: 5 }}>
          {formatBytes(doc.size)} · {formatDate(doc.updatedAt)} · {doc.accessCount} views
        </Text>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {doc.tags.slice(0, 2).map(t => (
            <View key={t} style={{ backgroundColor: C.surfaceElevated, borderRadius: 5, paddingHorizontal: 7, paddingVertical: 2 }}>
              <Text style={{ color: C.textSecondary, fontSize: 11 }}>#{t}</Text>
            </View>
          ))}
        </View>
      </View>
      <View style={{ alignItems: 'center', marginLeft: 8 }}>
        {doc.encrypted && <Ionicons name="lock-closed" size={13} color={C.textMuted} style={{ marginBottom: 4 }} />}
        <Ionicons name="chevron-forward" size={16} color={C.textMuted} />
      </View>
    </TouchableOpacity>
  );
}

function DocumentGridItem({ doc, onPress, C }) {
  const typeConfig = DOC_TYPE_CONFIG[doc.type] || DOC_TYPE_CONFIG[DOC_TYPES.OTHER];
  return (
    <TouchableOpacity
      style={{
        flex: 1, margin: 4, backgroundColor: C.surface, borderRadius: 12,
        padding: 14, alignItems: 'center', borderWidth: 1, borderColor: C.border,
      }}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={{
        width: 60, height: 60, borderRadius: 14, backgroundColor: typeConfig.getBg(C),
        alignItems: 'center', justifyContent: 'center', marginBottom: 10, position: 'relative',
      }}>
        <Ionicons name={typeConfig.icon} size={30} color={typeConfig.getColor(C)} />
        {doc.encrypted && (
          <View style={{
            position: 'absolute', bottom: 0, right: 0, width: 16, height: 16, borderRadius: 8,
            backgroundColor: C.surfaceElevated, alignItems: 'center', justifyContent: 'center',
          }}>
            <Ionicons name="lock-closed" size={10} color={C.textMuted} />
          </View>
        )}
      </View>
      <Text style={{ color: C.text, fontSize: 13, fontWeight: '600', textAlign: 'center', marginBottom: 4 }} numberOfLines={2}>
        {doc.name}
      </Text>
      <Text style={{ color: C.textMuted, fontSize: 11 }}>{formatBytes(doc.size)}</Text>
    </TouchableOpacity>
  );
}

function SortModal({ visible, currentSort, onSelect, onClose, C }) {
  if (!visible) return null;
  return (
    <TouchableOpacity
      style={{ ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100 }}
      onPress={onClose}
      activeOpacity={1}
    >
      <View style={{
        backgroundColor: C.surfaceElevated, borderTopLeftRadius: 22, borderTopRightRadius: 22,
        padding: 24, paddingBottom: 40,
      }}>
        <Text style={{ color: C.text, fontSize: 17, fontWeight: '700', marginBottom: 16 }}>Sort by</Text>
        {SORT_OPTIONS.map(opt => (
          <TouchableOpacity
            key={opt.key}
            style={{
              flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
              paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: C.border,
            }}
            onPress={() => { onSelect(opt.key); onClose(); }}
          >
            <Text style={{ color: currentSort === opt.key ? C.primary : C.textSecondary, fontSize: 15, fontWeight: currentSort === opt.key ? '600' : '400' }}>
              {opt.label}
            </Text>
            {currentSort === opt.key && <Ionicons name="checkmark" size={16} color={C.primary} />}
          </TouchableOpacity>
        ))}
      </View>
    </TouchableOpacity>
  );
}

export default function DocumentsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { C } = useTheme();
  const [showSort, setShowSort] = useState(false);

  const activeFilter = useDocumentStore(s => s.activeFilter);
  const sortKey = useDocumentStore(s => s.sortKey);
  const searchQuery = useDocumentStore(s => s.searchQuery);
  const isGridView = useDocumentStore(s => s.isGridView);
  const setFilter = useDocumentStore(s => s.setFilter);
  const setSort = useDocumentStore(s => s.setSort);
  const setSearch = useDocumentStore(s => s.setSearch);
  const toggleView = useDocumentStore(s => s.toggleView);
  const getFilteredDocs = useDocumentStore(s => s.getFilteredDocs);
  const incrementAccess = useDocumentStore(s => s.incrementAccess);

  const docs = getFilteredDocs();
  const styles = useMemo(() => createStyles(C), [C]);

  const openDoc = useCallback((doc) => {
    incrementAccess(doc.id);
    router.push(`/document/${doc.id}`);
  }, []);

  const renderItem = useCallback(({ item }) => {
    if (isGridView) return <DocumentGridItem doc={item} onPress={() => openDoc(item)} C={C} />;
    return <DocumentListItem doc={item} onPress={() => openDoc(item)} C={C} />;
  }, [isGridView, openDoc, C]);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Documents</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity style={styles.iconBtn} onPress={toggleView}>
            <Ionicons name={isGridView ? 'list' : 'grid-outline'} size={20} color={C.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => setShowSort(true)}>
            <Ionicons name="funnel-outline" size={20} color={C.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search bar */}
      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={18} color={C.textMuted} style={{ marginRight: 10 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search documents, tags, content…"
          placeholderTextColor={C.textMuted}
          value={searchQuery}
          onChangeText={setSearch}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={C.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Category filter */}
      <FlatList
        data={FILTER_CATEGORIES}
        keyExtractor={i => i.key}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.filterChip, activeFilter === item.key && styles.filterChipActive]}
            onPress={() => setFilter(item.key)}
          >
            <Ionicons name={item.icon} size={14} color={activeFilter === item.key ? '#FFFFFF' : C.textMuted} />
            <Text style={[styles.filterText, activeFilter === item.key && styles.filterTextActive]}>{item.label}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Count row */}
      <View style={styles.countRow}>
        <Text style={styles.countText}>{docs.length} document{docs.length !== 1 ? 's' : ''}</Text>
        <Text style={styles.sortLabel}>{SORT_OPTIONS.find(s => s.key === sortKey)?.label}</Text>
      </View>

      {/* List / Grid */}
      <FlatList
        data={docs}
        keyExtractor={d => d.id}
        renderItem={renderItem}
        numColumns={isGridView ? 2 : 1}
        key={isGridView ? 'grid' : 'list'}
        contentContainerStyle={[styles.docList, docs.length === 0 && { flexGrow: 1 }]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons name="folder-open-outline" size={56} color={C.textMuted} />
            <Text style={styles.emptyTitle}>No documents found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? 'Try different keywords or tags' : 'Upload your first document to get started'}
            </Text>
          </View>
        }
      />

      <SortModal visible={showSort} currentSort={sortKey} onSelect={setSort} onClose={() => setShowSort(false)} C={C} />
    </View>
  );
}

function createStyles(C) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: C.backgroundSecondary },
    header: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      paddingHorizontal: 20, paddingVertical: 16,
      backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border,
    },
    headerTitle: { color: C.text, fontSize: 22, fontWeight: '700' },
    iconBtn: {
      width: 38, height: 38, borderRadius: 10, backgroundColor: C.surfaceElevated,
      alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border,
    },
    searchWrap: {
      flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface,
      borderRadius: 12, marginHorizontal: 20, marginTop: 12, paddingHorizontal: 14,
      borderWidth: 1, borderColor: C.border, marginBottom: 12,
    },
    searchInput: { flex: 1, color: C.text, fontSize: 15, paddingVertical: 12 },
    filterList: { paddingHorizontal: 20, gap: 8, paddingBottom: 12 },
    filterChip: {
      flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 7,
      borderRadius: 20, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, gap: 5,
    },
    filterChipActive: { backgroundColor: C.primary, borderColor: C.primary },
    filterText: { color: C.textMuted, fontSize: 13, fontWeight: '500' },
    filterTextActive: { color: '#FFFFFF' },
    countRow: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      paddingHorizontal: 20, marginBottom: 10,
    },
    countText: { color: C.textSecondary, fontSize: 13 },
    sortLabel: { color: C.textMuted, fontSize: 12 },
    docList: { paddingHorizontal: 16, paddingBottom: 120 },
    emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, gap: 12 },
    emptyTitle: { color: C.text, fontSize: 18, fontWeight: '700' },
    emptySubtitle: { color: C.textMuted, fontSize: 14, textAlign: 'center', lineHeight: 20 },
  });
}
