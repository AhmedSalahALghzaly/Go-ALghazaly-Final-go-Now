import React, { useState, useCallback } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform, View, StyleSheet, TouchableOpacity, Text, Pressable, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/hooks/useTheme';
import { useTranslation } from '../../src/hooks/useTranslation';
import { useAppStore, useCanAccessAdminPanel } from '../../src/store/appStore';
import { AdvancedSearchBottomSheet } from '../../src/components/ui/AdvancedSearchBottomSheet';

// Owner email that can always access the interface
const OWNER_EMAIL = 'pc.2025.ai@gmail.com';

export default function TabLayout() {
  const { colors } = useTheme();
  const { t, isRTL, language } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const cartItems = useAppStore((state) => state.cartItems);
  const user = useAppStore((state) => state.user);
  const partners = useAppStore((state) => state.partners);
  const admins = useAppStore((state) => state.admins);
  const userRole = useAppStore((state) => state.userRole);
  const canAccessAdminPanel = useCanAccessAdminPanel();
  
  // State for advanced search bottom sheet
  const [showSearch, setShowSearch] = useState(false);
  
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Check if user can access owner interface
  const isOwner = user?.email?.toLowerCase() === OWNER_EMAIL.toLowerCase();
  const isPartner = partners.some(
    (p: any) => p.email?.toLowerCase() === user?.email?.toLowerCase()
  );
  const isAdmin = admins.some(
    (a: any) => a.email?.toLowerCase() === user?.email?.toLowerCase()
  ) || userRole === 'admin';
  const canAccessOwner = isOwner || isPartner;

  // Helper to check active tab
  const isTabActive = (route: string) => {
    if (route === '/') return pathname === '/' || pathname === '/index' || pathname === '/(tabs)' || pathname === '/(tabs)/index';
    if (route === '/categories') return pathname.includes('categories');
    if (route === '/cart') return pathname.includes('cart');
    if (route === '/profile') return pathname.includes('profile');
    return false;
  };

  // Custom center button for Owner/Admin Access
  const CenterAccessButton = () => {
    // Show Owner button for owners/partners
    if (canAccessOwner) {
      return (
        <TouchableOpacity
          style={styles.ownerButton}
          onPress={() => router.push('/owner')}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#8B5CF6', '#6366F1']}
            style={styles.ownerButtonGradient}
          >
            <Ionicons name="diamond" size={24} color="#FFF" />
          </LinearGradient>
        </TouchableOpacity>
      );
    }
    
    // Show Admin button for admins
    if (isAdmin) {
      return (
        <TouchableOpacity
          style={styles.ownerButton}
          onPress={() => router.push('/admin')}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#10B981', '#059669']}
            style={styles.ownerButtonGradient}
          >
            <Ionicons name="settings" size={24} color="#FFF" />
          </LinearGradient>
        </TouchableOpacity>
      );
    }
    
    return null;
  };

  // Determine if we should show the center button
  const showCenterButton = canAccessOwner || isAdmin;

  // Memoized search tab button to prevent re-renders
  const SearchTabButton = useCallback((props: any) => {
    return (
      <Pressable
        onPress={() => setShowSearch(true)}
        style={({ pressed }) => [
          { 
            flex: 1,
            alignItems: 'center', 
            justifyContent: 'center',
            paddingVertical: 4,
            opacity: pressed ? 0.7 : 1,
          }
        ]}
      >
        <View style={{ alignItems: 'center' }}>
          <Ionicons 
            name="search" 
            size={24} 
            color={colors.tabBarInactive} 
          />
          <Text style={{ 
            fontSize: 12, 
            fontWeight: '600', 
            color: colors.tabBarInactive,
            marginTop: 2,
          }}>
            {language === 'ar' ? 'بحث' : 'Search'}
          </Text>
        </View>
      </Pressable>
    );
  }, [colors.tabBarInactive, language]);

  return (
    <>
      <View style={{ flex: 1 }}>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarStyle: {
              backgroundColor: colors.tabBar,
              borderTopColor: colors.border,
              borderTopWidth: 1,
              height: Platform.OS === 'ios' ? 88 : 64,
              paddingBottom: Platform.OS === 'ios' ? insets.bottom : 8,
              paddingTop: 8,
            },
            tabBarActiveTintColor: colors.tabBarActive,
            tabBarInactiveTintColor: colors.tabBarInactive,
            tabBarLabelStyle: {
              fontSize: 11,
              fontWeight: '600',
            },
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: t('home'),
              tabBarIcon: ({ color, focused }) => (
                <Ionicons name={focused ? "home" : "home-outline"} size={24} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="categories"
            options={{
              title: t('categories'),
              tabBarIcon: ({ color, focused }) => (
                <Ionicons name={focused ? "grid" : "grid-outline"} size={24} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="cart"
            options={{
              title: t('cart'),
              tabBarIcon: ({ color, focused }) => (
                <Ionicons name={focused ? "cart" : "cart-outline"} size={24} color={color} />
              ),
              tabBarBadge: cartCount > 0 ? cartCount : undefined,
              tabBarBadgeStyle: {
                backgroundColor: colors.error,
                fontSize: 10,
              },
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: t('profile'),
              tabBarIcon: ({ color, focused }) => (
                <Ionicons name={focused ? "person" : "person-outline"} size={24} color={color} />
              ),
            }}
          />
        </Tabs>
      </View>

      {/* Advanced Search Bottom Sheet - Outside Tabs to avoid expo-router warning */}
      <AdvancedSearchBottomSheet 
        visible={showSearch} 
        onClose={() => setShowSearch(false)} 
      />
    </>
  );
}

const styles = StyleSheet.create({
  // Keep styles for any future use
  ownerButtonContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 45 : 25,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
  },
  ownerButton: {
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  ownerButtonGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFF',
  },
});
