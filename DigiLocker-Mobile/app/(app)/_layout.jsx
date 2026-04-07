import { Tabs } from 'expo-router';
import { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { useDocumentStore } from '../../store/documentStore';
import { useSidebarStore } from '../../store/sidebarStore';
import QuickAccessSidebar from '../../components/ui/QuickAccessSidebar';

const VISIBLE_TABS = ['index', 'documents', 'upload', 'search', 'profile'];

function CustomTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();
  const { C } = useTheme();
  const visibleRoutes = state.routes.filter(r => VISIBLE_TABS.includes(r.name));

  return (
    <View style={[
      styles.tabBar,
      {
        backgroundColor: C.tabBackground,
        borderTopColor: C.tabBorder,
        paddingBottom: insets.bottom || 8,
      },
    ]}>
      {visibleRoutes.map((route) => {
        const idx = state.routes.indexOf(route);
        const isFocused = state.index === idx;
        const isUpload = route.name === 'upload';

        const iconMap = {
          index:     isFocused ? 'home'    : 'home-outline',
          documents: isFocused ? 'folder'  : 'folder-outline',
          upload:    'add',
          search:    isFocused ? 'search'  : 'search-outline',
          profile:   isFocused ? 'person'  : 'person-outline',
        };

        return (
          <TouchableOpacity
            key={route.key}
            onPress={() => { if (!isFocused) navigation.navigate(route.name); }}
            style={[styles.tabItem, isUpload && styles.tabItemUpload]}
            activeOpacity={0.75}
          >
            {isUpload ? (
              <View style={[styles.uploadBtn, {
                backgroundColor: C.primary,
                shadowColor: C.shadowColor,
                shadowOpacity: C.shadowOpacity * 2.5,
              }]}>
                <Ionicons name="add" size={26} color="#FFFFFF" />
              </View>
            ) : (
              <Ionicons
                name={iconMap[route.name] || 'ellipse-outline'}
                color={isFocused ? C.tabActive : C.tabInactive}
                size={24}
              />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function AppLayout() {
  const hydrate = useDocumentStore(s => s.hydrate);
  const sidebarVisible = useSidebarStore(s => s.visible);
  const hideSidebar = useSidebarStore(s => s.hide);
  
  useEffect(() => { hydrate(); }, []);

  return (
    <>
      <Tabs
        tabBar={props => <CustomTabBar {...props} />}
        screenOptions={{ headerShown: false }}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="documents" />
        <Tabs.Screen name="upload" />
        <Tabs.Screen name="search" />
        <Tabs.Screen name="profile" />
        <Tabs.Screen name="settings" options={{ tabBarButton: () => null }} />
      </Tabs>
      <QuickAccessSidebar 
        visible={sidebarVisible} 
        onClose={hideSidebar} 
      />
    </>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: 8,
    paddingHorizontal: 4,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  tabItemUpload: {
    marginTop: -16,
  },
  uploadBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
});
