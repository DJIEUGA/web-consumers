import React from "react";
import {
  FiAlertCircle,
  FiImage,
  FiMic,
  FiPaperclip,
  FiSend,
  FiSmile,
} from "react-icons/fi";
import type { UiMessage } from "@/features/collaboration/types/workflow";

type CollabChatBoxProps = {
  messages: UiMessage[];
  porteurPhoto: string;
  freelancePhoto: string;
  newMessage: string;
  onMessageChange: (value: string) => void;
  onKeyPress: (e: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => void;
  onSend: () => void;
  isMessagingLocked: boolean;
  messagingStatusNotice?: string;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  compact?: boolean;
  showComposerTools?: boolean;
  isRecording?: boolean;
  onToggleRecording?: () => void;
};

export const CollabChatBox = ({
  messages,
  porteurPhoto,
  freelancePhoto,
  newMessage,
  onMessageChange,
  onKeyPress,
  onSend,
  isMessagingLocked,
  messagingStatusNotice,
  messagesEndRef,
  compact = false,
  showComposerTools = false,
  isRecording = false,
  onToggleRecording,
}: CollabChatBoxProps) => {
  return (
    <div className={`collab-chat-container ${compact ? "small" : ""}`.trim()}>
      <div className="collab-messages">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`collab-message ${msg.sender === "porteur" ? "sent" : "received"}`}
          >
            <img
              src={msg.sender === "porteur" ? porteurPhoto : freelancePhoto}
              alt=""
              className="collab-message-avatar"
            />
            <div className="collab-message-content">
              <div className="collab-message-bubble">{msg.text}</div>
              <span className="collab-message-time">{msg.time}</span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {compact ? (
        <div className="collab-chat-input compact">
          <input
            type="text"
            placeholder="Votre message..."
            value={newMessage}
            onChange={(e) => onMessageChange(e.target.value)}
            onKeyPress={onKeyPress}
            disabled={isMessagingLocked}
          />
          <button className="collab-send-btn" onClick={onSend} disabled={isMessagingLocked}>
            <FiSend />
          </button>
        </div>
      ) : (
        <div className="collab-chat-input">
          {showComposerTools && (
            <>
              <button className="collab-input-btn">
                <FiPaperclip />
              </button>
              <button className="collab-input-btn">
                <FiImage />
              </button>
            </>
          )}
          <textarea
            placeholder="Écrivez votre message..."
            value={newMessage}
            onChange={(e) => onMessageChange(e.target.value)}
            onKeyPress={onKeyPress}
            disabled={isMessagingLocked}
            rows={1}
          />
          {showComposerTools && (
            <>
              <button className="collab-input-btn">
                <FiSmile />
              </button>
              <button
                className={`collab-input-btn mic ${isRecording ? "recording" : ""}`}
                onClick={onToggleRecording}
              >
                <FiMic />
              </button>
            </>
          )}
          <button className="collab-send-btn" onClick={onSend} disabled={isMessagingLocked}>
            <FiSend />
          </button>
        </div>
      )}

      {messagingStatusNotice && (
        <div className="collab-alert-info" style={{ marginTop: 12 }}>
          <FiAlertCircle />
          <span>{messagingStatusNotice}</span>
        </div>
      )}
    </div>
  );
};
