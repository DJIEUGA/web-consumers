/**
 * Collaboration Endpoints
 * Centralized API paths for collaboration spaces and messaging
 */

export const COLLABORATION_ENDPOINTS = {
  // Base resource
  BASE: '/collaborations/spaces',

  // Collaboration brief resource
  BRIEF: (id: string) => `/collaborations/${id}/brief`,
  BRIEF_SUBMIT: (id: string) => `/collaborations/${id}/brief/submit`,
  BRIEF_ACKNOWLEDGE: (id: string) => `/collaborations/${id}/brief/acknowledge`,
  BRIEF_FILES: (id: string) => `/collaborations/${id}/brief/files`,
  BRIEF_FILE: (id: string, fileId: string) => `/collaborations/${id}/brief/files/${fileId}`,

  // Queries
  MY_SPACES: '/collaborations/spaces/me',
  SPACE_DETAIL: (id: string) => `/collaborations/${id}`,
  MESSAGES: (spaceId: string) => `/collaborations/spaces/${spaceId}/messages`,
  
  // Creation/Opening
  CREATE_SPACE: '/collaborations/spaces',
  OPEN_SPACE: '/collaborations/spaces/open',
  
  // Messaging
  SEND_MESSAGE: (spaceId: string) => `/collaborations/spaces/${spaceId}/messages`,

  // Lifecycle Actions
  ACCEPT: (id: string) => `/collaborations/spaces/${id}/accept`,
  REJECT: (id: string) => `/collaborations/spaces/${id}/reject`,
  DECISION: (id: string) => `/collaborations/spaces/${id}/decision`,
  SUBMIT_BRIEF: (id: string) => `/collaborations/spaces/${id}/submit-brief`,
  SIGN_CONTRACT: (id: string) => `/collaborations/spaces/${id}/sign-contract`,
  CONFIRM_PAYMENT: (id: string) => `/collaborations/spaces/${id}/confirm-payment`,
  START_COLLABORATION: (id: string) => `/collaborations/spaces/${id}/start-collaboration`,
  SUBMIT_DELIVERABLE: (id: string) => `/collaborations/spaces/${id}/submit-deliverable`,
  RELEASE_PAYMENT: (id: string) => `/collaborations/spaces/${id}/release-payment`,
  CLOSE: (id: string) => `/collaborations/spaces/${id}/close`,
  LIFECYCLE_ACTION: (id: string) => `/collaborations/spaces/${id}/lifecycle`,

  // Contract
  CONTRACT: (id: string) => `/collaborations/${id}/contract`,
  CONTRACT_PDF: (id: string) => `/collaborations/${id}/contract/pdf`,

  // Etapes / Milestones
  ETAPES: (id: string) => `/collaborations/${id}/etapes`,
  ETAPE: (id: string, etapeId: string) => `/collaborations/${id}/etapes/${etapeId}`,
  ETAPE_STATUS: (id: string, etapeId: string) => `/collaborations/${id}/etapes/${etapeId}/status`,
  ETAPES_REORDER: (id: string) => `/collaborations/${id}/etapes/reorder`,
  ETAPES_CONFIRM_PLAN: (id: string) => `/collaborations/${id}/etapes/confirm-plan`,

  // Deliverables (per etape)
  ETAPE_DELIVERABLES: (id: string, etapeId: string) => `/collaborations/${id}/etapes/${etapeId}/deliverables`,

  // Payment summary
  PAYMENT_SUMMARY: (id: string) => `/collaborations/${id}/payment/summary`,

  // Dispute (collaboration-side trigger)
  TRIGGER_DISPUTE: (id: string) => `/collaborations/spaces/${id}/dispute`,
  DISPUTE_DETAIL: (id: string) => `/collaborations/${id}/dispute`,

  // FCM push notification token management
  FCM_REGISTER: '/notifications/fcm/register',
  FCM_DEREGISTER: (token: string) => `/notifications/fcm/register/${encodeURIComponent(token)}`,
} as const;
