/**
 * SubmissionsApprovalScreen - Bandeja de Aprobaciones
 * Pantalla crítica para administrador: revisar y aprobar/rechazar envíos de usuarios
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ScreenWrapper from '../../layouts/ScreenWrapper';
import { COLORS, SPACING, TYPOGRAPHY, LAYOUT } from '../../theme/theme';

export default function SubmissionsApprovalScreen({ navigation }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('PENDING'); // PENDING, APPROVED, REJECTED

  useFocusEffect(
    useCallback(() => {
      loadSubmissions();
    }, [filter])
  );

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      // Por hacer: conectar a GET /api/v1/admin/submissions?status={filter}
      // const response = await adminAPI.getSubmissions(filter);
      // setSubmissions(response.data.data);
      
      // Datos iniciales para interfaz
      setSubmissions([
        {
          id: 'sub_001',
          userId: 'user_001',
          userName: 'María García',
          userAvatar: null,
          missionId: 'mission_001',
          missionName: 'Reciclaje de Plásticos',
          description: 'Reciclé 5kg de plástico en el punto de acopio municipal.',
          status: 'PENDING',
          attachments: 3,
          submittedAt: new Date(Date.now() - 2 * 60 * 60000),
          points: 50,
        },
        {
          id: 'sub_002',
          userId: 'user_002',
          userName: 'Juan López',
          userAvatar: null,
          missionId: 'mission_002',
          missionName: 'Plantación de Árboles',
          description: 'Planté 3 árboles en el parque comunitario.',
          status: 'PENDING',
          attachments: 2,
          submittedAt: new Date(Date.now() - 5 * 60 * 60000),
          points: 75,
        },
      ]);
    } catch (error) {
      console.error('Error loading submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSubmissions();
    setRefreshing(false);
  };

  const handleApprove = (submissionId) => {
    Alert.alert(
      'Aprobar Envío',
      '¿Estás seguro de que deseas aprobar este envío?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Aprobar',
          style: 'default',
          onPress: async () => {
            try {
              // Por hacer: conectar a POST /api/v1/admin/submissions/{id}/approve
              // await adminAPI.approveSubmission(submissionId);
              await new Promise(r => setTimeout(r, 800));
              
              setSubmissions(submissions.filter(s => s.id !== submissionId));
              alert('Envío aprobado y puntos otorgados');
            } catch (error) {
              alert('Error al aprobar: ' + error.message);
            }
          },
        },
      ]
    );
  };

  const handleReject = (submissionId) => {
    Alert.alert(
      'Rechazar Envío',
      '¿Por qué rechazas este envío?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Evidencia insuficiente',
          style: 'destructive',
          onPress: () => rejectSubmission(submissionId, 'INSUFFICIENT_EVIDENCE'),
        },
        {
          text: 'Incumplimiento de reglas',
          style: 'destructive',
          onPress: () => rejectSubmission(submissionId, 'RULE_VIOLATION'),
        },
      ]
    );
  };

  const rejectSubmission = async (submissionId, reason) => {
    try {
      // Por hacer: conectar a POST /api/v1/admin/submissions/{id}/reject
      // await adminAPI.rejectSubmission(submissionId, { reason });
      await new Promise(r => setTimeout(r, 800));
      
      setSubmissions(submissions.filter(s => s.id !== submissionId));
      alert('Envío rechazado');
    } catch (error) {
      alert('Error al rechazar: ' + error.message);
    }
  };

  const renderSubmissionCard = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate('SubmissionDetail', {
          submissionId: item.id,
          submission: item,
        })
      }
    >
      {/* Usuario */}
      <View style={styles.userSection}>
        <View style={styles.avatar}>
          {item.userAvatar ? (
            <Image source={{ uri: item.userAvatar }} style={styles.avatarImage} />
          ) : (
            <MaterialCommunityIcons name="account" size={24} color={COLORS.primary} />
          )}
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.userName}</Text>
          <Text style={styles.userEmail}>ID: {item.userId}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: '#fff3cd' }]}>
          <Text style={styles.badgeText}>Pendiente</Text>
        </View>
      </View>

      {/* Misión */}
      <View style={styles.missionSection}>
        <View style={styles.missionHeader}>
          <MaterialCommunityIcons name="target" size={20} color={COLORS.primary} />
          <View style={styles.missionDetails}>
            <Text style={styles.missionName}>{item.missionName}</Text>
            <Text style={styles.points}>+{item.points} puntos</Text>
          </View>
        </View>
      </View>

      {/* Descripción */}
      <View style={styles.descriptionSection}>
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
      </View>

      {/* Attachments */}
      <View style={styles.attachmentsInfo}>
        <MaterialCommunityIcons name="file-multiple" size={16} color={COLORS.gray} />
        <Text style={styles.attachmentsCount}>
          {item.attachments} archivo(s) adjuntado(s)
        </Text>
        <Text style={styles.submittedTime}>
          {Math.round((Date.now() - item.submittedAt) / 60000)} min atrás
        </Text>
      </View>

      {/* Acciones */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.rejectButton]}
          onPress={() => handleReject(item.id)}
        >
          <MaterialCommunityIcons name="close-circle" size={18} color={COLORS.danger} />
          <Text style={styles.rejectButtonText}>Rechazar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.approveButton]}
          onPress={() => handleApprove(item.id)}
        >
          <MaterialCommunityIcons name="check-circle" size={18} color={COLORS.white} />
          <Text style={styles.approveButtonText}>Aprobar</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <ScreenWrapper bgColor={COLORS.light} safeArea={false}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper bgColor={COLORS.light} safeArea={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Aprobaciones Pendientes</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeNumber}>{submissions.length}</Text>
        </View>
      </View>

      {/* Filtros */}
      <View style={styles.filters}>
        {['PENDING', 'APPROVED', 'REJECTED'].map(status => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterButton,
              filter === status && styles.filterButtonActive,
            ]}
            onPress={() => setFilter(status)}
          >
            <Text
              style={[
                styles.filterButtonText,
                filter === status && styles.filterButtonTextActive,
              ]}
            >
              {status === 'PENDING'
                ? 'Pendientes'
                : status === 'APPROVED'
                ? 'Aprobados'
                : 'Rechazados'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Lista */}
      <FlatList
        data={submissions}
        renderItem={renderSubmissionCard}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="inbox-multiple"
              size={48}
              color={COLORS.light}
            />
            <Text style={styles.emptyText}>No hay envíos pendientes</Text>
          </View>
        }
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    paddingTop: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light,
  },
  title: {
    fontSize: TYPOGRAPHY.h4,
    fontWeight: '700',
    color: COLORS.dark,
  },
  badge: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    minWidth: 40,
    alignItems: 'center',
  },
  badgeNumber: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.caption,
    fontWeight: '700',
  },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
    backgroundColor: COLORS.white,
  },
  filterButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: LAYOUT.borderRadius.md,
    borderWidth: 1,
    borderColor: COLORS.light,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterButtonText: {
    textAlign: 'center',
    fontSize: TYPOGRAPHY.caption,
    fontWeight: '600',
    color: COLORS.gray,
  },
  filterButtonTextActive: {
    color: COLORS.white,
  },
  listContent: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: LAYOUT.borderRadius.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...LAYOUT.shadowSmall,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: TYPOGRAPHY.body1,
    fontWeight: '600',
    color: COLORS.dark,
  },
  userEmail: {
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.gray,
    marginTop: SPACING.xs,
  },
  badgeText: {
    color: '#856404',
    fontSize: TYPOGRAPHY.caption,
    fontWeight: '600',
  },
  missionSection: {
    marginBottom: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light,
  },
  missionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  missionDetails: {
    flex: 1,
  },
  missionName: {
    fontSize: TYPOGRAPHY.body1,
    fontWeight: '600',
    color: COLORS.dark,
  },
  points: {
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.success,
    marginTop: SPACING.xs,
    fontWeight: '600',
  },
  descriptionSection: {
    marginBottom: SPACING.md,
  },
  description: {
    fontSize: TYPOGRAPHY.body2,
    color: COLORS.gray,
    lineHeight: 20,
  },
  attachmentsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light,
  },
  attachmentsCount: {
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.gray,
    flex: 1,
  },
  submittedTime: {
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.gray,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  actionButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: LAYOUT.borderRadius.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  approveButton: {
    backgroundColor: COLORS.success,
  },
  approveButtonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.caption,
    fontWeight: '600',
  },
  rejectButton: {
    borderWidth: 1,
    borderColor: COLORS.danger,
  },
  rejectButtonText: {
    color: COLORS.danger,
    fontSize: TYPOGRAPHY.caption,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.body2,
    color: COLORS.gray,
    marginTop: SPACING.md,
  },
});
