import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Caja de información reutilizable
 * @param {string} icon - Nombre del ícono de Ionicons
 * @param {string} title - Título opcional
 * @param {string} message - Mensaje a mostrar
 * @param {string} backgroundColor - Color de fondo
 * @param {string} textColor - Color del texto
 */
export default function InfoBox({ 
  icon = 'information-circle',
  title,
  message, 
  backgroundColor = '#E8F5E9',
  textColor = '#2E7D32'
}) {
  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.header}>
        <Ionicons name={icon} size={18} color={textColor} style={styles.icon} />
        {title && <Text style={[styles.title, { color: textColor }]}>{title}</Text>}
      </View>
      <Text style={[styles.message, { color: textColor }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    padding: 15,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    marginRight: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
  },
  message: {
    fontSize: 13,
    lineHeight: 20,
  },
});
