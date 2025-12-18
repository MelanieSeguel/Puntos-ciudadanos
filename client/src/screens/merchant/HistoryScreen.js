import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../../components/common/ScreenHeader';
import EmptyState from '../../components/common/EmptyState';

export default function HistoryScreen() {
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState('all'); // all, today, week

  // Datos de ejemplo
  const mockTransactions = [
    {
      id: 1,
      customerName: 'Juan Pérez',
      points: 50,
      date: new Date().toISOString(),
      status: 'completed',
    },
    {
      id: 2,
      customerName: 'María García',
      points: 30,
      date: new Date(Date.now() - 86400000).toISOString(),
      status: 'completed',
    },
  ];

  useEffect(() => {
    // TODO: Conectar con /merchant/transactions
    setTransactions(mockTransactions);
  }, [filter]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const FilterButton = ({ label, value, active }) => (
    <TouchableOpacity 
      style={[styles.filterButton, active && styles.filterButtonActive]}
      onPress={() => setFilter(value)}
    >
      <Text style={[styles.filterText, active && styles.filterTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScreenHeader 
        title="Historial"
        subtitle="Validaciones realizadas"
        backgroundColor="#FF9800"
      />

      <View style={styles.filterContainer}>
        <FilterButton label="Todas" value="all" active={filter === 'all'} />
        <FilterButton label="Hoy" value="today" active={filter === 'today'} />
        <FilterButton label="Esta Semana" value="week" active={filter === 'week'} />
      </View>

      <ScrollView style={styles.content}>
        {transactions.length === 0 ? (
          <EmptyState 
            icon="📋"
            message="No hay transacciones"
          />
        ) : (
          transactions.map((transaction) => (
            <View key={transaction.id} style={styles.transactionCard}>
              <View style={styles.transactionHeader}>
                <View style={styles.transactionInfo}>
                  <Text style={styles.customerName}>{transaction.customerName}</Text>
                  <Text style={styles.transactionDate}>{formatDate(transaction.date)}</Text>
                </View>
                <View style={styles.pointsBadge}>
                  <Text style={styles.pointsText}>+{transaction.points}</Text>
                  <Text style={styles.pointsLabel}>pts</Text>
                </View>
              </View>
              <View style={styles.statusContainer}>
                <View style={styles.statusBadge}>
                  <Ionicons name="checkmark-circle" size={14} color="#4CAF50" />
                  <Text style={styles.statusText}>Completado</Text>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#FF9800',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
  },
  filterTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  transactionCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  transactionInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  transactionDate: {
    fontSize: 13,
    color: '#666',
  },
  pointsBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  pointsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  pointsLabel: {
    fontSize: 11,
    color: '#4CAF50',
  },
  statusContainer: {
    flexDirection: 'row',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#4CAF50',
    marginLeft: 4,
  },
});
