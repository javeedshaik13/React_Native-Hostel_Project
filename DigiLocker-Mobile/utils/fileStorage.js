import { File, Directory, Paths } from 'expo-file-system';
import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Share } from 'react-native';

const META_KEY   = 'digilocker:meta';
const RECENT_KEY = 'digilocker:recent';

// ── Directory bootstrap ──────────────────────────────────────────────────────
export function initVault() {
  const dir = new Directory(Paths.document, 'vault');
  if (!dir.exists) dir.create();
}

// ── Copy a picked file into the app vault ────────────────────────────────────
// Returns { localUri: string, size: number }
export async function copyFileToVault(sourceUri, originalName) {
  initVault();
  const safe = originalName.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 60);
  const dest = new File(Paths.document, 'vault', `${Date.now()}_${safe}`);
  const src  = new File(sourceUri);
  src.copy(dest);
  return { localUri: dest.uri, size: dest.size || 0 };
}

// ── Delete a file from the vault (idempotent) ────────────────────────────────
export function deleteVaultFile(localUri) {
  if (!localUri) return;
  try {
    const file = new File(localUri);
    if (file.exists) file.delete();
  } catch {}
}

// ── Open a local file with the platform's default viewer ────────────────────
// Returns true on success, false if file not found.
export async function openFileWithSystem(localUri) {
  if (!localUri) return false;
  const file = new File(localUri);
  if (!file.exists) return false;
  if (Platform.OS === 'android') {
    await Linking.openURL(file.contentUri);
  } else {
    await Linking.openURL(localUri);
  }
  return true;
}

// ── Share file via system share sheet ────────────────────────────────────────
export async function shareDocumentFile(localUri, docName) {
  const file = new File(localUri);
  if (!file.exists) throw new Error('File not found on device');
  if (Platform.OS === 'ios') {
    await Share.share({ url: localUri, title: docName });
  } else {
    await Linking.openURL(file.contentUri);
  }
}

// ── Export: copy to cache dir then hand off to the OS ────────────────────────
export async function exportDocumentFile(localUri, docName) {
  const src = new File(localUri);
  if (!src.exists) throw new Error('File not found on device');
  const safe = docName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const dest = new File(Paths.cache, `${safe}${src.extension}`);
  src.copy(dest);
  if (Platform.OS === 'android') {
    await Linking.openURL(dest.contentUri);
  } else {
    await Share.share({ url: dest.uri, title: docName });
  }
}

// ── AsyncStorage metadata persistence ────────────────────────────────────────
export async function loadDocumentMeta() {
  const [metaRaw, recentRaw] = await Promise.all([
    AsyncStorage.getItem(META_KEY),
    AsyncStorage.getItem(RECENT_KEY),
  ]);
  return {
    documents:    metaRaw   ? JSON.parse(metaRaw)   : [],
    recentDocIds: recentRaw ? JSON.parse(recentRaw) : [],
  };
}

export async function saveDocumentMeta(documents, recentDocIds) {
  await Promise.all([
    AsyncStorage.setItem(META_KEY, JSON.stringify(documents)),
    AsyncStorage.setItem(RECENT_KEY, JSON.stringify(recentDocIds)),
  ]);
}
