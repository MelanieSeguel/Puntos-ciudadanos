import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Card de estadística reutilizable
 * @param {string} icon - Nombre del ícono de Ionicons
 * @param {string|number} value - Valor a mostrar
 * @param {string} label - Etiqueta descriptiva
 * @param {string} iconColor - Color del ícono (default: #4CAF50)
 */
export default function StatCard({ icon, value, label, iconColor = '#4CAF50' }) {
  return (
    <View style={styles.card}>
      <Ionicons name={icon} size={32} color={iconColor} style={styles.icon} />
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    width: '31%',
    minWidth: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  icon: {
    marginBottom: 8,
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  label: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});
