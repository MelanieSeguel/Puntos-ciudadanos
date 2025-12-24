/**
 * UserNavigator
 * Navegación adaptada a plataforma:
 * - MÓVIL: Bottom Tab Navigator con 4 pestañas
 * - WEB: Layout con Sidebar (izquierda 20%) + Contenido (derecha 80%)
 */

import React, { useState } from 'react';
import { View, StyleSheet, Platform, TouchableOpacity, Text, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import UserHomeScreen from '../screens/user/UserHomeScreen';
import BenefitsScreen from '../screens/user/BenefitsScreen';
import EarnScreen from '../screens/user/EarnScreen';
import ProfileScreen from '../screens/user/ProfileScreen';
import HistorialScreen from '../screens/user/HistorialScreen';
import { COLORS, SPACING } from '../theme/theme';

const Tab = createBottomTabNavigator();
const isWeb = Platform.OS === 'web';

// ============================================================================
// COMPONENTE: Sidebar para WEB
// ============================================================================
function WebSidebar({ activeTab, onNavigate }) {
  const tabs = [
    { id: 'Home', label: 'Tus estadísticas', icon: 'home' },
    { id: 'Earn', label: 'Gana Puntos', icon: 'star' },
    { id: 'Benefits', label: 'Beneficios', icon: 'gift' },
    { id: 'Historial', label: 'Historial', icon: 'history' },
    { id: 'Profile', label: 'Configuración', icon: 'cog' },
  ];

  return (
    <View style={styles.webSidebar}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <MaterialCommunityIcons name="leaf" size={28} color={COLORS.white} />
        <View>
          <Text style={styles.logoMain}>Puntos</Text>
          <Text style={styles.logoSub}>Ciudadanos</Text>
        </View>
      </View>

      <ScrollView style={styles.sidebarNav}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.sidebarItem,
              activeTab === tab.id && styles.sidebarItemActive,
            ]}
            onPress={() => onNavigate(tab.id)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name={tab.icon}
              size={20}
              color={activeTab === tab.id ? COLORS.primary : COLORS.white}
            />
            <Text
              style={[
                styles.sidebarLabel,
                activeTab === tab.id && styles.sidebarLabelActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.sidebarFooter}>
        <TouchableOpacity style={styles.logoutBtn}>
          <MaterialCommunityIcons name="logout" size={20} color={COLORS.white} />
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ============================================================================
// COMPONENTE: Web Layout (Sidebar + Content)
// ============================================================================
function WebLayout() {
  const [activeTab, setActiveTab] = useState('Home');

  const renderContent = () => {
    switch (activeTab) {
      case 'Home':
        return <UserHomeScreen />;
      case 'Benefits':
        return <BenefitsScreen />;
      case 'Earn':
        return <EarnScreen />;
      case 'Historial':
        return <HistorialScreen />;
      case 'Profile':
        return <ProfileScreen />;
      default:
        return <UserHomeScreen />;
    }
  };

  return (
    <View style={styles.webContainer}>
      <WebSidebar activeTab={activeTab} onNavigate={setActiveTab} />
      <View style={styles.webContent}>{renderContent()}</View>
    </View>
  );
}

// ============================================================================
// COMPONENTE: Mobile Layout (Bottom Tabs)
// ============================================================================
function MobileLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        headerSafeAreaEnabled: false,
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: COLORS.white,
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
        tabBarIcon: ({ focused, color }) => {
          const iconMap = {
            Home: 'home',
            Benefits: 'gift',
            Earn: 'star',
            Profile: 'cog',
          };

          return (
            <MaterialCommunityIcons
              name={iconMap[route.name]}
              size={24}
              color={color}
            />
          );
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray,
        tabBarStyle: { ...styles.mobileTabBar, paddingBottom: insets.bottom, height: 60 + insets.bottom },
        tabBarLabelStyle: styles.tabBarLabel,
      })}
    >
      <Tab.Screen
        name="Home"
        component={UserHomeScreen}
        options={{ title: 'Inicio' }}
      />
      <Tab.Screen
        name="Benefits"
        component={BenefitsScreen}
        options={{ title: 'Beneficios' }}
      />
      <Tab.Screen
        name="Earn"
        component={EarnScreen}
        options={{ title: 'Gana Puntos' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Perfil' }}
      />
    </Tab.Navigator>
  );
}

// ============================================================================
// COMPONENTE: Principal (Detecta plataforma)
// ============================================================================
export default function UserNavigator() {
  return isWeb ? <WebLayout /> : <MobileLayout />;
}

// ============================================================================
// ESTILOS
// ============================================================================
const styles = StyleSheet.create({
  // --------- MOBILE STYLES ---------
  mobileTabBar: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.light,
    height: 60,
    paddingTop: SPACING.xs,
    paddingBottom: SPACING.xs,
  },
  tabBarLabel: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: '500',
  },

  // --------- WEB STYLES ---------
  webContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: COLORS.background,
  },
  webSidebar: {
    width: '20%',
    backgroundColor: '#1a1f36',
    flexDirection: 'column',
    borderRightWidth: 1,
    borderRightColor: '#2a2f46',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2f46',
  },
  logoMain: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 18,
  },
  logoSub: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 14,
  },
  sidebarHeader: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#2a2f46',
  },
  sidebarTitle: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
  },
  sidebarNav: {
    flex: 1,
    paddingVertical: 8,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 8,
    marginVertical: 4,
    borderRadius: 8,
  },
  sidebarItemActive: {
    backgroundColor: 'rgba(74, 144, 226, 0.15)',
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  sidebarLabel: {
    marginLeft: 12,
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '500',
  },
  sidebarLabelActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  sidebarFooter: {
    paddingHorizontal: 8,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#2a2f46',
    paddingTop: 8,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 71, 87, 0.1)',
  },
  logoutText: {
    marginLeft: 12,
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '500',
  },
  webContent: {
    flex: 1,
    width: '80%',
    backgroundColor: COLORS.white,
    overflow: 'auto',
  },
});
