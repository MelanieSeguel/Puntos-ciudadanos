import React, { useContext } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';

// Pantallas de USER
import HomeScreen from '../screens/user/HomeScreen';
import BenefitsScreen from '../screens/user/BenefitsScreen';
import EarnPointsScreen from '../screens/user/EarnPointsScreen';
import ProfileScreen from '../screens/user/ProfileScreen';

// Pantallas de MERCHANT
import DashboardScreen from '../screens/merchant/DashboardScreen';
import ValidateScreen from '../screens/merchant/ValidateScreen';
import HistoryScreen from '../screens/merchant/HistoryScreen';

// Pantallas de ADMIN
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Navegación para usuarios normales - TABS (MÓVIL)
function UserTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Benefits') {
            iconName = focused ? 'gift' : 'gift-outline';
          } else if (route.name === 'EarnPoints') {
            iconName = focused ? 'qr-code' : 'qr-code-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ tabBarLabel: 'Inicio' }}
      />
      <Tab.Screen 
        name="Benefits" 
        component={BenefitsScreen}
        options={{ tabBarLabel: 'Beneficios' }}
      />
      <Tab.Screen 
        name="EarnPoints" 
        component={EarnPointsScreen}
        options={{ tabBarLabel: 'Gana Puntos' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ tabBarLabel: 'Perfil' }}
      />
    </Tab.Navigator>
  );
}

// Navegación para usuarios normales - STACK (WEB)
function UserStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen 
        name="HomeStack" 
        component={HomeScreen}
      />
      <Stack.Screen 
        name="BenefitsStack" 
        component={BenefitsScreen}
      />
      <Stack.Screen 
        name="EarnPointsStack" 
        component={EarnPointsScreen}
      />
      <Stack.Screen 
        name="ProfileStack" 
        component={ProfileScreen}
      />
    </Stack.Navigator>
  );
}

// Navegación para comerciantes - TABS (MÓVIL)
function MerchantTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          } else if (route.name === 'Validate') {
            iconName = focused ? 'qr-code' : 'qr-code-outline';
          } else if (route.name === 'History') {
            iconName = focused ? 'time' : 'time-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#FF9800',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{ tabBarLabel: 'Dashboard' }}
      />
      <Tab.Screen 
        name="Validate" 
        component={ValidateScreen}
        options={{ tabBarLabel: 'Validar' }}
      />
      <Tab.Screen 
        name="History" 
        component={HistoryScreen}
        options={{ tabBarLabel: 'Historial' }}
      />
    </Tab.Navigator>
  );
}

// Navegación para comerciantes - STACK (WEB)
function MerchantStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen 
        name="DashboardStack" 
        component={DashboardScreen}
      />
      <Stack.Screen 
        name="ValidateStack" 
        component={ValidateScreen}
      />
      <Stack.Screen 
        name="HistoryStack" 
        component={HistoryScreen}
      />
    </Stack.Navigator>
  );
}

// Navegación para administradores - TABS (MÓVIL)
function AdminTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="AdminDashboard" 
        component={AdminDashboardScreen}
        options={{ 
          tabBarLabel: 'Panel Admin',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons 
              name={focused ? 'shield-checkmark' : 'shield-checkmark-outline'} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Navegación para administradores - STACK (WEB)
function AdminStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen 
        name="AdminDashboardStack" 
        component={AdminDashboardScreen}
      />
    </Stack.Navigator>
  );
}

// Selector de navegación basado en rol y plataforma
export default function MainNavigator() {
  const { authState } = useContext(AuthContext);
  const userRole = authState.role?.toUpperCase();
  const isWeb = Platform.OS === 'web';

  // MERCHANT
  if (userRole === 'MERCHANT') {
    return isWeb ? <MerchantStackNavigator /> : <MerchantTabNavigator />;
  }

  // ADMIN
  if (userRole === 'ADMIN') {
    return isWeb ? <AdminStackNavigator /> : <AdminTabNavigator />;
  }

  // USER (default)
  return isWeb ? <UserStackNavigator /> : <UserTabNavigator />;
}
