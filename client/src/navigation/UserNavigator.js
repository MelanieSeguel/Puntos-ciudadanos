/**
 * UserNavigator
 * Bottom Tab Navigator para usuarios normales (ciudadanos)
 * Pestañas: Home, Beneficios, Gana Puntos, Perfil
 */

import React from 'react';
import { StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import UserHomeScreen from '../screens/user/UserHomeScreen';
import BenefitsScreen from '../screens/user/BenefitsScreen';
import EarnScreen from '../screens/user/EarnScreen';
import ProfileScreen from '../screens/user/ProfileScreen';
import { COLORS, TAB_CONFIG, SPACING } from '../theme/theme';

const Tab = createBottomTabNavigator();
const isWeb = Platform.OS === 'web';

export default function UserNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const tabConfig = TAB_CONFIG.userTabs.find((t) => t.name === route.name);

        return {
          headerShown: true,
          headerStyle: {
            backgroundColor: COLORS.user,
          },
          headerTintColor: COLORS.white,
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 18,
          },
          tabBarIcon: ({ focused }) => {
            const iconMap = {
              UserHome: 'home',
              Earn: 'star',
              Benefits: 'gift',
              Profile: 'cog',
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
      <Tab.Screen name="UserHome" component={UserHomeScreen} options={{ title: 'Estadísticas' }} />
      <Tab.Screen name="Earn" component={EarnScreen} options={{ title: 'Gana Puntos' }} />
      <Tab.Screen name="Benefits" component={BenefitsScreen} options={{ title: 'Beneficios' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Configuración' }} />
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
