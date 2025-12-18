import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Sidebar de navegación para web
 */
export default function Sidebar({ activeRoute = 'home', onNavigate = () => {} }) {
  const menuItems = [
    { id: 'Home', label: 'Tus estadísticas', icon: 'home-outline' },
    { id: 'EarnPoints', label: 'Gana Puntos', icon: 'star-outline' },
    { id: 'Benefits', label: 'Beneficios', icon: 'gift-outline' },
    { id: 'History', label: 'Historial', icon: 'time-outline' },
    { id: 'Profile', label: 'Configuración', icon: 'settings-outline' },
  ];

  return (
    <View style={styles.container}>
      {/* Logo */}
      <TouchableOpacity 
        style={styles.logo}
        onPress={() => onNavigate('Home')}
      >
        <Ionicons name="leaf" size={24} color="#4CAF50" />
        <Text style={styles.logoText}>Puntos{'\n'}Ciudadanos</Text>
      </TouchableOpacity>

      {/* Menu Items */}
      <View style={styles.menu}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.menuItem,
              activeRoute === item.id && styles.menuItemActive
            ]}
            onPress={() => onNavigate(item.id)}
          >
            <Ionicons
              name={item.icon}
              size={20}
              color={activeRoute === item.id ? '#fff' : '#b0b0b0'}
            />
            <Text
              style={[
                styles.menuLabel,
                activeRoute === item.id && styles.menuLabelActive
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.themeToggle}>
          <Ionicons name="moon" size={20} color="#b0b0b0" />
          <Text style={styles.themeText}>Modo nocturno</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.logout}>
          <Ionicons name="log-out-outline" size={20} color="#b0b0b0" />
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 240,
    backgroundColor: '#1a2a40',
    paddingVertical: 24,
    paddingHorizontal: 16,
    height: '100%',
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    gap: 8,
  },
  logoText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
  },
  menu: {
    gap: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 12,
  },
  menuItemActive: {
    backgroundColor: '#4CAF50',
  },
  menuLabel: {
    color: '#b0b0b0',
    fontSize: 14,
    fontWeight: '500',
  },
  menuLabelActive: {
    color: '#fff',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#374a5f',
    paddingTop: 16,
    gap: 12,
  },
  themeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  themeText: {
    color: '#b0b0b0',
    fontSize: 13,
  },
  logout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoutText: {
    color: '#b0b0b0',
    fontSize: 13,
  },
});
