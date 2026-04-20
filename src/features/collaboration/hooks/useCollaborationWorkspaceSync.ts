import { useEffect } from "react";
import type React from "react";
import type { NavigateFunction } from "react-router-dom";
import type { CollaborationSpaceResponse } from "@/features/collaboration/services/collaborationApi";
import { useSpaceMessages } from "@/features/collaboration/hooks/useCollaboration";
import { COLLAB_STORAGE_PREFIX } from "@/features/collaboration/constants/workflow";
import {
  BACKEND_STATUS_TO_STEP,
  clampStep,
  getStorageKey,
  isMessageBlockedByStatus,
  isUuidLike,
  parseRoomPair,
  parseStoredDecisionState,
} from "@/features/collaboration/utils/workflow";
import type {
  CollaborationDecisionState,
  CollaborationLifecycleEvent,
  UiMessage,
} from "@/features/collaboration/types/workflow";

type BackendMessage = {
  id: string;
  senderId: string;
  content: string;
  sentAt?: string;
  createdAt?: string;
};

type UseCollaborationWorkspaceSyncParams = {
  incomingId: string;
  collaborationRoomId: string;
  currentUserId: string;
  navigate: NavigateFunction;
  mySpacesData?: CollaborationSpaceResponse[];
  mySpacesIsError: boolean;
  backendSpace: CollaborationSpaceResponse | null;
  setBackendSpace: React.Dispatch<React.SetStateAction<CollaborationSpaceResponse | null>>;
  messages: UiMessage[];
  setMessages: React.Dispatch<React.SetStateAction<UiMessage[]>>;
  defaultMessages: UiMessage[];
  currentStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  decisionState: CollaborationDecisionState;
  setDecisionState: React.Dispatch<React.SetStateAction<CollaborationDecisionState>>;
  lifecycleEvents: CollaborationLifecycleEvent[];
  setLifecycleEvents: React.Dispatch<React.SetStateAction<CollaborationLifecycleEvent[]>>;
  stepQueryParam: string | null;
  mapBackendMessageToUi: (msg: BackendMessage) => UiMessage;
  messagesEndRef: React.RefObject<HTMLDivElement>;
};

export const useCollaborationWorkspaceSync = ({
  incomingId,
  collaborationRoomId,
  currentUserId,
  navigate,
  mySpacesData,
  mySpacesIsError,
  backendSpace,
  setBackendSpace,
  messages,
  setMessages,
  defaultMessages,
  currentStep,
  setCurrentStep,
  decisionState,
  setDecisionState,
  lifecycleEvents,
  setLifecycleEvents,
  stepQueryParam,
  mapBackendMessageToUi,
  messagesEndRef,
}: UseCollaborationWorkspaceSyncParams) => {
  const spaceMessagesQuery = useSpaceMessages(
    backendSpace?.id && !isMessageBlockedByStatus(backendSpace.status)
      ? backendSpace.id
      : undefined,
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, messagesEndRef]);

  useEffect(() => {
    if (!incomingId) return;

    const expectedPath = `/collaboration/${encodeURIComponent(collaborationRoomId)}`;
    const currentPath = `/collaboration/${encodeURIComponent(incomingId)}`;
    if (collaborationRoomId !== incomingId && currentPath !== expectedPath) {
      navigate(expectedPath, { replace: true });
    }
  }, [collaborationRoomId, incomingId, navigate]);

  useEffect(() => {
    if (!currentUserId || !incomingId) return;
    if (mySpacesIsError) {
      setBackendSpace(null);
      return;
    }

    const spaces = mySpacesData || [];

    let matchedSpace: CollaborationSpaceResponse | undefined;

    if (isUuidLike(incomingId)) {
      matchedSpace = spaces.find((space) => space.id === incomingId);
    }

    if (!matchedSpace) {
      const pair = parseRoomPair(collaborationRoomId);
      if (pair) {
        matchedSpace = spaces.find(
          (space) =>
            space.customerId === pair.customerId && space.proId === pair.proId,
        );
      }
    }

    if (!matchedSpace && isUuidLike(incomingId)) {
      matchedSpace = spaces.find(
        (space) => space.proId === incomingId || space.customerId === incomingId,
      );
    }

    if (matchedSpace) {
      setBackendSpace(matchedSpace);
      setCurrentStep(BACKEND_STATUS_TO_STEP[matchedSpace.status] ?? 1);
      if (matchedSpace.status === "REJECTED") {
        setDecisionState("declined");
      }
    } else {
      setBackendSpace(null);
    }
  }, [
    collaborationRoomId,
    currentUserId,
    incomingId,
    mySpacesData,
    mySpacesIsError,
    setBackendSpace,
    setCurrentStep,
    setDecisionState,
  ]);

  useEffect(() => {
    if (!backendSpace?.id) return;
    if (spaceMessagesQuery.isError) return;
    if (Array.isArray(spaceMessagesQuery.data)) {
      setMessages(spaceMessagesQuery.data.map(mapBackendMessageToUi));
    }
  }, [
    backendSpace?.id,
    mapBackendMessageToUi,
    setMessages,
    spaceMessagesQuery.data,
    spaceMessagesQuery.isError,
  ]);

  useEffect(() => {
    if (backendSpace) return;

    const storageKey = getStorageKey(COLLAB_STORAGE_PREFIX, collaborationRoomId);

    try {
      const storedRaw = localStorage.getItem(storageKey);
      if (!storedRaw) {
        setMessages(defaultMessages);
        setCurrentStep(0);
        return;
      }

      const stored = JSON.parse(storedRaw);
      if (Array.isArray(stored.messages)) {
        setMessages(stored.messages);
      } else {
        setMessages(defaultMessages);
      }

      if (Number.isFinite(stored.currentStep)) {
        setCurrentStep(clampStep(Number(stored.currentStep)));
      } else {
        setCurrentStep(0);
      }

      setDecisionState(parseStoredDecisionState(stored.decisionState));

      if (Array.isArray(stored.lifecycleEvents)) {
        setLifecycleEvents(stored.lifecycleEvents);
      } else {
        setLifecycleEvents([]);
      }
    } catch {
      setMessages(defaultMessages);
      setCurrentStep(0);
      setDecisionState("pending");
      setLifecycleEvents([]);
    }
  }, [
    backendSpace,
    collaborationRoomId,
    defaultMessages,
    setCurrentStep,
    setDecisionState,
    setLifecycleEvents,
    setMessages,
  ]);

  useEffect(() => {
    const storageKey = getStorageKey(COLLAB_STORAGE_PREFIX, collaborationRoomId);
    const payload = {
      messages,
      currentStep,
      decisionState,
      lifecycleEvents,
      updatedAt: Date.now(),
      roomId: collaborationRoomId,
    };

    try {
      localStorage.setItem(storageKey, JSON.stringify(payload));
    } catch {
      // Ignore storage quota/availability issues silently.
    }
  }, [collaborationRoomId, currentStep, decisionState, lifecycleEvents, messages]);

  useEffect(() => {
    if (!stepQueryParam) return;

    const parsed = Number(stepQueryParam);
    if (!Number.isFinite(parsed)) return;

    const clampedStep = clampStep(parsed);
    setCurrentStep(clampedStep);
  }, [setCurrentStep, stepQueryParam]);

  return {
    spaceMessagesQuery,
  };
};
