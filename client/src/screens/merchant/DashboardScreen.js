import React, { useContext, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import ScreenHeader from '../../components/common/ScreenHeader';
import StatCard from '../../components/common/StatCard';
import MenuItem from '../../components/common/MenuItem';
import InfoBox from '../../components/common/InfoBox';

export default function DashboardScreen() {
  const { authState } = useContext(AuthContext);
  const [stats] = useState({
    validationsToday: 0,
    totalPoints: 0,
    activeCustomers: 0,
  });

  return (
    <ScrollView style={styles.container}>
      <ScreenHeader 
        title="Dashboard Comercio"
        subtitle={`Bienvenido, ${authState.user?.nombre}`}
        backgroundColor="#FF9800"
      />

      <View style={styles.content}>
        <View style={styles.statsContainer}>
          <StatCard
            icon="checkmark-circle-outline"
            value={stats.validationsToday}
            label="Validaciones Hoy"
            iconColor="#FF9800"
          />
          <StatCard
            icon="star-outline"
            value={stats.totalPoints}
            label="Puntos Otorgados"
            iconColor="#FF9800"
          />
          <StatCard
            icon="people-outline"
            value={stats.activeCustomers}
            label="Clientes Activos"
            iconColor="#FF9800"
          />
        </View>

        <MenuItem
          icon="qr-code-outline"
          title="Validar QR"
          subtitle="Escanear código del cliente"
          onPress={() => {}}
        />
        <MenuItem
          icon="bar-chart-outline"
          title="Ver Historial"
          subtitle="Transacciones recientes"
          onPress={() => {}}
        />

        <InfoBox
          icon="information-circle-outline"
          message="Conecta con /merchant/stats para obtener estadísticas reales"
          backgroundColor="#FFF3E0"
          textColor="#E65100"
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
    flexWrap: 'wrap',
  },
});
