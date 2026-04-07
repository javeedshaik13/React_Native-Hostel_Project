import React, { useState, useMemo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, Alert, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../contexts/ThemeContext';
import ThemeToggle from '../../components/ui/ThemeToggle';

export default function LoginScreen() {
  const router = useRouter();
  const { C } = useTheme();
  const login = useAuthStore(s => s.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const styles = useMemo(() => createStyles(C), [C]);

  const handleLogin = () => {
    const e = email.trim();
    if (!e || !password) {
      Alert.alert('Missing fields', 'Please enter your email and password.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak password', 'Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const ok = login(e, password);
      setLoading(false);
      if (ok) router.replace('/(app)');
      else Alert.alert('Sign in failed', 'Please check your credentials and try again.');
    }, 600);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.root}
    >
      {/* Theme Toggle - Top Right */}
      <View style={styles.themeToggleContainer}>
        <ThemeToggle compact />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo / brand */}
        <View style={styles.brand}>
          <View style={styles.logoBox}>
            <Ionicons name="lock-closed" size={26} color={C.primary} />
          </View>
          <Text style={styles.appName}>DigiLocker</Text>
          <Text style={styles.appTagline}>Your personal document vault</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.heading}>Sign in</Text>

          {/* Email */}
          <Text style={styles.label}>Email address</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="mail-outline" size={17} color={C.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor={C.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Password */}
          <Text style={styles.label}>Password</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="key-outline" size={17} color={C.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Min. 6 characters"
              placeholderTextColor={C.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPass}
            />
            <TouchableOpacity onPress={() => setShowPass(p => !p)} style={styles.eyeBtn}>
              <Ionicons
                name={showPass ? 'eye-off-outline' : 'eye-outline'}
                size={17}
                color={C.textMuted}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.forgotRow}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.primaryBtn, loading && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryBtnText}>{loading ? 'Signing in…' : 'Sign In'}</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.footerLink}>Create account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function createStyles(C) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: C.backgroundSecondary },
    themeToggleContainer: {
      position: 'absolute',
      top: 50,
      right: 20,
      zIndex: 10,
    },
    scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 48 },
    brand: { alignItems: 'center', marginBottom: 32 },
    logoBox: {
      width: 56, height: 56, borderRadius: 14,
      backgroundColor: C.primaryMuted,
      alignItems: 'center', justifyContent: 'center', marginBottom: 12,
    },
    appName: { fontSize: 22, fontWeight: '700', color: C.text, marginBottom: 4 },
    appTagline: { fontSize: 13, color: C.textSecondary },
    card: {
      backgroundColor: C.surface,
      borderRadius: 12,
      padding: 20,
      borderWidth: 1,
      borderColor: C.border,
      elevation: 2,
      shadowColor: C.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
    },
    heading: { fontSize: 20, fontWeight: '700', color: C.text, marginBottom: 20 },
    label: { fontSize: 13, fontWeight: '500', color: C.textSecondary, marginBottom: 6, marginTop: 4 },
    inputWrap: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: C.surfaceElevated,
      borderRadius: 8, borderWidth: 1, borderColor: C.border,
      paddingHorizontal: 12, marginBottom: 12,
    },
    inputIcon: { marginRight: 8 },
    input: { flex: 1, color: C.text, fontSize: 15, paddingVertical: 13 },
    eyeBtn: { padding: 4 },
    forgotRow: { alignSelf: 'flex-end', marginBottom: 20 },
    forgotText: { color: C.primary, fontSize: 13 },
    primaryBtn: {
      backgroundColor: C.primary,
      borderRadius: 8,
      paddingVertical: 15,
      alignItems: 'center',
      elevation: 1,
      shadowColor: C.shadowColor,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: C.shadowOpacity,
      shadowRadius: 2,
    },
    btnDisabled: { opacity: 0.65 },
    primaryBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
    footerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
    footerText: { color: C.textSecondary, fontSize: 14 },
    footerLink: { color: C.primary, fontSize: 14, fontWeight: '600' },
  });
}
