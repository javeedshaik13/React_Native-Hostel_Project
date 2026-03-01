import {
  View,
  Text,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  TouchableOpacity,
  Platform,
  Animated,
  Easing,
  Dimensions,
  StatusBar,
} from "react-native";
import React, { useState, useEffect, useRef } from "react";
import { useNavigation } from "@react-navigation/native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

/* ─── Rotating ring ─────────────────────────────────────── */
const RotatingRing = ({ size, color, duration, style }) => {
  const rot = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(rot, {
        toValue: 1,
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);
  const rotate = rot.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });
  return (
    <Animated.View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 2,
          borderColor: color,
          borderStyle: "dashed",
          position: "absolute",
          transform: [{ rotate }],
        },
        style,
      ]}
    />
  );
};

/* ─── Pulsing orb ───────────────────────────────────────── */
const PulsingOrb = ({ size, color, delay, style }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.6)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(scale, { toValue: 1.25, duration: 2200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.15, duration: 2200, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(scale, { toValue: 1, duration: 2200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.6, duration: 2200, useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, []);
  return (
    <Animated.View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          position: "absolute",
          transform: [{ scale }],
          opacity,
        },
        style,
      ]}
    />
  );
};

/* ─── Labelled input field ──────────────────────────────── */
const InputField = ({ label, icon, value, onChangeText, placeholder, secureTextEntry, keyboardType, autoCapitalize, rightIcon }) => {
  const [focused, setFocused] = useState(false);
  const lineAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    setFocused(true);
    Animated.timing(lineAnim, { toValue: 1, duration: 220, useNativeDriver: false }).start();
  };
  const handleBlur = () => {
    setFocused(false);
    Animated.timing(lineAnim, { toValue: 0, duration: 220, useNativeDriver: false }).start();
  };

  const borderColor = lineAnim.interpolate({ inputRange: [0, 1], outputRange: ["#E0E0E0", "#6C63FF"] });
  const labelColor = focused || value ? "#6C63FF" : "#888";

  return (
    <View style={inputStyles.wrapper}>
      <Text style={[inputStyles.label, { color: labelColor }]}>{label}</Text>
      <Animated.View style={[inputStyles.box, { borderColor }]}>
        <Ionicons name={icon} size={19} color={focused ? "#6C63FF" : "#B0B0B0"} style={inputStyles.icon} />
        <TextInput
          style={inputStyles.field}
          placeholder={placeholder}
          placeholderTextColor="#C0C0C0"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType || "default"}
          autoCapitalize={autoCapitalize || "none"}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        {rightIcon}
      </Animated.View>
    </View>
  );
};

const inputStyles = StyleSheet.create({
  wrapper: { marginBottom: 12 },
  label: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 7,
    letterSpacing: 0.4,
  },
  box: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
    borderRadius: 14,
    borderWidth: 1.8,
    paddingHorizontal: 14,
    height: 54,
  },
  icon: { marginRight: 10 },
  field: {
    flex: 1,
    fontSize: 15,
    color: "#1a1a2e",
  },
});

/* ─── Main Screen ───────────────────────────────────────── */
const LoginScreen = ({ email: initialEmail, password: initialPassword }) => {
  const navigation = useNavigation();
  const [email, setEmail] = useState(initialEmail || "");
  const [password, setPassword] = useState(initialPassword || "");
  const [showPassword, setShowPassword] = useState(false);

  /* Card slide-up on mount */
  const cardAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(cardAnim, { toValue: 1, tension: 40, friction: 9, delay: 200, useNativeDriver: true }).start();
  }, []);
  const cardY = cardAnim.interpolate({ inputRange: [0, 1], outputRange: [100, 0] });
  const cardOpacity = cardAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

  /* Logo bounce */
  const logoAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(logoAnim, { toValue: 1, tension: 60, friction: 6, useNativeDriver: true }).start();
  }, []);
  const logoScale = logoAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] });

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0f0c29" />

      {/* ── Animated background ── */}
      <PulsingOrb size={320} color="#6C63FF" delay={0}   style={{ top: -100, left: -100 }} />
      <PulsingOrb size={260} color="#e040fb" delay={700} style={{ bottom: height * 0.05, right: -100 }} />
      <PulsingOrb size={180} color="#00b4d8" delay={400} style={{ top: height * 0.35, right: -50 }} />

      <RotatingRing size={220} color="rgba(108,99,255,0.4)"  duration={8000}  style={{ top: -60, left: -60 }} />
      <RotatingRing size={150} color="rgba(224,64,251,0.35)" duration={6000}  style={{ bottom: height * 0.1, right: -50 }} />
      <RotatingRing size={100} color="rgba(0,180,216,0.4)"   duration={10000} style={{ top: height * 0.3, left: -30 }} />

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <View style={styles.scroll}>

          {/* ── Header  ── */}
          <View style={styles.header}>
            <Animated.View style={[styles.logoCircle, { transform: [{ scale: logoScale }] }]}>
              <Ionicons name="lock-closed" size={36} color="#fff" />
            </Animated.View>
            <Text style={styles.appName}>DigiLocker</Text>
            <Text style={styles.tagline}>Secure  ·  Simple  ·  Smart</Text>
          </View>

          {/* ── Card ── */}
          <Animated.View style={[styles.card, { opacity: cardOpacity, transform: [{ translateY: cardY }] }]}>
            <Text style={styles.cardTitle}>Welcome Back 👋</Text>
            <Text style={styles.cardSubtitle}>Please sign in to continue</Text>

            <InputField
              label="Email Address"
              icon="mail-outline"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
            />

            <InputField
              label="Password"
              icon="lock-closed-outline"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry={!showPassword}
              rightIcon={
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                  <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#B0B0B0" />
                </TouchableOpacity>
              }
            />

            <TouchableOpacity style={styles.forgotBtn}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            {/* Sign In */}
            <TouchableOpacity
              style={styles.loginBtn}
              onPress={() => navigation.navigate("DashboardScreen", { email, password })}
              activeOpacity={0.82}
            >
              <Text style={styles.loginBtnText}>Sign In</Text>
              <Ionicons name="arrow-forward-circle" size={22} color="#fff" style={{ marginLeft: 8 }} />
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google */}
            <TouchableOpacity style={styles.googleBtn} onPress={() => alert("Google Login")} activeOpacity={0.85}>
              <MaterialCommunityIcons name="google" size={21} color="#DB4437" />
              <Text style={styles.googleBtnText}>Sign in with Google</Text>
            </TouchableOpacity>

            {/* Sign up row */}
            <View style={styles.signupRow}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("RegisterScreen")}>
                <Text style={styles.signupLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default LoginScreen;

/* ─── Styles ─────────────────────────────────────────────── */
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0f0c29",
  },

  scroll: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 22,
    paddingVertical: 20,
  },

  /* Header */
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  logoCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#6C63FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    shadowColor: "#6C63FF",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.75,
    shadowRadius: 20,
    elevation: 16,
  },
  appName: {
    fontSize: 30,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 2.5,
  },
  tagline: {
    fontSize: 12,
    color: "rgba(255,255,255,0.55)",
    marginTop: 6,
    letterSpacing: 1.5,
  },

  /* Card */
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 22,
    paddingBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.3,
    shadowRadius: 28,
    elevation: 22,
  },
  cardTitle: {
    fontSize: 23,
    fontWeight: "800",
    color: "#1a1a2e",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13.5,
    color: "#9e9e9e",
    marginBottom: 18,
  },

  eyeBtn: { padding: 4 },

  /* Forgot */
  forgotBtn: { alignSelf: "flex-end", marginBottom: 16, marginTop: -4 },
  forgotText: { color: "#6C63FF", fontSize: 13, fontWeight: "600" },

  /* Sign In button */
  loginBtn: {
    backgroundColor: "#6C63FF",
    borderRadius: 14,
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    shadowColor: "#6C63FF",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.55,
    shadowRadius: 16,
    elevation: 12,
  },
  loginBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.6,
  },

  /* Divider */
  divider: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  dividerLine: { flex: 1, height: 1, backgroundColor: "#ECECEC" },
  dividerText: { color: "#C0C0C0", fontSize: 12, marginHorizontal: 12 },

  /* Google */
  googleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    height: 52,
    borderWidth: 1.5,
    borderColor: "#E8E8E8",
    backgroundColor: "#FEFEFE",
    marginBottom: 16,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  googleBtnText: { fontSize: 15, fontWeight: "600", color: "#333" },

  /* Sign up */
  signupRow: { flexDirection: "row", justifyContent: "center", alignItems: "center" },
  signupText: { color: "#9e9e9e", fontSize: 13.5 },
  signupLink: { color: "#6C63FF", fontSize: 13.5, fontWeight: "700" },
});