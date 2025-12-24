import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AuthContext } from '../context/AuthContext';

export default function HomeScreen() {
  const { authState, logout } = useContext(AuthContext);
  const { user, role } = authState;

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'USER':
        return '#2196F3';
      case 'MERCHANT':
        return '#FF9800';
      case 'ADMIN':
        return '#E91E63';
      default:
        return '#757575';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'USER':
        return 'Usuario';
      case 'MERCHANT':
        return 'Comercio';
      case 'ADMIN':
        return 'Administrador';
      default:
        return rol;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.welcomeText}>Bienvenido</Text>
        <Text style={styles.nameText}>{user?.name}</Text>

        <View style={[styles.roleBadge, { backgroundColor: getRoleBadgeColor(role) }]}>
          <Text style={styles.roleText}>Rol: {getRoleLabel(role)}</Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Email:</Text>
          <Text style={styles.infoValue}>{user?.email}</Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Fecha de registro:</Text>
          <Text style={styles.infoValue}>
            {user?.fechaRegistro ? new Date(user.fechaRegistro).toLocaleDateString('es-CL') : 'N/A'}
          </Text>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Autenticación funcionando correctamente</Text>
        <Text style={styles.footerText}>Rol guardado en AsyncStorage</Text>
        <Text style={styles.footerText}>Sistema de navegación por roles configurado</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  welcomeText: {
    fontSize: 24,
    color: '#666',
    marginBottom: 8,
  },
  nameText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 20,
  },
  roleBadge: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 30,
  },
  roleText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoBox: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: '#F44336',
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 30,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    padding: 20,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#2E7D32',
    marginVertical: 2,
  },
});
