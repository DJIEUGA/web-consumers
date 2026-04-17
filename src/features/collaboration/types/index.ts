/**
 * Collaboration Entities and Request Types
 */

export type CollaborationStatus = 
  | 'PENDING'
  | 'ACCEPTED'
  | 'ACTIVE'
  | 'BRIEFING'
  | 'CONTRACTING'
  | 'PAYMENT_PENDING'
  | 'IN_PROGRESS'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'REJECTED'
  | 'CANCELLED';

// Representing a minimal generic space. Can be expanded matching backend responses
export interface CollaborationSpace {
  id: string;
  customerId?: string;
  proId?: string;
  title?: string;
  brief?: string;
  customerName?: string;
  proName?: string;
  status: CollaborationStatus;
  topic?: string;
  createdAt: string;
  updatedAt: string;
  // Participants, usually nested objects
  client?: any; 
  professional?: any;
}

export interface Message {
  id: string;
  spaceId: string;
  senderId: string;
  senderName?: string;
  senderRole?: string;
  content: string;
  sentAt?: string;
  createdAt: string;
}

// Request Data Transfer Objects
export interface CreateSpaceParams {
  proId?: string;
  title?: string;
  brief?: string;
  topic?: string;
  professionalId?: string;
  initialMessage?: string;
}

export interface OpenSpaceParams {
  proId?: string;
  professionalId?: string;
  title?: string;
  // Add other required parameters or topic
}

export interface SendMessageParams {
  content: string;
}

export interface SubmitDeliverableParams {
  deliverableUrl?: string; // Example payload parameter if required
  notes?: string;
}

export interface LifecycleActionParams {
  action: string;
  payload?: any;
}
