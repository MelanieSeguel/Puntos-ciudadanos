import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import ScreenHeader from '../../components/common/ScreenHeader';
import EmptyState from '../../components/common/EmptyState';
import InfoBox from '../../components/common/InfoBox';

export default function BenefitsScreen() {
  return (
    <ScrollView style={styles.container}>
      <ScreenHeader 
        title="Beneficios Disponibles"
        subtitle="Canjea tus puntos por beneficios"
        backgroundColor="#4CAF50"
      />

      <View style={styles.content}>
        <EmptyState 
          icon="🎁"
          message="Aquí se mostrarán los beneficios disponibles"
        />
        
        <InfoBox
          icon="information-circle-outline"
          message="Conecta con el endpoint /benefits para mostrar beneficios reales"
          backgroundColor="#E8F5E9"
          textColor="#2E7D32"
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
});
