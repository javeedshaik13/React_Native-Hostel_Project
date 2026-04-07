import React, { useRef, useEffect, useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions, Animated as RNAnimated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDocumentStore } from '../../store/documentStore';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../contexts/ThemeContext';
import { useSidebarStore } from '../../store/sidebarStore';
import { QUICK_ACCESS_DOCS, DOC_TYPE_CONFIG, DOC_TYPES } from '../../constants/DocumentTypes';
import AnimatedCard, { CARD_SHADOW } from '../../components/ui/AnimatedCard';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 60) / 3;

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 KB';
  if (bytes < 1024) return '1 KB';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function StorageBar({ used, total, C }) {
  const pct = Math.min(total > 0 ? used / total : 0, 1);
  const barAnim = useRef(new RNAnimated.Value(0)).current;
  useEffect(() => {
    RNAnimated.timing(barAnim, { toValue: pct, duration: 1200, useNativeDriver: false, delay: 300 }).start();
  }, [pct]);
  const barWidth = barAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  return (
    <View>
      <View style={{ height: 5, backgroundColor: C.border, borderRadius: 3, overflow: 'hidden' }}>
        <RNAnimated.View style={{ height: 5, backgroundColor: C.primary, borderRadius: 3, width: barWidth }} />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
        <Text style={{ color: C.primary, fontSize: 12, fontWeight: '600' }}>{formatBytes(used)} used</Text>
        <Text style={{ color: C.textMuted, fontSize: 12 }}>{formatBytes(total)} total</Text>
      </View>
    </View>
  );
}

function QuickAccessCard({ item, firstDoc, C }) {
  const router = useRouter();
  const incrementAccess = useDocumentStore(s => s.incrementAccess);
  const onPress = () => {
    if (firstDoc) { incrementAccess(firstDoc.id); router.push(`/document/${firstDoc.id}`); }
    else router.push('/(app)/upload');
  };
  return (
    <AnimatedCard
      onPress={onPress}
      style={{
        width: CARD_WIDTH, backgroundColor: C.surface, borderRadius: 12,
        padding: 12, alignItems: 'center', borderWidth: 1, borderColor: C.border,
        ...CARD_SHADOW.light,
      }}
    >
      <View style={{
        width: 42, height: 42, borderRadius: 11, backgroundColor: C.primaryMuted,
        alignItems: 'center', justifyContent: 'center', marginBottom: 8,
      }}>
        <Ionicons name={item.icon} size={20} color={C.primary} />
      </View>
      <Text style={{ color: C.text, fontSize: 11, fontWeight: '500', textAlign: 'center' }} numberOfLines={1}>
        {item.label}
      </Text>
      {firstDoc
        ? <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: C.success, marginTop: 5 }} />
        : <View style={{
            width: 16, height: 16, borderRadius: 8, backgroundColor: C.surfaceElevated,
            alignItems: 'center', justifyContent: 'center', marginTop: 5,
          }}>
            <Ionicons name="add" size={11} color={C.textMuted} />
          </View>
      }
    </AnimatedCard>
  );
}

function RecentDocCard({ doc, C }) {
  const router = useRouter();
  const incrementAccess = useDocumentStore(s => s.incrementAccess);
  const typeConfig = DOC_TYPE_CONFIG[doc?.type] || DOC_TYPE_CONFIG[DOC_TYPES.OTHER];
  const onPress = () => { 
    if (doc?.id) {
      incrementAccess(doc.id); 
      router.push(`/document/${doc.id}`);
    }
  };
  return (
    <AnimatedCard
      style={{
        flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface,
        borderRadius: 12, padding: 13, marginBottom: 8, borderWidth: 1, borderColor: C.border,
        ...CARD_SHADOW.light,
      }}
      onPress={onPress}
    >
      <View style={{
        width: 42, height: 42, borderRadius: 11, backgroundColor: typeConfig.getBg(C),
        alignItems: 'center', justifyContent: 'center', marginRight: 12,
      }}>
        <Ionicons name={typeConfig.icon} size={20} color={typeConfig.getColor(C)} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: C.text, fontSize: 14, fontWeight: '600', marginBottom: 2 }} numberOfLines={1}>{doc?.name || 'Untitled'}</Text>
        <Text style={{ color: C.textMuted, fontSize: 12 }}>{typeConfig.label}</Text>
      </View>
      {doc?.isStarred && <Ionicons name="star" size={16} color={C.warning} style={{ marginLeft: 8 }} />}
    </AnimatedCard>
  );
}

function StatsRow({ totalByType, C }) {
  const stats = [
    { label: 'ID Docs', count: totalByType.id,          color: C.doc.id },
    { label: 'PDFs',    count: totalByType.pdf,         color: C.doc.pdf },
    { label: 'Images',  count: totalByType.image,       color: C.doc.image },
    { label: 'Certs',   count: totalByType.certificate, color: C.doc.certificate },
  ];
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
      {stats.map(s => (
        <View key={s.label} style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 20, fontWeight: '700', color: s.color }}>{s.count}</Text>
          <Text style={{ color: C.textMuted, fontSize: 11, marginTop: 2 }}>{s.label}</Text>
        </View>
      ))}
    </View>
  );
}

export default function DashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { C } = useTheme();
  const user = useAuthStore(s => s.user);
  const getRecentDocs = useDocumentStore(s => s.getRecentDocs);
  const getQuickAccessDocs = useDocumentStore(s => s.getQuickAccessDocs);
  const getStorageUsed = useDocumentStore(s => s.getStorageUsed);
  const getTotalByType = useDocumentStore(s => s.getTotalByType);
  const showSidebar = useSidebarStore(s => s.show);

  const recentDocs = getRecentDocs() || [];
  const storageUsed = getStorageUsed() || 0;
  const totalByType = getTotalByType() || { id: 0, pdf: 0, image: 0, certificate: 0 };
  const styles = useMemo(() => createStyles(C), [C]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.name ? user.name.split(' ')[0] : 'there';
  const initials = user?.initials || (user?.name
    ? user.name.trim().split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2)
    : '?');

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={showSidebar} hitSlop={8} style={{ marginRight: 16 }}>
          <Ionicons name="menu" size={24} color={C.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>{greeting},</Text>
          <Text style={styles.userName}>{firstName}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => router.push('/(app)/search')}>
            <Ionicons name="search-outline" size={22} color={C.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn} onPress={() => router.push('/(app)/profile')}>
            <View style={styles.avatarSmall}>
              <Text style={styles.avatarInitials}>{initials}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Storage Card */}
        <View style={styles.storageCard}>
          <View style={styles.storageHeader}>
            <View>
              <Text style={styles.sectionTitle}>Storage</Text>
              <Text style={styles.storageSubtitle}>Local documents</Text>
            </View>
            <View style={styles.syncBadge}>
              <Ionicons name="cloud-done-outline" size={14} color={C.success} />
              <Text style={[styles.syncText, { color: C.success }]}>Synced</Text>
            </View>
          </View>
          <StorageBar used={storageUsed} total={user?.storageLimit || 1073741824} C={C} />
          <View style={styles.divider} />
          <StatsRow totalByType={totalByType} C={C} />
        </View>

        {/* Quick Access */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Access</Text>
            <TouchableOpacity onPress={() => router.push('/(app)/documents')}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.qaGrid}>
            {QUICK_ACCESS_DOCS?.map(item => {
              const docs = getQuickAccessDocs(item.docTag) || [];
              return <QuickAccessCard key={item.id} item={item} firstDoc={docs[0] || null} C={C} />;
            })}
          </View>
        </View>

        {/* Recent Documents */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent</Text>
            <TouchableOpacity onPress={() => router.push('/(app)/documents')}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          {recentDocs?.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="document-outline" size={44} color={C.textMuted} />
              <Text style={styles.emptyTitle}>No documents yet</Text>
              <Text style={styles.emptySubtitle}>Upload your first document to get started</Text>
            </View>
          ) : (
            recentDocs?.map(doc => <RecentDocCard key={doc?.id} doc={doc} C={C} />)
          )}
        </View>

        {/* Upload CTA */}
        <TouchableOpacity style={styles.uploadCTA} onPress={() => router.push('/(app)/upload')} activeOpacity={0.85}>
          <Ionicons name="cloud-upload-outline" size={22} color="#FFFFFF" />
          <View style={{ marginLeft: 14, flex: 1 }}>
            <Text style={styles.ctaTitle}>Upload a document</Text>
            <Text style={styles.ctaSubtitle}>PDFs, images, certificates & more</Text>
          </View>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </ScrollView>
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
    greeting: { color: C.textSecondary, fontSize: 14 },
    userName: { color: C.text, fontSize: 22, fontWeight: '700', marginTop: 2 },
    headerActions: { flexDirection: 'row', gap: 10 },
    headerBtn: {
      width: 40, height: 40, borderRadius: 12, backgroundColor: C.surfaceElevated,
      alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border,
    },
    avatarSmall: { width: 36, height: 36, borderRadius: 10, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' },
    avatarInitials: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
    scroll: { flex: 1 },
    storageCard: {
      margin: 20, borderRadius: 14, padding: 18,
      backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.10,
      shadowRadius: 10,
      elevation: 4,
    },
    storageHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
    storageSubtitle: { color: C.textMuted, fontSize: 12, marginTop: 2 },
    syncBadge: {
      flexDirection: 'row', alignItems: 'center', borderRadius: 8,
      paddingHorizontal: 8, paddingVertical: 4, gap: 4, backgroundColor: C.successMuted,
    },
    syncText: { fontSize: 11, fontWeight: '600' },
    divider: { height: 1, backgroundColor: C.border, marginVertical: 14 },
    section: { paddingHorizontal: 20, marginBottom: 8 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
    sectionTitle: { color: C.text, fontSize: 17, fontWeight: '700' },
    seeAll: { color: C.primary, fontSize: 13, fontWeight: '500' },
    qaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    emptyState: { alignItems: 'center', paddingVertical: 40, gap: 8 },
    emptyTitle: { color: C.text, fontSize: 16, fontWeight: '600' },
    emptySubtitle: { color: C.textMuted, fontSize: 13, textAlign: 'center', lineHeight: 20 },
    uploadCTA: {
      flexDirection: 'row', alignItems: 'center',
      marginHorizontal: 20, marginTop: 16, marginBottom: 8, padding: 18,
      borderRadius: 14, backgroundColor: C.primary,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.20,
      shadowRadius: 12,
      elevation: 6,
    },
    ctaTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
    ctaSubtitle: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 2 },
  });
}
