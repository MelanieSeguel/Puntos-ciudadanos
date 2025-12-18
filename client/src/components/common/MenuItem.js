import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Item de menú reutilizable
 * @param {string} icon - Nombre del ícono de Ionicons
 * @param {string} title - Título del item
 * @param {string} subtitle - Subtítulo opcional
 * @param {function} onPress - Función al presionar
 */
export default function MenuItem({ icon, title, subtitle, onPress }) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <Ionicons name={icon} size={20} color="#4CAF50" style={styles.icon} />
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  icon: {
    marginRight: 15,
    width: 25,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    color: '#333',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: '#666',
  },
});
