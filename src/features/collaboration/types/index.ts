/**
 * Collaboration types
 * Single source of truth for collaboration API payloads and UI summaries.
 */

export type CollaborationStatus =
  | 'PENDING'
  | 'REQUEST_INFO'
  | 'ACCEPTED'
  | 'MATCH_CONFIRMED'
  | 'BRIEF'
  | 'CONTRACT'
  | 'PAYMENT'
  | 'REJECTED'
  | 'ACTIVE'
  | 'DELIVERABLE'
  | 'PAYMENT_RELEASED'
  | 'CLOSED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'BRIEFING'
  | 'CONTRACTING'
  | 'PAYMENT_PENDING'
  | 'IN_PROGRESS'
  | 'DELIVERED'
  | 'DISPUTED';

export type LifecycleTimelineItem = {
  index: number;
  key: string;
  label: string;
  state: string;
};

export type UiHints = {
  messageEnabled?: boolean;
  reviewAllowed?: boolean;
  canCustomerSubmitBrief?: boolean;
  canProDecide?: boolean;
  nextRecommendedAction?: string;
};

export type PersonSummary = {
  userId?: string;
  email?: string;
  role?: string;
  verified?: boolean;
  country?: string;
  city?: string;
  phoneNumber?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  hourlyRate?: number | null;
  specialization?: string | null;
  experienceYears?: number | null;
  sector?: string | null;
  skills?: string[] | null;
  reputationScore?: number | null;
  reviewCount?: number | null;
  averageRating?: number | null;
  isPremium?: boolean | null;
  walletBalance?: number | null;
  kycStatus?: string | null;
  isAvailable?: boolean | null;
  coverImageUrl?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  displayName?: string | null;
  fullName?: string | null;
};

export type CollaborationCardSummary = {
  id: string | number;
  nom: string;
  avatarUrl?: string;
  photo?: string;
  poste?: string;
  specialization?: string;
  entreprise?: string;
  location?: string;
  specialite?: string;
  tarifHoraire?: number | null;
  note?: number;
  avis?: number;
  projetsRealises?: number;
  tauxReponse?: string;
  delaiReponse?: string;
  competences?: string[];
  verified?: boolean;
  anciennete?: string;
  collaborationsEnCours?: number;
};

export type CollaborationDetailResponse = {
  id?: string;
  customerId?: string;
  proId?: string;
  customerName?: string;
  proName?: string;
  customerDetails?: CollaborationCardSummary;
  proDetails?: CollaborationCardSummary;
  viewerRole?: string;
  title?: string;
  brief?: string | null;
  status?: CollaborationStatus;
  phase?: string;
  lifecycleStep?: string;
  lifecycleStepLabel?: string;
  lifecycleTimeline?: LifecycleTimelineItem[];
  allowedActions?: string[];
  alreadyReviewed?: boolean;
  uiHints?: UiHints;
};

export type PreCollaborationDetailResponse = {
  id?: string;
  customerId?: string;
  proId?: string;
  viewerRole?: string;
  title?: string;
  brief?: string | null;
  status?: 'PENDING' | 'REQUEST_INFO' | 'ACCEPTED' | 'REJECTED';
  createdAt?: string;
  updatedAt?: string;
  allowedActions?: string[];
  nextRecommendedAction?: string;
  uiHints?: UiHints;
};

export type CollaborationDetailEnvelope = {
  collaborationDetail?: CollaborationDetailResponse | null;
  preCollaborationDetail?: PreCollaborationDetailResponse | null;
};

export type CollaborationSpaceResponse = {
  id: string;
  title: string;
  brief: string | null;
  status: CollaborationStatus;
  viewerRole?: string;
  phase?: string;
  lifecycleStep?: string;
  lifecycleStepLabel?: string;
  lifecycleTimeline?: LifecycleTimelineItem[];
  allowedActions?: string[];
  alreadyReviewed?: boolean;
  uiHints?: UiHints;
  customerDetails?: CollaborationCardSummary;
  proDetails?: CollaborationCardSummary;
  createdAt?: string;
  updatedAt?: string;
};

export type MessageDTO = {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  content: string;
  sentAt: string;
};

export type CollaborationSpace = CollaborationSpaceResponse;
export type Message = MessageDTO;

export type CreateSpaceParams = {
  proId?: string;
  title?: string;
  brief?: string;
  topic?: string;
  professionalId?: string;
  initialMessage?: string;
};

export type OpenSpaceParams = {
  proId?: string;
  professionalId?: string;
  title?: string;
};

export type SendMessageParams = {
  content: string;
};

export type SubmitDeliverableParams = {
  deliverableUrl?: string;
  notes?: string;
};

export type LifecycleActionParams = {
  action: string;
  payload?: any;
}

