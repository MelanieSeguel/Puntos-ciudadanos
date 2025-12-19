/**
 * App.js - Root de la aplicación
 * Orquesta la navegación basada en estado de autenticación y rol del usuario
 */

import React, { useContext } from 'react';
import { StatusBar, ActivityIndicator, View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, AuthContext } from './src/context/AuthContext';
import SplashScreen from './src/screens/SplashScreen';
import AuthNavigator from './src/navigation/AuthNavigator';
import UserNavigator from './src/navigation/UserNavigator';
import MerchantNavigator from './src/navigation/MerchantNavigator';
import AdminNavigator from './src/navigation/AdminNavigator';
import { COLORS } from './src/theme/theme';

const RootStack = createNativeStackNavigator();

/**
 * RootNavigator
 * Decide qué Navigator mostrar según:
 * 1. Si está cargando: SplashScreen
 * 2. Si no hay usuario: AuthNavigator
 * 3. Si hay usuario: Navigator según su rol
 */
function RootNavigator({ authState }) {
  return (
    <RootStack.Navigator
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
      }}
    >
      {authState.loading ? (
        <RootStack.Screen
          name="Splash"
          component={SplashScreen}
          options={{ animationEnabled: false }}
        />
      ) : !authState.authenticated ? (
        <RootStack.Screen
          name="Auth"
          component={AuthNavigator}
          options={{ animationEnabled: false }}
        />
      ) : (
        <>
          {authState.role === 'MERCHANT' && (
            <RootStack.Screen
              name="MerchantApp"
              component={MerchantNavigator}
              options={{ animationEnabled: false }}
            />
          )}
          {authState.role === 'ADMIN' && (
            <RootStack.Screen
              name="AdminApp"
              component={AdminNavigator}
              options={{ animationEnabled: false }}
            />
          )}
          {(authState.role === 'USER' || !authState.role) && (
            <RootStack.Screen
              name="UserApp"
              component={UserNavigator}
              options={{ animationEnabled: false }}
            />
          )}
        </>
      )}
    </RootStack.Navigator>
  );
}

/**
 * AppContent
 * Lee el AuthContext y renderiza el Navigator apropiado
 */
function AppContent() {
  const { authState } = useContext(AuthContext);

  // Mientras carga la autenticación, mostrar spinner
  if (authState.loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <RootNavigator authState={authState} />
    </NavigationContainer>
  );
}

/**
 * App Principal
 */
export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppContent />
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
});
