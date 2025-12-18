import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import ScreenHeader from '../../components/common/ScreenHeader';
import MenuItem from '../../components/common/MenuItem';

export default function ProfileScreen() {
  const { authState, logout } = useContext(AuthContext);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <ScrollView style={styles.container}>
      <ScreenHeader 
        title={authState.user?.nombre || 'Usuario'}
        subtitle={authState.user?.email}
        backgroundColor="#4CAF50"
      />

      <View style={styles.avatarSection}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person" size={40} color="#4CAF50" />
        </View>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{authState.role?.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mi Cuenta</Text>
          
          <MenuItem
            icon="person-outline"
            title="Editar Perfil"
            onPress={() => {}}
          />
          <MenuItem
            icon="notifications-outline"
            title="Notificaciones"
            onPress={() => {}}
          />
          <MenuItem
            icon="lock-closed-outline"
            title="Privacidad"
            onPress={() => {}}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Soporte</Text>
          
          <MenuItem
            icon="help-circle-outline"
            title="Ayuda"
            onPress={() => {}}
          />
          <MenuItem
            icon="document-text-outline"
            title="Términos y Condiciones"
            onPress={() => {}}
          />
        </View>

        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color="#fff" style={styles.logoutIcon} />
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  avatarSection: {
    backgroundColor: '#4CAF50',
    paddingBottom: 30,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  roleBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 15,
  },
  roleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 20,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    padding: 15,
    backgroundColor: '#f9f9f9',
  },
  logoutButton: {
    backgroundColor: '#f44336',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
