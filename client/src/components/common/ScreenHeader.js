import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * Header reutilizable para las pantallas
 * @param {string} title - Título principal
 * @param {string} subtitle - Subtítulo opcional
 * @param {string} backgroundColor - Color de fondo (default: #4CAF50)
 */
export default function ScreenHeader({ title, subtitle, backgroundColor = '#4CAF50' }) {
  return (
    <View style={[styles.header, { backgroundColor }]}>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
});
