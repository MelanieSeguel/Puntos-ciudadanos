import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import ScreenHeader from '../../components/common/ScreenHeader';
import StatCard from '../../components/common/StatCard';
import MenuItem from '../../components/common/MenuItem';
import InfoBox from '../../components/common/InfoBox';

export default function AdminDashboardScreen() {
  const { authState } = useContext(AuthContext);
  const [stats] = useState({
    totalUsers: 0,
    totalMerchants: 0,
    totalPoints: 0,
    totalTransactions: 0,
  });

  // Solo disponible en web
  if (Platform.OS !== 'web') {
    return (
      <View style={styles.container}>
        <View style={styles.mobileWarning}>
          <Ionicons name="warning-outline" size={64} color="#FF9800" />
          <Text style={styles.warningTitle}>Panel de Administración</Text>
          <Text style={styles.warningText}>
            El panel de administración solo está disponible en la versión web.
            Por favor, accede desde un navegador.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <ScreenHeader 
        title="Panel de Administración"
        subtitle="Sistema de Puntos Ciudadanos"
        backgroundColor="#2196F3"
      />

      <View style={styles.content}>
        <View style={styles.statsGrid}>
          <StatCard
            icon="people-outline"
            value={stats.totalUsers}
            label="Usuarios Totales"
            iconColor="#2196F3"
          />
          <StatCard
            icon="storefront-outline"
            value={stats.totalMerchants}
            label="Comercios Activos"
            iconColor="#2196F3"
          />
          <StatCard
            icon="star-outline"
            value={stats.totalPoints}
            label="Puntos en Circulación"
            iconColor="#2196F3"
          />
          <StatCard
            icon="bar-chart-outline"
            value={stats.totalTransactions}
            label="Transacciones"
            iconColor="#2196F3"
          />
        </View>

        <Text style={styles.sectionTitle}>Gestión del Sistema</Text>
        
        <View style={styles.menuGrid}>
          <MenuItem
            icon="person-outline"
            title="Usuarios"
            subtitle="Gestionar usuarios"
            onPress={() => {}}
          />
          <MenuItem
            icon="storefront-outline"
            title="Comercios"
            subtitle="Administrar comercios"
            onPress={() => {}}
          />
          <MenuItem
            icon="gift-outline"
            title="Beneficios"
            subtitle="Configurar beneficios"
            onPress={() => {}}
          />
          <MenuItem
            icon="stats-chart-outline"
            title="Reportes"
            subtitle="Análisis y estadísticas"
            onPress={() => {}}
          />
          <MenuItem
            icon="settings-outline"
            title="Configuración"
            subtitle="Sistema general"
            onPress={() => {}}
          />
          <MenuItem
            icon="notifications-outline"
            title="Notificaciones"
            subtitle="Enviar avisos"
            onPress={() => {}}
          />
        </View>

        <InfoBox
          icon="information-circle-outline"
          message="Panel de administración completo. Conecta con los endpoints del backend para funcionalidad completa."
          backgroundColor="#E3F2FD"
          textColor="#1565C0"
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  menuGrid: {
    marginBottom: 20,
  },
  mobileWarning: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  warningTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 15,
    textAlign: 'center',
  },
  warningText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
});
