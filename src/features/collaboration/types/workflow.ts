import type { CollaborationStatus } from "@/features/collaboration/services/collaborationApi";

export type CollaborationActor = "customer" | "pro" | "other";

export type CollaborationStage =
  | "CONTACT"
  | "DECISION"
  | "MATCH"
  | "BRIEF"
  | "CONTRACT"
  | "PAYMENT"
  | "EXECUTION"
  | "DELIVERY"
  | "RELEASE"
  | "CLOSURE";

export type CollaborationAction =
  | "propose"
  | "accept"
  | "request_info"
  | "decline"
  | "open_brief";

export type CollaborationDecisionState =
  | "pending"
  | "accepted"
  | "more_info"
  | "declined";

export type CollaborationEventType =
  | "CONTACT_MESSAGE_SENT"
  | "COLLABORATION_PROPOSED"
  | "PRO_ACCEPTED_COLLABORATION"
  | "PRO_REQUESTED_MORE_INFO"
  | "PRO_DECLINED_COLLABORATION"
  | "STEP_CHANGED"
  | "BRIEF_OPENED";

export type CollaborationLifecycleEvent = {
  id: string;
  type: CollaborationEventType;
  actor: CollaborationActor;
  stage: CollaborationStage;
  roomId: string;
  createdAt: string;
  payload?: Record<string, unknown>;
};

export type UiMessage = {
  id: string;
  sender: "porteur" | "freelance";
  text: string;
  time: string;
  date: string;
  deliveryStatus?: "sending" | "failed";
};

export type BriefState = {
  objectif: string;
  livrables: string[];
  delai: string;
  budget: string;
  fichiers: unknown[];
  commentairePro: string;
};

export type EtapeStatut =
  | "a_venir"
  | "en_cours"
  | "livree"
  | "validee"
  | "modification";

export type ProjectEtape = {
  id: number;
  titre: string;
  statut: EtapeStatut;
  montant: number;
  progression: number;
};

export type ContratAccepteState = {
  porteur: boolean;
  freelance: boolean;
};

export type AvisState = {
  note: number;
  commentaire: string;
  recommande: boolean | null;
};

export type StepToStageMap = Record<number, CollaborationStage>;

export type StageActionRules = Partial<
  Record<
    CollaborationStage,
    Partial<Record<CollaborationAction, CollaborationActor[]>>
  >
>;

export type BackendStatusToStepMap = Record<CollaborationStatus, number>;
