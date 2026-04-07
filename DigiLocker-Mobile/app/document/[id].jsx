import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Alert, Modal, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDocumentStore } from '../../store/documentStore';
import { useTheme } from '../../contexts/ThemeContext';
import { DOC_TYPE_CONFIG, DOC_TYPES } from '../../constants/DocumentTypes';
import {
  openFileWithSystem,
  shareDocumentFile,
  exportDocumentFile,
} from '../../utils/fileStorage';
import {
  verifyDocPassword,
  storeDocPassword,
  clearDocPassword,
  isPasswordSet,
} from '../../utils/secureAccess';
import { hexToRgba } from '../../utils/colorUtils';

// ─────────────────────────────────────────────────────────────────────────────

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '—';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

// ── DetailRow ─────────────────────────────────────────────────────────────────
function DetailRow({ label, value, icon, C }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 13 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Ionicons name={icon} size={15} color={C.textMuted} />
        <Text style={{ color: C.textMuted, fontSize: 13 }}>{label}</Text>
      </View>
      <Text style={{ color: C.text, fontSize: 13, fontWeight: '500', maxWidth: '55%', textAlign: 'right' }}>{value}</Text>
    </View>
  );
}

// ── ActionButton ──────────────────────────────────────────────────────────────
function ActionButton({ icon, label, color, onPress, danger, busy, C }) {
  return (
    <TouchableOpacity
      style={{
        flex: 1, alignItems: 'center', justifyContent: 'center',
        backgroundColor: danger ? C.errorMuted : C.surface,
        borderRadius: 12, paddingVertical: 12, gap: 6, borderWidth: 1,
        borderColor: danger ? hexToRgba(C.error, 0.27) : C.border, minHeight: 68,
      }}
      onPress={onPress}
      disabled={busy}
      activeOpacity={0.75}
    >
      {busy
        ? <ActivityIndicator size="small" color={color || C.primary} />
        : <Ionicons name={icon} size={20} color={color || C.primary} />
      }
      <Text style={{ fontSize: 11, fontWeight: '600', color: color || C.primary }}>{label}</Text>
    </TouchableOpacity>
  );
}

// ── PasswordModal (cross-platform: no Alert.prompt) ───────────────────────────
// mode = 'verify' | 'set'
function PasswordModal({ visible, mode, onConfirm, onCancel, error, C }) {
  const [pw,      setPw]      = useState('');
  const [confirm, setConfirm] = useState('');
  const [localErr, setLocalErr] = useState('');

  const reset = () => { setPw(''); setConfirm(''); setLocalErr(''); };
  const finalErr = localErr || error;

  const handleConfirm = () => {
    if (mode === 'set') {
      if (pw.length < 4)  { setLocalErr('Password must be at least 4 characters.'); return; }
      if (pw !== confirm) { setLocalErr('Passwords do not match.'); return; }
    } else {
      if (!pw) { setLocalErr('Please enter the password.'); return; }
    }
    const val = pw;
    reset();
    onConfirm(val);
  };

  const handleCancel = () => { reset(); onCancel(); };

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.55)' }}
      >
        <View style={{ width: '88%', backgroundColor: C.surface, borderRadius: 18, padding: 24, borderWidth: 1, borderColor: C.border }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <Ionicons name="lock-closed" size={20} color={C.primary} />
            <Text style={{ color: C.text, fontSize: 18, fontWeight: '700' }}>
              {mode === 'set' ? 'Set Password' : 'Password Required'}
            </Text>
          </View>
          <Text style={{ color: C.textSecondary, fontSize: 13, marginBottom: 20, lineHeight: 19 }}>
            {mode === 'set'
              ? 'Choose a password to protect this document. You will need it every time you open it.'
              : 'This document is password-protected. Enter the password to continue.'
            }
          </Text>

          <Text style={{ color: C.textSecondary, fontSize: 11, fontWeight: '700', letterSpacing: 0.5, marginBottom: 6 }}>
            {mode === 'set' ? 'NEW PASSWORD' : 'PASSWORD'}
          </Text>
          <TextInput
            style={{
              backgroundColor: C.surfaceElevated, borderRadius: 10, padding: 13,
              fontSize: 15, color: C.text, borderWidth: 1,
              borderColor: finalErr ? C.error : C.border, marginBottom: 12,
            }}
            placeholder={mode === 'set' ? 'Min. 4 characters' : 'Enter password'}
            placeholderTextColor={C.textMuted}
            secureTextEntry
            value={pw}
            onChangeText={v => { setPw(v); setLocalErr(''); }}
            autoFocus
          />

          {mode === 'set' && (
            <>
              <Text style={{ color: C.textSecondary, fontSize: 11, fontWeight: '700', letterSpacing: 0.5, marginBottom: 6 }}>
                CONFIRM PASSWORD
              </Text>
              <TextInput
                style={{
                  backgroundColor: C.surfaceElevated, borderRadius: 10, padding: 13,
                  fontSize: 15, color: C.text, borderWidth: 1,
                  borderColor: finalErr ? C.error : C.border, marginBottom: 12,
                }}
                placeholder="Re-enter password"
                placeholderTextColor={C.textMuted}
                secureTextEntry
                value={confirm}
                onChangeText={v => { setConfirm(v); setLocalErr(''); }}
              />
            </>
          )}

          {!!finalErr && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14 }}>
              <Ionicons name="alert-circle" size={14} color={C.error} />
              <Text style={{ color: C.error, fontSize: 13, flex: 1 }}>{finalErr}</Text>
            </View>
          )}

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity
              style={{ flex: 1, padding: 14, borderRadius: 10, borderWidth: 1, borderColor: C.border, alignItems: 'center' }}
              onPress={handleCancel}
            >
              <Text style={{ color: C.textSecondary, fontWeight: '600' }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ flex: 1, padding: 14, borderRadius: 10, backgroundColor: C.primary, alignItems: 'center' }}
              onPress={handleConfirm}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>
                {mode === 'set' ? 'Set Password' : 'Unlock'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function DocumentDetailScreen() {
  const { id }   = useLocalSearchParams();
  const router   = useRouter();
  const insets   = useSafeAreaInsets();
  const { C }    = useTheme();

  const getDocById     = useDocumentStore(s => s.getDocById);
  const toggleStar     = useDocumentStore(s => s.toggleStar);
  const deleteDocument = useDocumentStore(s => s.deleteDocument);
  const updateDocument = useDocumentStore(s => s.updateDocument);

  const doc = getDocById(id);

  // Session-level unlock: once the user enters the correct password, they
  // don't need to re-enter it for every action within this screen visit.
  const [isUnlocked,  setIsUnlocked]  = useState(false);
  const [showOCR,     setShowOCR]     = useState(false);
  const [actionBusy,  setActionBusy]  = useState(null); // 'open'|'share'|'export'|'qr'
  const [modal,       setModal]       = useState({ visible: false, mode: 'verify', pwError: '', onSuccess: null });

  const styles = useMemo(() => createStyles(C), [C]);

  if (!doc) {
    return (
      <View style={[styles.notFound, { paddingTop: insets.top }]}>
        <Ionicons name="document-outline" size={64} color={C.textMuted} />
        <Text style={{ color: C.textSecondary, fontSize: 16 }}>Document not found</Text>
        <TouchableOpacity style={styles.goBackBtn} onPress={() => router.back()}>
          <Text style={{ color: C.primary }}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const typeConfig = DOC_TYPE_CONFIG[doc.type] || DOC_TYPE_CONFIG[DOC_TYPES.OTHER];

  // ── Password modal helpers ────────────────────────────────────────────────
  const showVerifyModal = (onSuccess) =>
    setModal({ visible: true, mode: 'verify', pwError: '', onSuccess });

  const showSetModal = (onSuccess) =>
    setModal({ visible: true, mode: 'set', pwError: '', onSuccess });

  const handleModalConfirm = async (password) => {
    if (modal.mode === 'verify') {
      const ok = await verifyDocPassword(doc.id, password);
      if (!ok) {
        setModal(m => ({ ...m, pwError: 'Incorrect password. Please try again.' }));
        return;
      }
      setIsUnlocked(true);
    }
    setModal({ visible: false, mode: 'verify', pwError: '', onSuccess: null });
    modal.onSuccess?.(password);
  };

  const handleModalCancel = () =>
    setModal({ visible: false, mode: 'verify', pwError: '', onSuccess: null });

  // ── Encryption gate: runs action if unlocked, else shows verify modal ────
  const withPasswordGate = useCallback((action) => {
    if (doc.encrypted && !isUnlocked) {
      showVerifyModal(() => action());
    } else {
      action();
    }
  }, [doc.encrypted, isUnlocked]);

  // ── Action handlers ───────────────────────────────────────────────────────
  const handleOpen = () => withPasswordGate(async () => {
    if (!doc.localUri) {
      Alert.alert('No file', 'This document has no associated file on this device.');
      return;
    }
    setActionBusy('open');
    try {
      const ok = await openFileWithSystem(doc.localUri);
      if (!ok) Alert.alert('Cannot open', 'No app found on this device to open this file type.');
    } catch (e) {
      Alert.alert('Error', 'Could not open the file.\n' + (e?.message || ''));
    } finally {
      setActionBusy(null);
    }
  });

  const handleShare = () => withPasswordGate(async () => {
    if (!doc.localUri) {
      Alert.alert('No file', 'This document has no file to share.');
      return;
    }
    setActionBusy('share');
    try {
      await shareDocumentFile(doc.localUri, doc.name);
    } catch (e) {
      Alert.alert('Share failed', e?.message || 'Could not share the file.');
    } finally {
      setActionBusy(null);
    }
  });

  const handleExport = () => withPasswordGate(async () => {
    if (!doc.localUri) {
      Alert.alert('No file', 'This document has no file to export.');
      return;
    }
    setActionBusy('export');
    try {
      await exportDocumentFile(doc.localUri, doc.name);
    } catch (e) {
      Alert.alert('Export failed', e?.message || 'Could not export the file.');
    } finally {
      setActionBusy(null);
    }
  });

  const handleQR = () => withPasswordGate(async () => {
    setActionBusy('qr');
    const info = [
      `📄 ${doc.name}`,
      `Type:    ${typeConfig.label}`,
      `Size:    ${formatBytes(doc.size)}`,
      `Tags:    ${doc.tags.map(t => '#' + t).join(', ') || '—'}`,
      `Added:   ${formatDate(doc.createdAt)}`,
      doc.encrypted ? '🔒 Password protected' : '',
      '',
      'Shared from DigiLocker (offline vault)',
    ].filter(Boolean).join('\n');

    try {
      const { Share } = require('react-native');
      await Share.share({ title: doc.name, message: info });
    } catch {}
    setActionBusy(null);
  });

  // ── Encryption toggle ─────────────────────────────────────────────────────
  const handleToggleEncrypt = async () => {
    if (doc.encrypted) {
      // Disabling: verify the old password first
      showVerifyModal(async () => {
        await clearDocPassword(doc.id);
        updateDocument(doc.id, { encrypted: false });
        setIsUnlocked(false);
        Alert.alert('Protection removed', 'This document is no longer password-protected.');
      });
    } else {
      // Enabling: set a new password
      showSetModal(async (password) => {
        await storeDocPassword(doc.id, password);
        updateDocument(doc.id, { encrypted: true });
        setIsUnlocked(true);
        Alert.alert('Protection enabled', 'This document is now password-protected.');
      });
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = () => {
    Alert.alert(
      'Delete Document',
      `Permanently delete "${doc.name}"? This will also delete the file from your device.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => {
            if (doc.encrypted) await clearDocPassword(doc.id).catch(() => {});
            await deleteDocument(doc.id);
            router.back();
          },
        },
      ]
    );
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={C.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{doc.name}</Text>
        <TouchableOpacity style={styles.headerBtn} onPress={() => toggleStar(doc.id)}>
          <Ionicons
            name={doc.isStarred ? 'star' : 'star-outline'}
            size={20}
            color={doc.isStarred ? C.warning : C.text}
          />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
        {/* Preview card */}
        <View style={[styles.previewCard, { backgroundColor: typeConfig.getBg(C) }]}>
          <View style={[styles.previewIcon, { backgroundColor: typeConfig.getColor(C) + '22' }]}>
            <Ionicons name={typeConfig.icon} size={48} color={typeConfig.getColor(C)} />
          </View>
          <Text style={styles.previewName}>{doc.name}</Text>
          <Text style={styles.previewMeta}>{typeConfig.label} · {formatBytes(doc.size)}</Text>

          <View style={styles.badgesRow}>
            {doc.encrypted && (
              <View style={[styles.badge, { backgroundColor: C.secondaryMuted }]}>
                <Ionicons name="lock-closed" size={12} color={C.secondary} />
                <Text style={[styles.badgeText, { color: C.secondary }]}>
                  {isUnlocked ? 'Unlocked' : 'Password Protected'}
                </Text>
              </View>
            )}
            {doc.isStarred && (
              <View style={[styles.badge, { backgroundColor: C.warningMuted }]}>
                <Ionicons name="star" size={12} color={C.warning} />
                <Text style={[styles.badgeText, { color: C.warning }]}>Starred</Text>
              </View>
            )}
            <View style={[styles.badge, { backgroundColor: C.surfaceElevated }]}>
              <Ionicons name="eye-outline" size={12} color={C.textSecondary} />
              <Text style={[styles.badgeText, { color: C.textSecondary }]}>{doc.accessCount} views</Text>
            </View>
          </View>
        </View>

        {/* Action buttons */}
        <View style={styles.actionsRow}>
          <ActionButton
            icon="open-outline"   label="Open"
            busy={actionBusy === 'open'}
            onPress={handleOpen}  C={C}
          />
          <ActionButton
            icon="share-outline"  label="Share"
            busy={actionBusy === 'share'}
            onPress={handleShare} C={C}
          />
          <ActionButton
            icon="download-outline" label="Export"
            busy={actionBusy === 'export'}
            onPress={handleExport}  C={C}
          />
          <ActionButton
            icon="qr-code-outline" label="QR Share"
            color={C.success}
            busy={actionBusy === 'qr'}
            onPress={handleQR}     C={C}
          />
        </View>

        {/* Unlock hint */}
        {doc.encrypted && !isUnlocked && (
          <TouchableOpacity
            style={[styles.unlockBanner, { backgroundColor: C.primaryMuted, borderColor: hexToRgba(C.primary, 0.27) }]}
            onPress={() => showVerifyModal(() => {})}
          >
            <Ionicons name="lock-closed-outline" size={16} color={C.primary} />
            <Text style={{ color: C.primary, fontSize: 13, fontWeight: '600' }}>
              Tap to unlock — actions require password
            </Text>
          </TouchableOpacity>
        )}

        {/* Document info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Document Info</Text>
          <View style={styles.detailCard}>
            <DetailRow label="Category"  value={doc.category || '—'}             icon="folder-outline"   C={C} />
            <View style={styles.detailDivider} />
            <DetailRow label="File type" value={(doc.fileType || '—').toUpperCase()} icon="document-outline" C={C} />
            <View style={styles.detailDivider} />
            <DetailRow label="File size" value={formatBytes(doc.size)}            icon="save-outline"     C={C} />
            <View style={styles.detailDivider} />
            <DetailRow label="Created"   value={formatDate(doc.createdAt)}        icon="calendar-outline" C={C} />
            <View style={styles.detailDivider} />
            <DetailRow label="Modified"  value={formatDate(doc.updatedAt)}        icon="time-outline"     C={C} />
          </View>
        </View>

        {/* Description */}
        {!!doc.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <View style={styles.descCard}>
              <Text style={{ color: C.textSecondary, fontSize: 14, lineHeight: 20 }}>{doc.description}</Text>
            </View>
          </View>
        )}

        {/* Tags */}
        {doc.tags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tags</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {doc.tags.map(t => (
                <View key={t} style={[styles.tagChip, { backgroundColor: C.surfaceElevated }]}>
                  <Text style={{ color: C.textSecondary, fontSize: 13 }}>#{t}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Security */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          <View style={styles.securityCard}>
            <TouchableOpacity style={styles.securityRow} onPress={handleToggleEncrypt}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <View style={[styles.secIconWrap, { backgroundColor: doc.encrypted ? C.secondaryMuted : C.surfaceElevated }]}>
                  <Ionicons
                    name={doc.encrypted ? 'lock-closed' : 'lock-open-outline'}
                    size={17}
                    color={doc.encrypted ? C.secondary : C.textMuted}
                  />
                </View>
                <View style={{ marginLeft: 12 }}>
                  <Text style={{ color: C.text, fontSize: 14, fontWeight: '600' }}>
                    {doc.encrypted ? 'Password Protected' : 'No Protection'}
                  </Text>
                  <Text style={{ color: C.textMuted, fontSize: 12, marginTop: 2 }}>
                    {doc.encrypted
                      ? 'Password required to open or share'
                      : 'Tap to add a password'}
                  </Text>
                </View>
              </View>
              <View style={[styles.secToggle, { backgroundColor: doc.encrypted ? C.secondary : C.border }]}>
                <View style={[styles.secThumb, doc.encrypted && styles.secThumbOn]} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Delete */}
        <View style={[styles.section, { marginBottom: 20 }]}>
          <TouchableOpacity
            style={[styles.deleteBtn, { borderColor: hexToRgba(C.error, 0.33) }]}
            onPress={handleDelete}
            activeOpacity={0.8}
          >
            <Ionicons name="trash-outline" size={17} color={C.error} />
            <Text style={{ color: C.error, fontSize: 14, fontWeight: '600' }}>Delete Document</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Password modal */}
      <PasswordModal
        visible={modal.visible}
        mode={modal.mode}
        error={modal.pwError}
        onConfirm={handleModalConfirm}
        onCancel={handleModalCancel}
        C={C}
      />
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function createStyles(C) {
  return StyleSheet.create({
    root:       { flex: 1, backgroundColor: C.backgroundSecondary },
    header:     {
      flexDirection: 'row', alignItems: 'center',
      paddingHorizontal: 16, paddingVertical: 12, gap: 12,
      backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border,
    },
    headerBtn:  {
      width: 38, height: 38, borderRadius: 10, backgroundColor: C.surfaceElevated,
      alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border,
    },
    headerTitle: { flex: 1, color: C.text, fontSize: 16, fontWeight: '700' },
    previewCard: {
      marginHorizontal: 20, marginVertical: 16, borderRadius: 18, padding: 28,
      alignItems: 'center', borderWidth: 1, borderColor: C.border,
    },
    previewIcon: {
      width: 88, height: 88, borderRadius: 22,
      alignItems: 'center', justifyContent: 'center', marginBottom: 14,
    },
    previewName: { color: C.text,          fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 6 },
    previewMeta: { color: C.textSecondary, fontSize: 14, marginBottom: 12 },
    badgesRow:   { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' },
    badge:       { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
    badgeText:   { fontSize: 11, fontWeight: '500' },
    actionsRow:  { flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 8 },
    unlockBanner: {
      flexDirection: 'row', alignItems: 'center', gap: 8,
      marginHorizontal: 20, marginBottom: 8, padding: 12,
      borderRadius: 10, borderWidth: 1,
    },
    section:     { paddingHorizontal: 20, marginTop: 20 },
    sectionTitle: { color: C.text, fontSize: 16, fontWeight: '700', marginBottom: 10 },
    detailCard:  {
      backgroundColor: C.surface, borderRadius: 14,
      overflow: 'hidden', borderWidth: 1, borderColor: C.border,
    },
    detailDivider: { height: 1, backgroundColor: C.border, marginLeft: 36 },
    descCard:    {
      backgroundColor: C.surface, borderRadius: 12, padding: 14,
      borderWidth: 1, borderColor: C.border,
    },
    tagChip:     { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
    securityCard: {
      backgroundColor: C.surface, borderRadius: 13,
      overflow: 'hidden', borderWidth: 1, borderColor: C.border,
    },
    securityRow:  {
      flexDirection: 'row', alignItems: 'center',
      justifyContent: 'space-between', padding: 14,
    },
    secIconWrap:  {
      width: 36, height: 36, borderRadius: 10,
      alignItems: 'center', justifyContent: 'center',
    },
    secToggle:   { width: 44, height: 24, borderRadius: 12, justifyContent: 'center', paddingHorizontal: 2 },
    secThumb:    { width: 20, height: 20, borderRadius: 10, backgroundColor: C.textSecondary },
    secThumbOn:  { backgroundColor: '#FFFFFF', transform: [{ translateX: 20 }] },
    deleteBtn:   {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      padding: 15, borderRadius: 12, borderWidth: 1, gap: 8,
    },
    goBackBtn:   {
      backgroundColor: C.surface, borderRadius: 10,
      paddingHorizontal: 16, paddingVertical: 8, borderWidth: 1, borderColor: C.border,
    },
    notFound:    { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: C.background },
  });
}
