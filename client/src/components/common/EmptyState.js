import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * Estado vacío reutilizable
 * @param {string} icon - Ícono a mostrar (emoji o nombre)
 * @param {string} message - Mensaje a mostrar
 */
export default function EmptyState({ icon = '📋', message = 'No hay datos' }) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  icon: {
    fontSize: 64,
    marginBottom: 15,
  },
  message: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});
