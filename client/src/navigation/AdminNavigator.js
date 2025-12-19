/**
 * AdminNavigator
 * Bottom Tab Navigator para admins
 * Pestañas: Dashboard, Usuarios, Comercios, Reportes
 */

import React from 'react';
import { StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import UsersManagementScreen from '../screens/admin/UsersManagementScreen';
import MerchantsManagementScreen from '../screens/admin/MerchantsManagementScreen';
import ReportsScreen from '../screens/admin/ReportsScreen';
import { COLORS, TAB_CONFIG, SPACING } from '../theme/theme';

const Tab = createBottomTabNavigator();
const isWeb = Platform.OS === 'web';

export default function AdminNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const tabConfig = TAB_CONFIG.adminTabs.find((t) => t.name === route.name);

        return {
          headerShown: true,
          headerStyle: {
            backgroundColor: COLORS.admin,
          },
          headerTintColor: COLORS.white,
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 18,
          },
          tabBarIcon: ({ focused }) => {
            const iconMap = {
              AdminDashboard: 'view-dashboard',
              Users: 'account-multiple',
              Merchants: 'store',
              Reports: 'chart-line',
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
          tabBarStyle: isWeb ? styles.webTabBar : styles.mobileTabBar,
        };
      }}
    >
      <Tab.Screen
        name="AdminDashboard"
        component={AdminDashboardScreen}
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen
        name="Users"
        component={UsersManagementScreen}
        options={{ title: 'Usuarios' }}
      />
      <Tab.Screen
        name="Merchants"
        component={MerchantsManagementScreen}
        options={{ title: 'Comercios' }}
      />
      <Tab.Screen
        name="Reports"
        component={ReportsScreen}
        options={{ title: 'Reportes' }}
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
