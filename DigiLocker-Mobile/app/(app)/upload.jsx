import React, { useState, useRef, useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, Alert, Animated, ActivityIndicator, Modal, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDocumentStore } from '../../store/documentStore';
import { useTheme } from '../../contexts/ThemeContext';
import { DOC_TYPE_CONFIG, DOC_CATEGORIES, COMMON_TAGS } from '../../constants/DocumentTypes';
import { copyFileToVault } from '../../utils/fileStorage';
import { storeDocPassword } from '../../utils/secureAccess';
import { hexToRgba } from '../../utils/colorUtils';

const FILE_SOURCES = [
  { key: 'pdf',   label: 'PDF / File',  icon: 'document-text', typeKey: 'pdf',   pick: 'document' },
  { key: 'image', label: 'Photo',        icon: 'image',         typeKey: 'image', pick: 'image'    },
  { key: 'video', label: 'Video',        icon: 'videocam',      typeKey: 'video', pick: 'image'    },
  { key: 'audio', label: 'Audio',        icon: 'musical-note',  typeKey: 'audio', pick: 'document' },
];

// ── Set-password modal (cross-platform, no Alert.prompt) ─────────────────────
function SetPasswordModal({ visible, onConfirm, onCancel, C }) {
  const [pw, setPw]         = useState('');
  const [confirm, setConfirm] = useState('');
  const [err, setErr]       = useState('');

  const reset = () => { setPw(''); setConfirm(''); setErr(''); };

  const handleConfirm = () => {
    if (pw.length < 4)        { setErr('Password must be at least 4 characters.'); return; }
    if (pw !== confirm)        { setErr('Passwords do not match.'); return; }
    reset();
    onConfirm(pw);
  };

  const handleCancel = () => { reset(); onCancel(); };

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.55)' }}
      >
        <View style={{ width: '88%', backgroundColor: C.surface, borderRadius: 18, padding: 24, borderWidth: 1, borderColor: C.border }}>
          <Text style={{ color: C.text, fontSize: 18, fontWeight: '700', marginBottom: 6 }}>Set Encryption Password</Text>
          <Text style={{ color: C.textSecondary, fontSize: 13, marginBottom: 20, lineHeight: 19 }}>
            This password will be required every time you open this document. It is stored securely on this device only.
          </Text>

          <Text style={{ color: C.textSecondary, fontSize: 12, fontWeight: '600', marginBottom: 6 }}>PASSWORD</Text>
          <TextInput
            style={{ backgroundColor: C.surfaceElevated, borderRadius: 10, padding: 13, fontSize: 15, color: C.text, borderWidth: 1, borderColor: C.border, marginBottom: 12 }}
            placeholder="Min. 4 characters"
            placeholderTextColor={C.textMuted}
            secureTextEntry
            value={pw}
            onChangeText={v => { setPw(v); setErr(''); }}
          />

          <Text style={{ color: C.textSecondary, fontSize: 12, fontWeight: '600', marginBottom: 6 }}>CONFIRM PASSWORD</Text>
          <TextInput
            style={{ backgroundColor: C.surfaceElevated, borderRadius: 10, padding: 13, fontSize: 15, color: C.text, borderWidth: 1, borderColor: C.border, marginBottom: err ? 8 : 20 }}
            placeholder="Re-enter password"
            placeholderTextColor={C.textMuted}
            secureTextEntry
            value={confirm}
            onChangeText={v => { setConfirm(v); setErr(''); }}
          />

          {!!err && (
            <Text style={{ color: C.error, fontSize: 13, marginBottom: 14 }}>{err}</Text>
          )}

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity
              style={{ flex: 1, padding: 14, borderRadius: 10, borderWidth: 1, borderColor: C.border, alignItems: 'center' }}
              onPress={handleCancel}
            >
              <Text style={{ color: C.textSecondary, fontWeight: '600' }}>Skip</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ flex: 1, padding: 14, borderRadius: 10, backgroundColor: C.primary, alignItems: 'center' }}
              onPress={handleConfirm}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Set Password</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export default function UploadScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { C } = useTheme();
  const addDocument = useDocumentStore(s => s.addDocument);

  const [selectedFile, setSelectedFile] = useState(null);
  const [docName,       setDocName]      = useState('');
  const [docCategory,   setDocCategory]  = useState('pdf');
  const [tagInput,      setTagInput]     = useState('');
  const [tags,          setTags]         = useState([]);
  const [description,   setDescription]  = useState('');
  const [encrypted,     setEncrypted]    = useState(false);
  const [uploading,     setUploading]    = useState(false);
  const [uploadProgress]                 = useState(new Animated.Value(0));
  const [pwModal,       setPwModal]      = useState({ visible: false, docId: null });

  const styles = useMemo(() => createStyles(C), [C]);

  // ── File picking ──────────────────────────────────────────────────────────
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];
        setSelectedFile({ uri: asset.uri, name: asset.name, size: asset.size || 0 });
        if (!docName) setDocName(asset.name.replace(/\.[^.]+$/, ''));
      }
    } catch { Alert.alert('Error', 'Could not open file picker.'); }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') { Alert.alert('Permission needed', 'Allow photo library access to pick images.'); return; }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        quality: 0.85,
        allowsEditing: false,
      });
      if (!result.canceled && result.assets?.[0]) {
        const asset    = result.assets[0];
        const isVideo  = asset.type === 'video';
        const fileName = asset.fileName || (isVideo ? `video_${Date.now()}.mp4` : `photo_${Date.now()}.jpg`);
        setSelectedFile({ uri: asset.uri, name: fileName, size: asset.fileSize || 0 });
        setDocCategory(isVideo ? 'video' : 'image');
        if (!docName) setDocName(isVideo ? `Video ${new Date().toLocaleDateString()}` : `Photo ${new Date().toLocaleDateString()}`);
      }
    } catch { Alert.alert('Error', 'Could not open media picker.'); }
  };

  // ── Tags ──────────────────────────────────────────────────────────────────
  const addTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g, '-');
    if (t && !tags.includes(t) && tags.length < 8) { setTags(p => [...p, t]); setTagInput(''); }
  };
  const removeTag = (tag) => setTags(p => p.filter(t => t !== tag));

  // ── Upload ────────────────────────────────────────────────────────────────
  const handleUpload = async () => {
    if (!selectedFile)     { Alert.alert('No file selected', 'Please choose a file to upload.'); return; }
    if (!docName.trim())   { Alert.alert('Name required', 'Please enter a document name.');        return; }

    setUploading(true);
    uploadProgress.setValue(0);
    Animated.timing(uploadProgress, { toValue: 1, duration: 1200, useNativeDriver: false }).start();

    try {
      // 1. Copy to app vault (permanent local storage)
      const { localUri, size } = await copyFileToVault(selectedFile.uri, selectedFile.name);

      // 2. Persist metadata
      const newDoc = addDocument({
        name:      docName.trim(),
        type:      docCategory,
        fileType:  docCategory,
        size:      size || selectedFile.size || 0,
        localUri,
        tags:      tags.length ? tags : [docCategory],
        description: description.trim(),
        encrypted,
        category:  DOC_CATEGORIES.find(c => c.key === docCategory)?.label || 'Other',
        pages:     1,
      });

      setUploading(false);

      // 3. If user requested encryption, prompt for password before finishing
      if (encrypted) {
        setPwModal({ visible: true, docId: newDoc.id });
      } else {
        showSuccess(docName.trim());
      }
    } catch (e) {
      setUploading(false);
      Alert.alert('Upload failed', 'Could not save the file. Please try again.\n\n' + (e?.message || ''));
    }
  };

  const handlePasswordSet = async (password) => {
    setPwModal({ visible: false, docId: null });
    if (pwModal.docId && password) {
      await storeDocPassword(pwModal.docId, password);
    }
    showSuccess(docName.trim());
  };

  const handlePasswordSkip = () => {
    // User skipped — mark document as NOT encrypted since no password was set
    if (pwModal.docId) {
      const updateDocument = useDocumentStore.getState().updateDocument;
      updateDocument(pwModal.docId, { encrypted: false });
    }
    setPwModal({ visible: false, docId: null });
    showSuccess(docName.trim());
  };

  const showSuccess = (name) => {
    Alert.alert('Saved to vault', `"${name}" is now stored securely on this device.`, [
      { text: 'View documents', onPress: () => router.replace('/(app)/documents') },
      { text: 'Upload another',  onPress: resetForm },
    ]);
  };

  const resetForm = () => {
    setSelectedFile(null); setDocName(''); setTags([]); setDescription('');
    setDocCategory('pdf');  setEncrypted(false); uploadProgress.setValue(0);
  };

  const barWidth = uploadProgress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Upload Document</Text>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <Ionicons name="close" size={20} color={C.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* ── File picker ── */}
        <View style={styles.pickerSection}>
          {selectedFile ? (
            <View style={styles.selectedFile}>
              <View style={styles.selectedFileIcon}>
                <Ionicons name="document-attach" size={26} color={C.primary} />
              </View>
              <View style={styles.selectedFileInfo}>
                <Text style={styles.selectedFileName} numberOfLines={1}>{selectedFile.name}</Text>
                <Text style={styles.selectedFileSize}>
                  {selectedFile.size > 0 ? `${(selectedFile.size / 1024).toFixed(0)} KB` : 'Size unknown'}
                </Text>
              </View>
              <TouchableOpacity onPress={resetForm} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close-circle" size={22} color={C.error} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.dropZone} onPress={pickDocument} activeOpacity={0.8}>
              <Ionicons name="cloud-upload-outline" size={40} color={C.primary} />
              <Text style={styles.dropTitle}>Tap to select a file</Text>
              <Text style={styles.dropSubtitle}>PDF, image, video, audio supported</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── Quick source buttons ── */}
        {!selectedFile && (
          <View style={styles.sourceButtons}>
            {FILE_SOURCES.map(s => {
              const typeConfig = DOC_TYPE_CONFIG[s.typeKey];
              const color = typeConfig ? typeConfig.getColor(C) : C.primary;
              return (
                <TouchableOpacity
                  key={s.key}
                  style={[styles.sourceBtn, { borderColor: color + '55' }]}
                  onPress={s.pick === 'image' ? pickImage : pickDocument}
                >
                  <View style={[styles.sourceIcon, { backgroundColor: color + '22' }]}>
                    <Ionicons name={s.icon} size={22} color={color} />
                  </View>
                  <Text style={styles.sourceLabel}>{s.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <View style={styles.form}>
          {/* Document name */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Document Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Aadhaar Card 2024"
              placeholderTextColor={C.textMuted}
              value={docName}
              onChangeText={setDocName}
            />
          </View>

          {/* Category */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {DOC_CATEGORIES.map(c => (
                <TouchableOpacity
                  key={c.key}
                  style={[styles.categoryChip, docCategory === c.key && styles.categoryChipActive]}
                  onPress={() => setDocCategory(c.key)}
                >
                  <Text style={[styles.categoryText, docCategory === c.key && styles.categoryTextActive]}>
                    {c.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Tags */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Tags</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Type a tag and press +"
                placeholderTextColor={C.textMuted}
                value={tagInput}
                onChangeText={setTagInput}
                onSubmitEditing={addTag}
                returnKeyType="done"
              />
              <TouchableOpacity style={styles.tagAddBtn} onPress={addTag}>
                <Ionicons name="add" size={22} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, marginTop: 8 }}>
              {COMMON_TAGS.map(t => (
                <TouchableOpacity
                  key={t}
                  style={[styles.suggTag, tags.includes(t) && styles.suggTagActive]}
                  onPress={() => tags.includes(t) ? removeTag(t) : setTags(p => [...p, t])}
                >
                  <Text style={[styles.suggTagText, tags.includes(t) && styles.suggTagTextActive]}>#{t}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {tags.length > 0 && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                {tags.map(t => (
                  <TouchableOpacity key={t} style={styles.tagChip} onPress={() => removeTag(t)}>
                    <Text style={styles.tagChipText}>#{t}</Text>
                    <Ionicons name="close" size={11} color={C.primary} />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Description */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Description (optional)</Text>
            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
              placeholder="Brief description of this document"
              placeholderTextColor={C.textMuted}
              value={description}
              onChangeText={setDescription}
              multiline
            />
          </View>

          {/* Toggles */}
          <View style={{ gap: 8, marginBottom: 8 }}>
            <ToggleRow
              icon="lock-closed-outline"
              label="Password protect this file"
              sub="You will set a password after saving"
              value={encrypted}
              onToggle={() => setEncrypted(p => !p)}
              C={C}
            />
          </View>
        </View>

        {/* Progress */}
        {uploading && (
          <View style={styles.progressSection}>
            <View style={styles.progressTrack}>
              <Animated.View style={[styles.progressFill, { width: barWidth }]} />
            </View>
            <Text style={styles.progressText}>Copying to secure vault…</Text>
          </View>
        )}

        {/* Submit */}
        <TouchableOpacity
          style={[styles.uploadBtn, uploading && { opacity: 0.65 }]}
          onPress={handleUpload}
          disabled={uploading}
          activeOpacity={0.85}
        >
          {uploading
            ? <ActivityIndicator color="#FFFFFF" />
            : <>
                <Ionicons name="shield-checkmark" size={20} color="#FFFFFF" />
                <Text style={styles.uploadBtnText}>Save to Vault</Text>
              </>
          }
        </TouchableOpacity>
      </ScrollView>

      {/* Password modal — shown after a successful save when encrypted=true */}
      <SetPasswordModal
        visible={pwModal.visible}
        onConfirm={handlePasswordSet}
        onCancel={handlePasswordSkip}
        C={C}
      />
    </View>
  );
}

// ── ToggleRow sub-component ───────────────────────────────────────────────────
function ToggleRow({ icon, label, sub, value, onToggle, C }) {
  return (
    <TouchableOpacity
      style={{
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        backgroundColor: C.surface, borderRadius: 12, padding: 14,
        borderWidth: 1, borderColor: value ? hexToRgba(C.primary, 0.4) : C.border,
      }}
      onPress={onToggle}
      activeOpacity={0.8}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
        <Ionicons name={icon} size={18} color={value ? C.primary : C.textMuted} />
        <View style={{ marginLeft: 12, flex: 1 }}>
          <Text style={{ color: C.text, fontSize: 14, fontWeight: '600' }}>{label}</Text>
          <Text style={{ color: C.textMuted, fontSize: 12, marginTop: 1 }}>{sub}</Text>
        </View>
      </View>
      <View style={{
        width: 44, height: 24, borderRadius: 12,
        backgroundColor: value ? C.primary : C.border,
        justifyContent: 'center', paddingHorizontal: 2, marginLeft: 12,
      }}>
        <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: '#FFFFFF', marginLeft: value ? 20 : 0 }} />
      </View>
    </TouchableOpacity>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
function createStyles(C) {
  return StyleSheet.create({
    root:       { flex: 1, backgroundColor: C.backgroundSecondary },
    header:     {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      paddingHorizontal: 20, paddingVertical: 16,
      backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border,
    },
    headerTitle: { color: C.text, fontSize: 22, fontWeight: '700' },
    closeBtn:   {
      width: 36, height: 36, borderRadius: 10, backgroundColor: C.surfaceElevated,
      alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border,
    },
    pickerSection:  { paddingHorizontal: 20, marginTop: 16, marginBottom: 12 },
    dropZone:   {
      height: 150, borderRadius: 14, borderWidth: 2,
      borderColor: C.border, borderStyle: 'dashed',
      alignItems: 'center', justifyContent: 'center', gap: 8,
      backgroundColor: C.primaryMuted,
    },
    dropTitle:    { color: C.text, fontSize: 16, fontWeight: '600' },
    dropSubtitle: { color: C.textMuted, fontSize: 13 },
    selectedFile: {
      flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface,
      borderRadius: 12, padding: 14, borderWidth: 1, borderColor: C.border,
    },
    selectedFileIcon: {
      width: 46, height: 46, borderRadius: 12, backgroundColor: C.primaryMuted,
      alignItems: 'center', justifyContent: 'center', marginRight: 12,
    },
    selectedFileInfo: { flex: 1 },
    selectedFileName: { color: C.text,     fontSize: 14, fontWeight: '600' },
    selectedFileSize: { color: C.textMuted, fontSize: 12, marginTop: 2 },
    sourceButtons:    { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 20 },
    sourceBtn:    {
      flex: 1, alignItems: 'center', padding: 14,
      borderRadius: 12, backgroundColor: C.surface, borderWidth: 1,
    },
    sourceIcon:   { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
    sourceLabel:  { color: C.textSecondary, fontSize: 12, fontWeight: '500' },
    form:         { paddingHorizontal: 20 },
    formGroup:    { marginBottom: 20 },
    label:        { color: C.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 8 },
    input:        {
      backgroundColor: C.surface, borderRadius: 11, padding: 14,
      fontSize: 15, borderWidth: 1, borderColor: C.border, color: C.text,
    },
    categoryChip:     { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border },
    categoryChipActive: { backgroundColor: C.primary, borderColor: C.primary },
    categoryText:     { color: C.textMuted,  fontSize: 13, fontWeight: '500' },
    categoryTextActive: { color: '#FFFFFF' },
    tagAddBtn:    { width: 48, height: 48, borderRadius: 11, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' },
    suggTag:      { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border },
    suggTagActive:     { backgroundColor: C.primaryMuted, borderColor: C.primary },
    suggTagText:       { color: C.textMuted, fontSize: 12 },
    suggTagTextActive: { color: C.primary },
    tagChip:      { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: C.primaryMuted, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
    tagChipText:  { color: C.primary, fontSize: 12 },
    progressSection:  { paddingHorizontal: 20, marginBottom: 16 },
    progressTrack:    { height: 4, backgroundColor: C.border, borderRadius: 2, overflow: 'hidden' },
    progressFill:     { height: 4, backgroundColor: C.primary, borderRadius: 2 },
    progressText:     { color: C.textMuted, fontSize: 12, marginTop: 6, textAlign: 'center' },
    uploadBtn:    {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      marginHorizontal: 20, marginTop: 16, paddingVertical: 16,
      borderRadius: 13, backgroundColor: C.primary, gap: 10,
    },
    uploadBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  });
}
