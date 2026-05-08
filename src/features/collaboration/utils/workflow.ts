import type { CollaborationStatus } from "@/features/collaboration/services/collaborationApi";
import type { CollaborationDecisionState, UiMessage, BackendStatusToStepMap } from "@/features/collaboration/types/workflow";

const TIME_LOCALE = "fr-FR";

export const BACKEND_STATUS_TO_STEP: BackendStatusToStepMap = {
  PENDING: 1,
  REQUEST_INFO: 1,
  ACCEPTED: 2,
  REJECTED: 1,
  MATCH_CONFIRMED: 2,
  ACTIVE: 6,
  BRIEF: 3,
  CONTRACT: 4,
  PAYMENT: 5,
  DELIVERABLE: 7,
  PAYMENT_RELEASED: 8,
  CLOSED: 9,
  COMPLETED: 9,
  CANCELLED: 1,
};

export const MESSAGE_BLOCKED_STATUSES: CollaborationStatus[] = [
  "REJECTED",
  "CANCELLED",
  "CLOSED",
  "COMPLETED",
];

export const isUuidLike = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );

export const clampStep = (step: number) => Math.min(9, Math.max(0, Math.floor(step)));

export const buildRoomId = (customerId: string, proId: string) =>
  `room:${String(customerId || "").trim()}::${String(proId || "").trim()}`;

export const parseRoomPair = (roomId: string) => {
  const matched = roomId.match(/^room:(.+)::(.+)$/);
  if (!matched) return null;
  return {
    customerId: String(matched[1] || "").trim(),
    proId: String(matched[2] || "").trim(),
  };
};

export const getStorageKey = (prefix: string, roomId: string) => `${prefix}${roomId}`;

export const isMessageBlockedByStatus = (status?: CollaborationStatus) =>
  Boolean(status && MESSAGE_BLOCKED_STATUSES.includes(status));

export const formatMessageTime = (dateInput?: string | number) =>
  new Date(dateInput || Date.now()).toLocaleTimeString(TIME_LOCALE, {
    hour: "2-digit",
    minute: "2-digit",
  });

export const formatDateHeader = (dateStr?: string) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const msgDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  if (msgDate.getTime() === today.getTime()) return "Aujourd'hui";
  if (msgDate.getTime() === yesterday.getTime()) return "Hier";

  return d.toLocaleDateString(TIME_LOCALE, {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

export const createUiMessage = ({
  id,
  sender,
  text,
  dateInput,
}: {
  id: string;
  sender: UiMessage["sender"];
  text: string;
  dateInput?: string | number;
}): UiMessage => {
  const d = new Date(dateInput || Date.now());
  return {
    id,
    sender,
    text,
    time: formatMessageTime(d.getTime()),
    date: d.toISOString().split("T")[0],
  };
};

export const getProfilePayload = (profile: unknown): Record<string, any> => {
  if (!profile || typeof profile !== "object") return {};

  const firstLevel = (profile as Record<string, any>).data;
  if (firstLevel && typeof firstLevel === "object") {
    const secondLevel = (firstLevel as Record<string, any>).data;
    if (secondLevel && typeof secondLevel === "object") {
      return secondLevel as Record<string, any>;
    }
    return firstLevel as Record<string, any>;
  }

  return profile as Record<string, any>;
};

export const parseStoredDecisionState = (
  value: unknown,
): CollaborationDecisionState => {
  if (
    value === "pending" ||
    value === "accepted" ||
    value === "more_info" ||
    value === "declined"
  ) {
    return value;
  }
  return "pending";
};
