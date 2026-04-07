import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Alert, Platform, Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as LocalAuthentication from 'expo-local-authentication';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../hooks/useToast';
import { useSidebarStore } from '../../store/sidebarStore';
import ConfirmationModal from '../../components/ui/ConfirmationModal';
import { hexToRgba } from '../../utils/colorUtils';

function SectionHeader({ title, C }) {
  return (
    <Text style={{
      color: C.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 0.8,
      textTransform: 'uppercase', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8,
    }}>
      {title}
    </Text>
  );
}

function SettingRow({ icon, iconColor, label, sub, right, onPress, danger, C }) {
  const ic = iconColor || C.primary;
  return (
    <TouchableOpacity style={styles.settingRow} onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
      <View style={[styles.settingIcon, { backgroundColor: ic + '22' }]}>
        <Ionicons name={icon} size={18} color={ic} />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingLabel, { color: danger ? C.error : C.text }]}>{label}</Text>
        {sub && <Text style={[styles.settingSub, { color: C.textMuted }]}>{sub}</Text>}
      </View>
      <View style={styles.settingRight}>{right}</View>
    </TouchableOpacity>
  );
}

function ToggleSwitch({ value, onChange, C }) {
  return (
    <Switch
      value={value}
      onValueChange={onChange}
      trackColor={{ false: C.border, true: C.primary }}
      thumbColor={Platform.OS === 'android' ? (value ? '#FFFFFF' : C.textMuted) : undefined}
      ios_backgroundColor={C.border}
    />
  );
}

function PinModal({ visible, onConfirm, onClose, C }) {
  const [pin, setPin] = useState(['', '', '', '']);
  const [step, setStep] = useState('set');
  const [firstPin, setFirstPin] = useState(null);

  if (!visible) return null;

  const handleDigit = (digit) => {
    const newPin = [...pin];
    const idx = newPin.findIndex(p => p === '');
    if (idx === -1) return;
    newPin[idx] = String(digit);
    setPin(newPin);
    if (idx === 3) {
      const pinStr = newPin.join('');
      if (step === 'set') {
        setFirstPin(pinStr);
        setStep('confirm');
        setPin(['', '', '', '']);
      } else {
        if (pinStr === firstPin) {
          onConfirm(pinStr);
        } else {
          Alert.alert('Mismatch', 'PINs do not match. Try again.');
          setStep('set');
          setPin(['', '', '', '']);
          setFirstPin(null);
        }
      }
    }
  };

  const handleDelete = () => {
    const newPin = [...pin];
    const idx = newPin.map((p, i) => p !== '' ? i : -1).filter(i => i !== -1).pop();
    if (idx !== undefined) { newPin[idx] = ''; setPin(newPin); }
  };

  return (
    <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.75)', alignItems: 'center', justifyContent: 'flex-end', zIndex: 200 }}>
      <View style={{
        width: '100%', backgroundColor: C.surfaceElevated,
        borderTopLeftRadius: 28, borderTopRightRadius: 28,
        padding: 28, paddingBottom: 40, alignItems: 'center',
      }}>
        <Text style={{ color: C.text, fontSize: 20, fontWeight: '700', marginBottom: 6 }}>
          {step === 'set' ? 'Set PIN' : 'Confirm PIN'}
        </Text>
        <Text style={{ color: C.textSecondary, fontSize: 14, marginBottom: 24 }}>
          {step === 'set' ? 'Enter a 4-digit PIN' : 'Re-enter your PIN'}
        </Text>
        <View style={{ flexDirection: 'row', gap: 16, marginBottom: 32 }}>
          {pin.map((p, i) => (
            <View key={i} style={{
              width: 14, height: 14, borderRadius: 7,
              borderWidth: 2,
              borderColor: p !== '' ? C.primary : C.border,
              backgroundColor: p !== '' ? C.primary : 'transparent',
            }} />
          ))}
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12, width: '90%' }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, 'del'].map((k, i) => (
            <TouchableOpacity
              key={i}
              style={{
                width: 72, height: 72, borderRadius: 36,
                backgroundColor: k === '' ? 'transparent' : C.surface,
                alignItems: 'center', justifyContent: 'center',
                borderWidth: k === '' ? 0 : 1, borderColor: C.border,
              }}
              onPress={() => k === 'del' ? handleDelete() : k !== '' && handleDigit(k)}
            >
              {k === 'del'
                ? <Ionicons name="backspace-outline" size={22} color={C.text} />
                : k !== '' && <Text style={{ color: C.text, fontSize: 24, fontWeight: '600' }}>{k}</Text>
              }
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={{ marginTop: 20 }} onPress={onClose}>
          <Text style={{ color: C.textMuted, fontSize: 15 }}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { C, mode, setMode } = useTheme();
  const security = useAuthStore(s => s.security);
  const updateSecurity = useAuthStore(s => s.updateSecurity);
  const logout = useAuthStore(s => s.logout);
  const setupPin = useAuthStore(s => s.setupPin);
  const [showPinModal, setShowPinModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const toast = useToast();
  const showSidebar = useSidebarStore(s => s.show);

  const styles = useMemo(() => createStyles(C), [C]);

  const handleBiometricToggle = async (val) => {
    if (val) {
      const supported = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!supported || !enrolled) {
        Alert.alert('Not available', 'Biometric authentication is not set up on your device.');
        return;
      }
      const result = await LocalAuthentication.authenticateAsync({ promptMessage: 'Verify identity to enable biometric lock' });
      if (result.success) updateSecurity({ biometricEnabled: true });
    } else {
      updateSecurity({ biometricEnabled: false });
    }
  };

  const handlePinToggle = (val) => {
    if (val) setShowPinModal(true);
    else {
      Alert.alert('Disable PIN', 'Are you sure you want to disable PIN protection?', [
        { text: 'Cancel' },
        { text: 'Disable', style: 'destructive', onPress: () => {
          updateSecurity({ pinEnabled: false });
          toast.success('PIN protection disabled');
        }},
      ]);
    }
  };

  const AUTO_LOCK_OPTIONS = [1, 5, 15, 30, 60];

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={showSidebar} hitSlop={8}>
          <Ionicons name="menu" size={24} color={C.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Appearance */}
        <SectionHeader title="Appearance" C={C} />
        <View style={styles.card}>
          <View style={styles.themeSelectorContainer}>
            <Text style={styles.themeSelectorLabel}>App Theme</Text>
            <View style={styles.themeChips}>
              {[
                { value: 'light',  icon: 'sunny-outline',          label: 'Light'  },
                { value: 'system', icon: 'phone-portrait-outline',  label: 'System' },
                { value: 'dark',   icon: 'moon',                   label: 'Dark'   },
              ].map(opt => (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.themeChip, mode === opt.value && styles.themeChipActive]}
                  onPress={() => setMode(opt.value)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={opt.icon}
                    size={15}
                    color={mode === opt.value ? '#FFFFFF' : C.textMuted}
                  />
                  <Text style={[styles.themeChipText, mode === opt.value && styles.themeChipTextActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Security */}
        <SectionHeader title="Security & Privacy" C={C} />
        <View style={styles.card}>
          <SettingRow
            icon="finger-print"
            iconColor={C.secondary}
            label="Biometric Lock"
            sub="Fingerprint or Face ID"
            right={<ToggleSwitch value={security.biometricEnabled} onChange={handleBiometricToggle} C={C} />}
            C={C}
          />
          <View style={styles.rowDivider} />
          <SettingRow
            icon="keypad-outline"
            label="PIN Protection"
            sub={security.pinEnabled ? 'Enabled · 4-digit PIN' : 'Disabled'}
            right={<ToggleSwitch value={security.pinEnabled} onChange={handlePinToggle} C={C} />}
            C={C}
          />
          <View style={styles.rowDivider} />
          <SettingRow
            icon="eye-off-outline"
            iconColor={C.error}
            label="Stealth Mode"
            sub="Hide app from recent apps"
            right={<ToggleSwitch value={security.stealthMode} onChange={v => updateSecurity({ stealthMode: v })} C={C} />}
            C={C}
          />
          <View style={styles.rowDivider} />
          <SettingRow
            icon="lock-closed-outline"
            iconColor={C.warning}
            label="Encrypt New Files"
            sub="AES-256 by default"
            right={<ToggleSwitch value={security.encryptNewByDefault} onChange={v => updateSecurity({ encryptNewByDefault: v })} C={C} />}
            C={C}
          />
        </View>

        {/* Auto-lock */}
        <SectionHeader title="Auto-lock Timer" C={C} />
        <View style={styles.card}>
          <View style={styles.autoLockRow}>
            {AUTO_LOCK_OPTIONS.map(min => (
              <TouchableOpacity
                key={min}
                style={[styles.autoLockChip, security.autoLockMinutes === min && styles.autoLockChipActive]}
                onPress={() => updateSecurity({ autoLockMinutes: min })}
              >
                <Text style={[styles.autoLockText, security.autoLockMinutes === min && styles.autoLockTextActive]}>
                  {min < 60 ? `${min}m` : '1h'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.autoLockNote}>
            App locks after {security.autoLockMinutes} minute{security.autoLockMinutes !== 1 ? 's' : ''} of inactivity
          </Text>
        </View>

        {/* Storage */}
        <SectionHeader title="Storage & Sync" C={C} />
        <View style={styles.card}>
          <SettingRow icon="cloud-outline" iconColor={C.success} label="Cloud Sync" sub="Auto-sync when online" right={<ToggleSwitch value={true} onChange={() => {}} C={C} />} C={C} />
          <View style={styles.rowDivider} />
          <SettingRow icon="wifi-outline" iconColor={C.secondary} label="Sync on Wi-Fi only" sub="Save mobile data" right={<ToggleSwitch value={true} onChange={() => {}} C={C} />} C={C} />
          <View style={styles.rowDivider} />
          <SettingRow icon="archive-outline" label="Auto Compress" sub="Reduce storage without quality loss" right={<ToggleSwitch value={true} onChange={() => {}} C={C} />} C={C} />
          <View style={styles.rowDivider} />
          <SettingRow icon="copy-outline" iconColor={C.warning} label="Duplicate Detection" sub="Warn before uploading duplicates" right={<ToggleSwitch value={true} onChange={() => {}} C={C} />} C={C} />
        </View>

        {/* Notifications */}
        <SectionHeader title="Notifications" C={C} />
        <View style={styles.card}>
          <SettingRow icon="notifications-outline" label="Document Reminders" sub="Remind to upload or renew docs" right={<ToggleSwitch value={true} onChange={() => {}} C={C} />} C={C} />
          <View style={styles.rowDivider} />
          <SettingRow icon="calendar-outline" iconColor={C.secondary} label="Expiry Alerts" sub="License, passport renewals" right={<ToggleSwitch value={true} onChange={() => {}} C={C} />} C={C} />
        </View>

        {/* Sharing */}
        <SectionHeader title="Sharing" C={C} />
        <View style={styles.card}>
          <SettingRow icon="qr-code-outline" iconColor={C.success} label="QR Share" sub="Share docs via QR code" onPress={() => Alert.alert('QR Share', 'Generate a secure QR code for quick sharing.')} right={<Ionicons name="chevron-forward" size={16} color={C.textMuted} />} C={C} />
          <View style={styles.rowDivider} />
          <SettingRow icon="link-outline" iconColor={C.secondary} label="Expiring Links" sub="Create time-limited share links" onPress={() => Alert.alert('Expiring Links', 'Share with links that expire after 24h, 7d, or custom.')} right={<Ionicons name="chevron-forward" size={16} color={C.textMuted} />} C={C} />
        </View>

        {/* About */}
        <SectionHeader title="About" C={C} />
        <View style={styles.card}>
          <SettingRow icon="information-circle-outline" label="Version" sub="DigiLocker v1.0.0" right={null} C={C} />
          <View style={styles.rowDivider} />
          <SettingRow icon="shield-checkmark-outline" iconColor={C.success} label="Privacy Policy" onPress={() => {}} right={<Ionicons name="chevron-forward" size={16} color={C.textMuted} />} C={C} />
          <View style={styles.rowDivider} />
          <SettingRow icon="document-text-outline" label="Terms of Service" onPress={() => {}} right={<Ionicons name="chevron-forward" size={16} color={C.textMuted} />} C={C} />
        </View>

        {/* Logout */}
        <View style={styles.logoutSection}>
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={() => setShowLogoutModal(true)}
          >
            <Ionicons name="log-out-outline" size={18} color={C.error} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <PinModal
        visible={showPinModal}
        onConfirm={(pin) => { 
          setupPin(pin); 
          setShowPinModal(false); 
          toast.success('PIN protection enabled');
        }}
        onClose={() => setShowPinModal(false)}
        C={C}
      />

      <ConfirmationModal
        visible={showLogoutModal}
        title="Confirm Logout"
        message="Are you sure you want to logout?"
        icon="log-out-outline"
        iconColor={C.error}
        confirmText="Logout"
        cancelText="Cancel"
        onConfirm={() => {
          setShowLogoutModal(false);
          logout();
        }}
        onCancel={() => setShowLogoutModal(false)}
        danger
      />
    </View>
  );
}

const styles = StyleSheet.create({
  settingRow: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  settingIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  settingContent: { flex: 1 },
  settingLabel: { fontSize: 14, fontWeight: '600' },
  settingSub: { fontSize: 12, marginTop: 2 },
  settingRight: { marginLeft: 10 },
});

function createStyles(C) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: C.backgroundSecondary },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20, paddingVertical: 16,
      backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border,
    },
    headerTitle: { color: C.text, fontSize: 22, fontWeight: '700', flex: 1, textAlign: 'center' },
    card: {
      backgroundColor: C.surface, marginHorizontal: 20,
      borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: C.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.10,
      shadowRadius: 10,
      elevation: 4,
    },
    rowDivider: { height: 1, backgroundColor: C.border, marginLeft: 62 },
    autoLockRow: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 14, paddingTop: 14 },
    autoLockChip: {
      width: 52, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center',
      backgroundColor: C.surfaceElevated, borderWidth: 1, borderColor: C.border,
    },
    autoLockChipActive: { backgroundColor: C.primary, borderColor: C.primary },
    autoLockText: { color: C.textSecondary, fontSize: 13, fontWeight: '600' },
    autoLockTextActive: { color: '#FFFFFF' },
    autoLockNote: { color: C.textMuted, fontSize: 12, textAlign: 'center', paddingVertical: 12 },
    themeSelectorContainer: { padding: 14 },
    themeSelectorLabel: { color: C.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 10 },
    themeChips: { flexDirection: 'row' },
    themeChip: {
      flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      paddingVertical: 10, borderRadius: 10,
      backgroundColor: C.surfaceElevated, borderWidth: 1, borderColor: C.border,
    },
    themeChipActive: { backgroundColor: C.primary, borderColor: C.primary },
    themeChipText: { color: C.textMuted, fontSize: 13, fontWeight: '600' },
    themeChipTextActive: { color: '#FFFFFF' },
    logoutSection: { paddingHorizontal: 20, marginTop: 24, marginBottom: 8 },
    logoutBtn: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      padding: 16, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(217, 48, 37, 0.33)',
    },
    logoutText: { color: C.error, fontSize: 15, fontWeight: '600' },
  });
}
