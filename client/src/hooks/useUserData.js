/**
 * Custom hooks con React Query para optimizar peticiones al backend
 * Elimina la necesidad de useEffect, useState y setInterval
 */

import { useQuery } from '@tanstack/react-query';
import { walletAPI, benefitsAPI, pointsAPI, missionsAPI } from '../services/api';

/**
 * Hook para obtener el balance y datos del usuario
 * staleTime: 5 minutos - Los datos del balance cambian con frecuencia
 */
export function useUserBalance() {
  return useQuery({
    queryKey: ['user', 'balance'],
    queryFn: async () => {
      const response = await walletAPI.getBalance();
      return response.data?.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
    retry: 2,
  });
}

/**
 * Hook para obtener las transacciones recientes
 * staleTime: 2 minutos - Las transacciones son dinámicas
 */
export function useRecentTransactions(limit = 5) {
  return useQuery({
    queryKey: ['transactions', 'recent', limit],
    queryFn: async () => {
      const response = await pointsAPI.getTransactions(limit, 0);
      return response.data?.data || [];
    },
    staleTime: 1000 * 60 * 2, // 2 minutos
    retry: 2,
  });
}

/**
 * Hook para obtener todas las transacciones (para historial completo)
 * staleTime: 2 minutos - Las transacciones son dinámicas
 */
export function useAllTransactions(limit = 100) {
  return useQuery({
    queryKey: ['transactions', 'all', limit],
    queryFn: async () => {
      const response = await pointsAPI.getTransactions(limit, 0);
      return response.data?.data || [];
    },
    staleTime: 1000 * 60 * 2, // 2 minutos
    retry: 2,
  });
}

/**
 * Hook para obtener misiones disponibles
 * staleTime: 10 minutos - Las misiones no cambian tan seguido
 */
export function useAvailableMissions(limit = null) {
  return useQuery({
    queryKey: ['missions', 'available', limit],
    queryFn: async () => {
      const response = await missionsAPI.getAvailable();
      const missions = response.data?.missions || response.data?.data || [];
      return limit ? missions.slice(0, limit) : missions;
    },
    staleTime: 1000 * 60 * 10, // 10 minutos
    retry: 2,
  });
}

/**
 * Hook para obtener beneficios disponibles
 * staleTime: 30 minutos - Los beneficios cambian poco frecuentemente
 */
export function useAvailableBenefits(limit = null) {
  return useQuery({
    queryKey: ['benefits', 'available', limit],
    queryFn: async () => {
      const response = await benefitsAPI.getAll();
      const benefits = response.data?.data || [];
      return limit ? benefits.slice(0, limit) : benefits;
    },
    staleTime: 1000 * 60 * 30, // 30 minutos - Los beneficios raramente cambian
    cacheTime: 1000 * 60 * 60, // 1 hora en caché
    retry: 2,
  });
}

/**
 * Hook para obtener una misión específica
 */
export function useMission(missionId) {
  return useQuery({
    queryKey: ['mission', missionId],
    queryFn: async () => {
      const response = await missionsAPI.getById(missionId);
      return response.data?.data;
    },
    enabled: !!missionId, // Solo ejecutar si hay ID
    staleTime: 1000 * 60 * 10,
    retry: 2,
  });
}

/**
 * Hook para obtener un beneficio específico
 */
export function useBenefit(benefitId) {
  return useQuery({
    queryKey: ['benefit', benefitId],
    queryFn: async () => {
      const response = await benefitsAPI.getById(benefitId);
      return response.data?.data;
    },
    enabled: !!benefitId,
    staleTime: 1000 * 60 * 30,
    retry: 2,
  });
}
