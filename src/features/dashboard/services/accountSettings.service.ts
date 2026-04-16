import apiClient from "@/api/axios";
import {
  ACCOUNT_SETTINGS_ENDPOINTS,
  type AccountSettingsDto,
  type AccountSettingsEnvelope,
  type AccountSettingsPayload,
} from "@/api/accountSettingsEndpoints";

const toEnvelope = (value: unknown): AccountSettingsEnvelope => {
  if (value && typeof value === "object") {
    const asEnvelope = value as AccountSettingsEnvelope;

    if (typeof asEnvelope.success === "boolean" && "data" in asEnvelope) {
      return asEnvelope;
    }

    const nested = (value as { data?: AccountSettingsEnvelope }).data;
    if (nested && typeof nested.success === "boolean" && "data" in nested) {
      return nested;
    }
  }

  throw new Error("Invalid account settings response envelope");
};

export const fetchAccountSettings = async (): Promise<AccountSettingsEnvelope> => {
  const response = await apiClient.get(ACCOUNT_SETTINGS_ENDPOINTS.SETTINGS);
  return toEnvelope(response);
};

export const updateAccountSettings = async (
  payload: AccountSettingsPayload,
): Promise<AccountSettingsEnvelope> => {
  const response = await apiClient.patch(ACCOUNT_SETTINGS_ENDPOINTS.SETTINGS, payload);
  return toEnvelope(response);
};
