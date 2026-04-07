import React, { useState, useMemo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, Alert, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../contexts/ThemeContext';

export default function RegisterScreen() {
  const router = useRouter();
  const { C } = useTheme();
  const register = useAuthStore(s => s.register);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const styles = useMemo(() => createStyles(C), [C]);

  const handleRegister = () => {
    const n = name.trim();
    const e = email.trim();
    if (!n || !e || !password) {
      Alert.alert('Missing fields', 'Please fill in all required fields.');
      return;
    }
    if (!e.includes('@')) {
      Alert.alert('Invalid email', 'Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak password', 'Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPw) {
      Alert.alert('Password mismatch', 'Passwords do not match.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      register(n, e);
      setLoading(false);
      router.replace('/(app)');
    }, 600);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.root}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Brand */}
        <View style={styles.brand}>
          <View style={styles.logoBox}>
            <Ionicons name="shield-checkmark-outline" size={26} color={C.primary} />
          </View>
          <Text style={styles.appName}>DigiLocker</Text>
          <Text style={styles.appTagline}>Create your secure vault</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.heading}>Create account</Text>

          <LabeledInput
            label="Full name"
            icon="person-outline"
            placeholder="Your full name"
            value={name}
            onChange={setName}
            C={C}
          />
          <LabeledInput
            label="Email address"
            icon="mail-outline"
            placeholder="you@example.com"
            value={email}
            onChange={setEmail}
            keyboardType="email-address"
            C={C}
          />
          <LabeledInput
            label="Password"
            icon="key-outline"
            placeholder="Min. 6 characters"
            value={password}
            onChange={setPassword}
            secure={!showPw}
            rightEl={
              <TouchableOpacity onPress={() => setShowPw(p => !p)} style={{ padding: 4 }}>
                <Ionicons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={17} color={C.textMuted} />
              </TouchableOpacity>
            }
            C={C}
          />
          <LabeledInput
            label="Confirm password"
            icon="lock-closed-outline"
            placeholder="Re-enter password"
            value={confirmPw}
            onChange={setConfirmPw}
            secure
            C={C}
          />

          {/* Feature bullets */}
          <View style={styles.bullets}>
            {[
              'End-to-end encryption',
              'Biometric authentication',
              'Smart document search',
              'Offline access',
            ].map(f => (
              <View key={f} style={styles.bulletRow}>
                <Ionicons name="checkmark-circle" size={14} color={C.secondary} />
                <Text style={styles.bulletText}>{f}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.primaryBtn, loading && styles.btnDisabled]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryBtnText}>
              {loading ? 'Creating account…' : 'Create Account'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.footerLink}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function LabeledInput({ label, icon, placeholder, value, onChange, secure, keyboardType, rightEl, C }) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={{ fontSize: 13, fontWeight: '500', color: C.textSecondary, marginBottom: 6 }}>
        {label}
      </Text>
      <View style={{
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: C.surfaceElevated,
        borderRadius: 8, borderWidth: 1, borderColor: C.border,
        paddingHorizontal: 12,
      }}>
        <Ionicons name={icon} size={17} color={C.textMuted} style={{ marginRight: 8 }} />
        <TextInput
          style={{ flex: 1, color: C.text, fontSize: 15, paddingVertical: 13 }}
          placeholder={placeholder}
          placeholderTextColor={C.textMuted}
          value={value}
          onChangeText={onChange}
          secureTextEntry={secure}
          keyboardType={keyboardType}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {rightEl}
      </View>
    </View>
  );
}

function createStyles(C) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: C.backgroundSecondary },
    scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 48 },
    brand: { alignItems: 'center', marginBottom: 28 },
    logoBox: {
      width: 56, height: 56, borderRadius: 14,
      backgroundColor: C.primaryMuted,
      alignItems: 'center', justifyContent: 'center', marginBottom: 12,
    },
    appName: { fontSize: 22, fontWeight: '700', color: C.text, marginBottom: 4 },
    appTagline: { fontSize: 13, color: C.textSecondary },
    card: {
      backgroundColor: C.surface, borderRadius: 12, padding: 20,
      borderWidth: 1, borderColor: C.border,
      elevation: 1,
      shadowColor: C.shadowColor,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: C.shadowOpacity,
      shadowRadius: 2,
    },
    heading: { fontSize: 20, fontWeight: '700', color: C.text, marginBottom: 16 },
    bullets: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 16 },
    bulletRow: { flexDirection: 'row', alignItems: 'center', gap: 5, width: '48%' },
    bulletText: { color: C.textSecondary, fontSize: 12 },
    primaryBtn: {
      backgroundColor: C.primary, borderRadius: 8, paddingVertical: 15,
      alignItems: 'center', elevation: 1,
      shadowColor: C.shadowColor, shadowOffset: { width: 0, height: 1 },
      shadowOpacity: C.shadowOpacity, shadowRadius: 2,
    },
    btnDisabled: { opacity: 0.65 },
    primaryBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
    footerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
    footerText: { color: C.textSecondary, fontSize: 14 },
    footerLink: { color: C.primary, fontSize: 14, fontWeight: '600' },
  });
}
