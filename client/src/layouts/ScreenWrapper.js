// src/layouts/ScreenWrapper.js
/**
 * ScreenWrapper - Contenedor responsivo
 * Maneja diferencias entre Web y Mobile
 * Aplica SafeAreaView en mobile y max-width en web
 */

import React from 'react';
import { View, Platform, Dimensions, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LAYOUT, COLORS, SPACING } from '../theme/theme';

const ScreenWrapper = ({
  children,
  safeArea = true,
  bgColor = COLORS.white,
  padding = SPACING.md,
  maxWidth = true,
}) => {
  const isWeb = Platform.OS === 'web';

  // Para web, aplicar max-width y centrado
  const webStyles = isWeb && maxWidth
    ? {
        maxWidth: LAYOUT.webMaxWidth,
        width: '100%',
        alignSelf: 'center',
        marginHorizontal: 'auto',
      }
    : {};

  const Container = safeArea && !isWeb ? SafeAreaView : View;

  return (
    <Container
      style={[
        styles.container,
        { backgroundColor: bgColor },
      ]}
    >
      <View
        style={[
          styles.content,
          webStyles,
          {
            paddingHorizontal: padding !== 0 ? (isWeb ? SPACING.xl : padding) : 0,
            paddingVertical: padding !== 0 ? (isWeb ? SPACING.lg : padding) : 0,
          },
        ]}
      >
        {children}
      </View>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  content: {
    flex: 1,
  },
});

export default ScreenWrapper;
