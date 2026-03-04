/**
 * Portfolio & Services Mutation Hooks
 * React Query mutations for Pro dashboard service offers and portfolio items
 * 
 * @pattern useMutation + cache invalidation
 * @role ROLE_PRO
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as portfolioService from '../services/portfolio.service';
import type {
  CreateServiceDto,
  UpdateServiceDto,
  CreatePortfolioDto,
} from '../../../api/profileEndpoints';
import { DASHBOARD_QUERY_KEYS } from './useDashboardData';

/* ========================================
 * SERVICE OFFERS MUTATIONS
 * ======================================== */

/**
 * Create new service offer
 */
export function useCreateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateServiceDto) => portfolioService.createService(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEYS.services });
      toast.success('Service créé avec succès!');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Erreur lors de la création du service';
      toast.error(message);
    },
  });
}

/**
 * Update existing service offer
 */
export function useUpdateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateServiceDto }) =>
      portfolioService.updateService(id, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEYS.services });
      toast.success('Service mis à jour avec succès!');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Erreur lors de la mise à jour du service';
      toast.error(message);
    },
  });
}

/**
 * Delete service offer
 */
export function useDeleteService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => portfolioService.deleteService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEYS.services });
      toast.success('Service supprimé avec succès!');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Erreur lors de la suppression du service';
      toast.error(message);
    },
  });
}

/* ========================================
 * PORTFOLIO MUTATIONS
 * ======================================== */

/**
 * Create new portfolio item
 */
export function useCreatePortfolio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePortfolioDto) => portfolioService.createPortfolio(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEYS.posts });
      toast.success('Réalisation ajoutée avec succès!');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || "Erreur lors de l'ajout de la réalisation";
      toast.error(message);
    },
  });
}

/**
 * Delete portfolio item
 */
export function useDeletePortfolio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => portfolioService.deletePortfolio(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEYS.posts });
      toast.success('Réalisation supprimée avec succès!');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Erreur lors de la suppression de la réalisation';
      toast.error(message);
    },
  });
}
