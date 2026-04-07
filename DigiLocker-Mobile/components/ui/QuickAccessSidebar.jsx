import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuthStore } from '../../store/authStore';

const { width } = Dimensions.get('window');
const SIDEBAR_WIDTH = Math.min(280, width * 0.75);

const MENU_ITEMS = [
  { icon: 'person-outline', label: 'Profile', route: '/(app)/profile' },
  { icon: 'settings-outline', label: 'Settings', route: '/(app)/settings' },
  { icon: 'language-outline', label: 'Language', route: null }, // Placeholder
  { icon: 'shield-checkmark-outline', label: 'Security', route: null }, // Placeholder
  { icon: 'notifications-outline', label: 'Notifications', route: null }, // Placeholder
  { icon: 'help-circle-outline', label: 'Help & Support', route: null }, // Placeholder
];

function MenuItem({ item, onPress, C }) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.menuItem,
        pressed && { backgroundColor: C.surfaceElevated },
      ]}
      onPress={() => onPress(item)}
    >
      <View style={[styles.menuIcon, { backgroundColor: C.primaryMuted }]}>
        <Ionicons name={item.icon} size={20} color={C.primary} />
      </View>
      <Text style={[styles.menuLabel, { color: C.text }]}>{item.label}</Text>
      <Ionicons name="chevron-forward" size={18} color={C.textMuted} />
    </Pressable>
  );
}

export default function QuickAccessSidebar({ visible, onClose }) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { C } = useTheme();
  const user = useAuthStore(s => s.user);

  const translateX = useSharedValue(-SIDEBAR_WIDTH);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // Enhanced spring animation for smoother open
      translateX.value = withSpring(0, { 
        damping: 25, 
        stiffness: 180,
        mass: 0.8,
      });
      backdropOpacity.value = withTiming(1, { duration: 250 });
    } else {
      // Smooth close animation
      translateX.value = withTiming(-SIDEBAR_WIDTH, { duration: 200 });
      backdropOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible]);

  const animatedSidebarStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }), []);

  const animatedBackdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  }), []);

  const handleMenuPress = (item) => {
    if (item.route) {
      router.push(item.route);
      onClose();
    } else {
      // Placeholder for unimplemented features
      onClose();
    }
  };

  if (!visible) return null;

  const initials = user?.initials || (user?.name
    ? user.name.trim().split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2)
    : '?');

  return (
    <View style={styles.container} pointerEvents="box-none">
      <Animated.View style={[styles.backdrop, animatedBackdropStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      <Animated.View
        style={[
          styles.sidebar,
          {
            backgroundColor: C.surface,
            paddingTop: insets.top + 20,
            paddingBottom: insets.bottom + 20,
            width: SIDEBAR_WIDTH,
          },
          animatedSidebarStyle,
        ]}
      >
        <View style={styles.header}>
          <View style={[styles.avatar, { backgroundColor: C.primary }]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: C.text }]} numberOfLines={1}>
              {user?.name || 'User'}
            </Text>
            <Text style={[styles.userEmail, { color: C.textSecondary }]} numberOfLines={1}>
              {user?.email || ''}
            </Text>
          </View>
          <Pressable onPress={onClose} hitSlop={8} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={C.textMuted} />
          </Pressable>
        </View>

        <View style={[styles.divider, { backgroundColor: C.border }]} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.menuContainer}
        >
          {MENU_ITEMS.map((item, index) => (
            <MenuItem key={index} item={item} onPress={handleMenuPress} C={C} />
          ))}
        </ScrollView>

        <View style={[styles.divider, { backgroundColor: C.border }]} />

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: C.textMuted }]}>
            DigiLocker v1.0.0
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sidebar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
  },
  closeButton: {
    padding: 4,
  },
  divider: {
    height: 1,
    marginHorizontal: 20,
    marginVertical: 12,
  },
  menuContainer: {
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
  },
});
