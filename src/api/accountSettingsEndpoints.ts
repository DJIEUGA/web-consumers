import type { ApiEnvelope } from "../types/api";

export const ACCOUNT_SETTINGS_ENDPOINTS = {
  SETTINGS: "/account/settings",
} as const;

export type PreferredLanguageCode = "FRE" | "ENG" | string;

export interface AccountSettingsPayload {
  emailNotificationsEnabled: boolean;
  collaborationAlertsEnabled: boolean;
  newFeaturesEnabled: boolean;
  financialTransactionsEnabled: boolean;
  messagesEnabled: boolean;
  reviewsEnabled: boolean;
  kycVerificationEnabled: boolean;
  accountActivationEnabled: boolean;
  accountReportEnabled: boolean;
  showPositionOnPublicProfile: boolean;
  appearInLocationSearch: boolean;
  showSpecializationTags: boolean;
  preferredLanguage: PreferredLanguageCode;
}

export interface AccountSettingsUserDto {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  gender?: string | null;
  username?: string | null;
  email?: string | null;
  role?: string;
  createdAt?: string;
  verified?: boolean;
}

export interface AccountSettingsDto extends AccountSettingsPayload {
  userId: string;
  user?: AccountSettingsUserDto;
}

export type AccountSettingsEnvelope = ApiEnvelope<AccountSettingsDto>;
