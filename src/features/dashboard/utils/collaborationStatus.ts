import type { CollaborationDto } from "../../../api/dashboardEndpoints";

type CanonicalBackendStatus =
  | "PENDING"
  | "ACCEPTED"
  | "ACTIVE"
  | "COMPLETED"
  | "CANCELLED"
  | "REJECTED"
  | "UNKNOWN";

type StatusMeta = {
  label: string;
  color: string;
};

const STATUS_META: Record<CanonicalBackendStatus, StatusMeta> = {
  PENDING: { label: "En attente", color: "#ffc107" },
  ACCEPTED: { label: "Acceptee", color: "#3DC7C9" },
  ACTIVE: { label: "En cours", color: "#3DC7C9" },
  COMPLETED: { label: "Terminee", color: "#28a745" },
  CANCELLED: { label: "Annulee", color: "#6b7280" },
  REJECTED: { label: "Refusee", color: "#ef4444" },
  UNKNOWN: { label: "Inconnu", color: "#64748b" },
};

const LEGACY_TO_BACKEND: Record<string, CanonicalBackendStatus> = {
  actif: "ACTIVE",
  active: "ACTIVE",
  en_cours: "ACTIVE",
  pending: "PENDING",
  en_attente: "PENDING",
  accepted: "ACCEPTED",
  complete: "COMPLETED",
  completed: "COMPLETED",
  termine: "COMPLETED",
  terminee: "COMPLETED",
  cancelled: "CANCELLED",
  canceled: "CANCELLED",
  annule: "CANCELLED",
  annulee: "CANCELLED",
  rejected: "REJECTED",
  refuse: "REJECTED",
  refusee: "REJECTED",
  inactif: "CANCELLED",
  pause: "CANCELLED",
};

export const resolveCollaborationBackendStatus = (
  backendStatus?: string,
  statut?: string,
): CanonicalBackendStatus => {
  const normalizedBackend = String(backendStatus || "").trim().toUpperCase();
  if (normalizedBackend in STATUS_META) {
    return normalizedBackend as CanonicalBackendStatus;
  }

  const normalizedLegacy = String(statut || "").trim().toLowerCase();
  return LEGACY_TO_BACKEND[normalizedLegacy] || "UNKNOWN";
};

export const mapBackendStatusToUiStatut = (
  backendStatus?: string,
): CollaborationDto["statut"] => {
  const normalized = resolveCollaborationBackendStatus(backendStatus);
  if (normalized === "PENDING") return "en_attente";
  if (normalized === "ACTIVE" || normalized === "ACCEPTED") return "actif";
  return "inactif";
};

export const getCollaborationStatusMeta = (input: {
  backendStatus?: string;
  statut?: string;
}): StatusMeta => {
  const resolved = resolveCollaborationBackendStatus(
    input.backendStatus,
    input.statut,
  );
  return STATUS_META[resolved] || STATUS_META.UNKNOWN;
};

export const isCollaborationActive = (input: {
  backendStatus?: string;
  statut?: string;
}) => {
  const resolved = resolveCollaborationBackendStatus(
    input.backendStatus,
    input.statut,
  );
  return resolved === "ACTIVE" || resolved === "ACCEPTED";
};

export const isCollaborationPending = (input: {
  backendStatus?: string;
  statut?: string;
}) => resolveCollaborationBackendStatus(input.backendStatus, input.statut) === "PENDING";

export const isCollaborationCompleted = (input: {
  backendStatus?: string;
  statut?: string;
}) =>
  resolveCollaborationBackendStatus(input.backendStatus, input.statut) === "COMPLETED";
