/**
 * Secure per-document password storage.
 *
 * Passwords are stored in the device's Keychain (iOS) / Keystore (Android)
 * via expo-secure-store — the OS handles at-rest encryption.
 *
 * Convention: key = 'dlpwd_<docId>'  (max 2048 byte keys in SecureStore)
 */
import * as SecureStore from 'expo-secure-store';

const pwdKey = (docId) => 'dlpwd_' + String(docId).replace(/[^a-zA-Z0-9]/g, '');

// Store a password for a document (overwrites if already set).
export async function storeDocPassword(docId, password) {
  await SecureStore.setItemAsync(pwdKey(docId), password);
}

// Returns true if the supplied password matches the stored one.
export async function verifyDocPassword(docId, inputPassword) {
  const stored = await SecureStore.getItemAsync(pwdKey(docId));
  return stored !== null && stored === inputPassword;
}

// Permanently remove the stored password (call when deleting a doc or disabling encryption).
export async function clearDocPassword(docId) {
  try {
    await SecureStore.deleteItemAsync(pwdKey(docId));
  } catch {}
}

// Returns true if a password has ever been set for this document.
export async function isPasswordSet(docId) {
  const val = await SecureStore.getItemAsync(pwdKey(docId));
  return val !== null;
}
