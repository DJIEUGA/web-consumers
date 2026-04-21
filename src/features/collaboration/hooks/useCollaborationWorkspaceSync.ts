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
  resolvedSpaceId: string;
  currentUserId: string;
  navigate: NavigateFunction;
  mySpacesData?: CollaborationSpaceResponse[];
  mySpacesIsError: boolean;
  backendSpace: CollaborationSpaceResponse | null;
  setBackendSpace: React.Dispatch<React.SetStateAction<CollaborationSpaceResponse | null>>;
  messages: UiMessage[];
  setMessages: React.Dispatch<React.SetStateAction<UiMessage[]>>;
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
  resolvedSpaceId,
  currentUserId,
  navigate,
  mySpacesData,
  mySpacesIsError,
  backendSpace,
  setBackendSpace,
  messages,
  setMessages,
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
    resolvedSpaceId || undefined,
    {
      refetchInterval: resolvedSpaceId ? 5000 : undefined,
      refetchOnWindowFocus: true,
    },
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
    if (!resolvedSpaceId) return;
    if (spaceMessagesQuery.isError) return;
    if (Array.isArray(spaceMessagesQuery.data)) {
      const serverMessages = spaceMessagesQuery.data.map(mapBackendMessageToUi);
      const uniqueServerMessages = serverMessages.filter(
        (msg, index, arr) => arr.findIndex((candidate) => candidate.id === msg.id) === index,
      );

      setMessages((prev) => {
        const optimisticMessages = prev.filter((msg) => String(msg.id).startsWith("optimistic:"));
        if (optimisticMessages.length === 0) {
          return uniqueServerMessages;
        }

        const pendingOptimistic = optimisticMessages.filter(
          (optimistic) =>
            !uniqueServerMessages.some(
              (server) =>
                server.sender === optimistic.sender &&
                server.text.trim() === optimistic.text.trim(),
            ),
        );

        return [...uniqueServerMessages, ...pendingOptimistic];
      });
    }
  }, [
    resolvedSpaceId,
    mapBackendMessageToUi,
    setMessages,
    spaceMessagesQuery.data,
    spaceMessagesQuery.isError,
  ]);

  useEffect(() => {
    if (backendSpace || resolvedSpaceId) return;

    const storageKey = getStorageKey(COLLAB_STORAGE_PREFIX, collaborationRoomId);

    try {
      const storedRaw = localStorage.getItem(storageKey);
      if (!storedRaw) {
        setMessages([]);
        setCurrentStep(0);
        return;
      }

      const stored = JSON.parse(storedRaw);
      if (Array.isArray(stored.messages)) {
        setMessages(stored.messages);
      } else {
        setMessages([]);
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
      setMessages([]);
      setCurrentStep(0);
      setDecisionState("pending");
      setLifecycleEvents([]);
    }
  }, [
    backendSpace,
    resolvedSpaceId,
    collaborationRoomId,
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
