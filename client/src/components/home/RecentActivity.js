import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import EmptyState from '../common/EmptyState';

/**
 * Lista de actividad reciente
 * @param {array} transactions - Array de transacciones
 * @param {number} maxItems - Máximo número de items a mostrar
 */
export default function RecentActivity({ transactions = [], maxItems = 3 }) {
  const items = transactions.slice(0, maxItems);

  const getActivityIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'scan':
      case 'escaneo':
        return 'qr-code-outline';
      case 'redeem':
      case 'canje':
        return 'gift-outline';
      case 'transfer':
      case 'transferencia':
        return 'swap-horizontal-outline';
      default:
        return 'checkmark-circle-outline';
    }
  };

  const getActivityColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'scan':
      case 'escaneo':
        return '#4CAF50';
      case 'redeem':
      case 'canje':
        return '#FF9800';
      case 'transfer':
      case 'transferencia':
        return '#2196F3';
      default:
        return '#666';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Actividad Reciente</Text>
        <Ionicons name="arrow-forward" size={16} color="#2196F3" />
      </View>

      {items.length === 0 ? (
        <EmptyState 
          icon="📋"
          message="No hay actividad reciente"
        />
      ) : (
        <View style={styles.list}>
          {items.map((item, index) => (
            <View 
              key={index}
              style={[
                styles.item,
                index !== items.length - 1 && styles.itemWithBorder
              ]}
            >
              <View 
                style={[
                  styles.iconContainer,
                  { backgroundColor: getActivityColor(item.type) + '20' }
                ]}
              >
                <Ionicons 
                  name={getActivityIcon(item.type)} 
                  size={20} 
                  color={getActivityColor(item.type)} 
                />
              </View>

              <View style={styles.itemContent}>
                <Text style={styles.itemTitle}>{item.description || item.title}</Text>
                <Text style={styles.itemTime}>
                  {item.date ? new Date(item.date).toLocaleDateString('es-ES') : 'Hoy'}
                </Text>
              </View>

              <Text 
                style={[
                  styles.itemValue,
                  { color: item.points >= 0 ? '#4CAF50' : '#f44336' }
                ]}
              >
                {item.points >= 0 ? '+' : ''}{item.points}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  list: {
    gap: 0,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  itemWithBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  itemTime: {
    fontSize: 12,
    color: '#999',
  },
  itemValue: {
    fontSize: 14,
    fontWeight: '600',
  },
});
