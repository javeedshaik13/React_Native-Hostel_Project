import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, Alert, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { useDocumentStore } from '../../store/documentStore';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../hooks/useToast';
import { useSidebarStore } from '../../store/sidebarStore';
import { hexToRgba } from '../../utils/colorUtils';

function formatBytes(bytes) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FieldRow({ icon, label, value, onChange, editable, keyboardType, C }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', padding: 14 }}>
      <Ionicons name={icon} size={16} color={C.textMuted} style={{ width: 24 }} />
      <View style={{ flex: 1, marginLeft: 10 }}>
        <Text style={{ color: C.textMuted, fontSize: 11, fontWeight: '600', marginBottom: 2 }}>{label}</Text>
        {editable ? (
          <TextInput
            style={{ color: C.text, fontSize: 15, borderBottomWidth: 1, borderBottomColor: C.primary, paddingBottom: 2 }}
            value={value}
            onChangeText={onChange}
            keyboardType={keyboardType}
            placeholderTextColor={C.textMuted}
          />
        ) : (
          <Text style={{ color: C.text, fontSize: 15 }}>{value || '—'}</Text>
        )}
      </View>
    </View>
  );
}

function StorageTypeRow({ label, count, color, C }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', padding: 13, borderBottomWidth: 1, borderBottomColor: C.border }}>
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color, marginRight: 10 }} />
      <Text style={{ flex: 1, color: C.text, fontSize: 14 }}>{label}</Text>
      <Text style={{ color: C.textMuted, fontSize: 13 }}>{count} files</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { C } = useTheme();
  const user = useAuthStore(s => s.user);
  const updateUser = useAuthStore(s => s.updateUser);
  const logout = useAuthStore(s => s.logout);
  const documents = useDocumentStore(s => s.documents);
  const getStorageUsed = useDocumentStore(s => s.getStorageUsed);
  const toast = useToast();
  const showSidebar = useSidebarStore(s => s.show);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.name || '');
  const [email, setEmail] = useState(user.email || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [avatar, setAvatar] = useState(user.avatar || null);

  const storageUsed = getStorageUsed();
  const docCount = documents.length;
  const starredCount = documents.filter(d => d.isStarred).length;
  const encryptedCount = documents.filter(d => d.encrypted).length;

  const styles = useMemo(() => createStyles(C), [C]);

  const initials = user.initials || (user.name
    ? user.name.trim().split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2)
    : '?');

  const pickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchImageLibraryAsync({ aspect: [1, 1], quality: 0.8, allowsEditing: true });
    if (!result.canceled) setAvatar(result.assets[0].uri);
  };

  const saveProfile = () => {
    if (!name.trim()) { Alert.alert('Name required'); return; }
    const newInitials = name.trim().split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
    updateUser({ name: name.trim(), email, phone, avatar, initials: newInitials });
    setEditing(false);
    toast.success('Profile updated successfully');
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={showSidebar} hitSlop={8}>
          <Ionicons name="menu" size={24} color={C.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => editing ? saveProfile() : setEditing(true)}
        >
          <Ionicons name={editing ? 'checkmark' : 'pencil-outline'} size={18} color={editing ? C.success : C.text} style={{ marginRight: 6 }} />
          <Text style={[styles.editBtnText, editing && { color: C.success }]}>{editing ? 'Save' : 'Edit'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={editing ? pickAvatar : undefined} style={styles.avatarWrap}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitials}>{initials}</Text>
              </View>
            )}
            {editing && (
              <View style={styles.avatarEdit}>
                <Ionicons name="camera" size={14} color="#FFFFFF" />
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.userName}>{user.name || 'Your Name'}</Text>
          <Text style={styles.userEmail}>{user.email || ''}</Text>
          <View style={styles.verifiedBadge}>
            <Ionicons name="shield-checkmark" size={14} color={C.success} />
            <Text style={[styles.verifiedText, { color: C.success }]}>Verified Account</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { value: docCount, label: 'Documents', color: C.primary },
            { value: starredCount, label: 'Starred', color: C.warning },
            { value: encryptedCount, label: 'Encrypted', color: C.secondary },
            { value: formatBytes(storageUsed), label: 'Used', color: C.success },
          ].map(s => (
            <View key={s.label} style={styles.statCard}>
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Personal Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.fieldGroup}>
            <FieldRow icon="person-outline" label="Full Name" value={name} onChange={setName} editable={editing} C={C} />
            <View style={{ height: 1, backgroundColor: C.border, marginLeft: 50 }} />
            <FieldRow icon="mail-outline" label="Email" value={email} onChange={setEmail} editable={editing} keyboardType="email-address" C={C} />
            <View style={{ height: 1, backgroundColor: C.border, marginLeft: 50 }} />
            <FieldRow icon="call-outline" label="Phone" value={phone} onChange={setPhone} editable={editing} keyboardType="phone-pad" C={C} />
          </View>
        </View>

        {/* Quick Links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Links</Text>
          <View style={styles.fieldGroup}>
            {[
              { icon: 'documents-outline', label: 'All Documents', onPress: () => router.push('/(app)/documents') },
              { icon: 'settings-outline', label: 'Security Settings', onPress: () => router.push('/(app)/settings') },
              { icon: 'star-outline', label: 'Starred Documents', onPress: () => router.push('/(app)/documents') },
              { icon: 'share-social-outline', label: 'Share & Export', onPress: () => Alert.alert('Share', 'Generate secure links or QR codes for quick sharing.') },
            ].map((item, i, arr) => (
              <React.Fragment key={item.label}>
                <TouchableOpacity style={styles.linkRow} onPress={item.onPress}>
                  <Ionicons name={item.icon} size={18} color={C.primary} />
                  <Text style={styles.linkLabel}>{item.label}</Text>
                  <Ionicons name="chevron-forward" size={16} color={C.textMuted} />
                </TouchableOpacity>
                {i < arr.length - 1 && <View style={{ height: 1, backgroundColor: C.border, marginLeft: 50 }} />}
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* Storage Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Storage Breakdown</Text>
          <View style={styles.fieldGroup}>
            <StorageTypeRow label="ID Documents" count={documents.filter(d => d.type === 'id').length} color={C.doc.id} C={C} />
            <StorageTypeRow label="Certificates" count={documents.filter(d => d.type === 'certificate').length} color={C.doc.certificate} C={C} />
            <StorageTypeRow label="PDFs" count={documents.filter(d => d.fileType === 'pdf').length} color={C.doc.pdf} C={C} />
            <StorageTypeRow label="Images" count={documents.filter(d => d.fileType === 'image').length} color={C.doc.image} C={C} />
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel' },
            { text: 'Logout', style: 'destructive', onPress: logout },
          ])}
        >
          <Ionicons name="log-out-outline" size={18} color={C.error} style={{ marginRight: 8 }} />
          <Text style={styles.logoutText}>Logout</Text>
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
    headerTitle: { flex: 1, textAlign: 'center', color: C.text, fontSize: 22, fontWeight: '700' },
    editBtn: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: C.surfaceElevated, borderRadius: 10,
      paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1, borderColor: C.border,
    },
    editBtnText: { color: C.text, fontSize: 13, fontWeight: '600' },
    avatarSection: {
      alignItems: 'center', paddingVertical: 24,
      backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border,
    },
    avatarWrap: { position: 'relative', marginBottom: 12 },
    avatar: { width: 88, height: 88, borderRadius: 26 },
    avatarPlaceholder: {
      width: 88, height: 88, borderRadius: 26,
      backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center',
    },
    avatarInitials: { color: '#FFFFFF', fontSize: 30, fontWeight: '700' },
    avatarEdit: {
      position: 'absolute', bottom: 0, right: 0, width: 28, height: 28,
      borderRadius: 14, backgroundColor: C.primary,
      alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: C.background,
    },
    userName: { color: C.text, fontSize: 20, fontWeight: '700', marginBottom: 4 },
    userEmail: { color: C.textSecondary, fontSize: 14, marginBottom: 10 },
    verifiedBadge: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: C.successMuted, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4,
    },
    verifiedText: { fontSize: 12, fontWeight: '600' },
    statsRow: { flexDirection: 'row', paddingHorizontal: 20, marginVertical: 16 },
    statCard: {
      flex: 1, backgroundColor: C.surface, borderRadius: 12,
      padding: 12, alignItems: 'center', borderWidth: 1, borderColor: C.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.10,
      shadowRadius: 10,
      elevation: 4,
    },
    statValue: { fontSize: 18, fontWeight: '700', marginBottom: 2 },
    statLabel: { color: C.textMuted, fontSize: 10 },
    section: { paddingHorizontal: 20, marginBottom: 20 },
    sectionTitle: { color: C.text, fontSize: 16, fontWeight: '700', marginBottom: 12 },
    fieldGroup: {
      backgroundColor: C.surface, borderRadius: 14,
      overflow: 'hidden', borderWidth: 1, borderColor: C.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 2,
    },
    linkRow: { flexDirection: 'row', alignItems: 'center', padding: 14 },
    linkLabel: { flex: 1, color: C.text, fontSize: 14, fontWeight: '500' },
    logoutBtn: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      marginHorizontal: 20, marginBottom: 8, padding: 16,
      borderRadius: 14, borderWidth: 1, borderColor: 'rgba(217, 48, 37, 0.33)',
    },
    logoutText: { color: C.error, fontSize: 15, fontWeight: '600' },
  });
}
