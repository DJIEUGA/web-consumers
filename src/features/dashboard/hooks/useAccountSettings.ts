import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth.store";
import type {
  AccountSettingsPayload,
  AccountSettingsDto,
} from "@/api/accountSettingsEndpoints";
import * as accountSettingsService from "../services/accountSettings.service";

export const ACCOUNT_SETTINGS_QUERY_KEY = ["account", "settings"] as const;

const getErrorMessage = (error: any): string => {
  return (
    error?.data?.message ||
    error?.message ||
    "Impossible de mettre a jour les parametres du compte."
  );
};

export function useAccountSettings() {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ACCOUNT_SETTINGS_QUERY_KEY,
    queryFn: async (): Promise<AccountSettingsDto> => {
      const response = await accountSettingsService.fetchAccountSettings();
      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch account settings");
      }
      return response.data;
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpdateAccountSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AccountSettingsPayload) =>
      accountSettingsService.updateAccountSettings(payload),
    onSuccess: (response, payload) => {
      queryClient.setQueryData(
        ACCOUNT_SETTINGS_QUERY_KEY,
        (previous: AccountSettingsDto | undefined) => {
          if (response.data) {
            return response.data;
          }

          if (!previous) {
            return {
              ...payload,
              userId: "",
            } as AccountSettingsDto;
          }

          return {
            ...previous,
            ...payload,
          };
        }
      );
      toast.success(response.message || "Parametres du compte mis a jour.");
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });
}
