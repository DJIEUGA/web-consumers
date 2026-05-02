/**
 * Collaboration Endpoints
 * Centralized API paths for collaboration spaces and messaging
 */

export const COLLABORATION_ENDPOINTS = {
  // Base resource
  BASE: '/collaborations/spaces',

  // Queries
  MY_SPACES: '/collaborations/spaces/me',
  SPACE_DETAIL: (id: string) => `/collaborations/spaces/${id}`,
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
} as const;
