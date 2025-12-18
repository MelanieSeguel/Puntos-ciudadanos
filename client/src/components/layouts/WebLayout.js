import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import Sidebar from './Sidebar';
import StatsPanel from './StatsPanel';

/**
 * Layout responsivo para web (sidebar + contenido + stats panel)
 */
export default function WebLayout({ children, activeRoute = 'Home', onNavigate = () => {} }) {
  return (
    <View style={styles.container}>
      {/* Sidebar */}
      <Sidebar activeRoute={activeRoute} onNavigate={onNavigate} />

      {/* Main Content */}
      <ScrollView style={styles.mainContent}>
        <View style={styles.contentPadding}>
          {children}
        </View>
      </ScrollView>

      {/* Stats Panel */}
      <StatsPanel />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentPadding: {
    padding: 32,
    paddingTop: 24,
  },
});
