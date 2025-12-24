/**
 * MerchantNavigator
 * Bottom Tab Navigator para comercios
 * Pestañas: Dashboard, Validar (Scanner), Historial
 */

import React from 'react';
import { StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import MerchantDashboardScreen from '../screens/merchant/MerchantDashboardScreen';
import ScannerScreen from '../screens/merchant/ScannerScreen';
import HistoryScreen from '../screens/merchant/HistoryScreen';
import { COLORS, TAB_CONFIG, SPACING } from '../theme/theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const isWeb = Platform.OS === 'web';

// Stack para Scanner (modal)
function ScannerStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: COLORS.merchant,
        },
        headerTintColor: COLORS.white,
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Stack.Screen
        name="ScannerMain"
        component={ScannerScreen}
        options={{ title: 'Validar Cupón' }}
      />
    </Stack.Navigator>
  );
}

export default function MerchantNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const tabConfig = TAB_CONFIG.merchantTabs.find((t) => t.name === route.name);

        return {
          headerShown: true,
          headerStyle: {
            backgroundColor: COLORS.merchant,
          },
          headerTintColor: COLORS.white,
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 18,
          },
          tabBarIcon: ({ focused }) => {
            const iconMap = {
              MerchantDashboard: 'chart-box',
              Scanner: 'qrcode-scan',
              History: 'history',
            };
            return (
              <MaterialCommunityIcons
                name={iconMap[route.name]}
                size={24}
                color={focused ? tabConfig.color : COLORS.gray}
              />
            );
          },
          tabBarLabel: tabConfig?.label,
          tabBarActiveTintColor: tabConfig?.color,
          tabBarInactiveTintColor: COLORS.gray,
          tabBarStyle: isWeb 
            ? styles.webTabBar 
            : { ...styles.mobileTabBar, paddingBottom: insets.bottom, height: 60 + insets.bottom },
        };
      }}
    >
      <Tab.Screen
        name="MerchantDashboard"
        component={MerchantDashboardScreen}
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen
        name="Scanner"
        component={ScannerStack}
        options={{ title: 'Validar' }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{ title: 'Historial' }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  mobileTabBar: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.light,
    height: 60,
    paddingTop: SPACING.xs,
  },
  webTabBar: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.light,
    height: 70,
    paddingTop: SPACING.sm,
  },
});
