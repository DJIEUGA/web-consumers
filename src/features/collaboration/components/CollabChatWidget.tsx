import React, { useEffect, useRef } from 'react';
import { FiSend, FiPaperclip, FiMic, FiImage, FiSmile } from 'react-icons/fi';
import '../styles/MessagingDrawer.css';
import type { UiMessage } from '@/features/collaboration/types/workflow';

type Props = {
  title?: string;
  subtitle?: string;
  messages: UiMessage[];
  porteurPhoto: string;
  freelancePhoto: string;
  newMessage: string;
  onMessageChange: (v: string) => void;
  onKeyPress: (e: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => void;
  onSend: () => void;
  onRetryMessage?: (id: string) => void;
  isMessagingLocked?: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  isRecording?: boolean;
  onToggleRecording?: () => void;
};

export const CollabChatWidget: React.FC<Props> = ({
  title = 'Messagerie',
  subtitle,
  messages,
  porteurPhoto,
  freelancePhoto,
  newMessage,
  onMessageChange,
  onKeyPress,
  onSend,
  onRetryMessage,
  isMessagingLocked,
  messagesEndRef,
  isRecording,
  onToggleRecording,
}) => {
  const innerEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // prefer external ref if provided
    (messagesEndRef?.current || innerEndRef.current)?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, messagesEndRef]);

  return (
    <div className="messaging-drawer open relative" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <header className="messaging-header" style={{ flex: '0 0 auto' }}>
        <div className="messaging-user-info">
          <img src={freelancePhoto || porteurPhoto} alt={title} className="messaging-avatar" />
          <div className="messaging-user-details">
            <h3>{title}</h3>
            {subtitle && <div className="messaging-status">{subtitle}</div>}
          </div>
        </div>
      </header>

      <div className="messaging-body" style={{ flex: '1 1 auto', overflow: 'auto' }}>
        {messages.length === 0 ? (
          <div className="messaging-empty">
            <p>Aucun message pour l'instant.</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`message-bubble ${msg.sender === 'porteur' ? 'sent' : 'received'}`}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {msg.text}
              </span>
              <span className="message-time">{msg.time}</span>
              {msg.deliveryStatus === 'sending' && (
                <span className="message-time" style={{ color: '#fd7e14' }}>Envoi...</span>
              )}
              {msg.deliveryStatus === 'failed' && onRetryMessage && (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
                  <span className="message-time" style={{ color: '#dc3545' }}>Echec d'envoi</span>
                  <button className="input-btn" onClick={() => onRetryMessage(msg.id)}>Réessayer</button>
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef || innerEndRef} />
      </div>

      <footer className="messaging-footer" style={{ flex: '0 0 auto' }}>
        <div className="messaging-input-wrapper">
          <div className="input-actions-left">
            <button className="input-btn"><FiPaperclip /></button>
            <button className="input-btn"><FiImage /></button>
          </div>

          <textarea
            className="messaging-input"
            placeholder="Écrivez votre message..."
            value={newMessage}
            onChange={(e) => onMessageChange(e.target.value)}
            onKeyDown={onKeyPress}
            rows={1}
            disabled={isMessagingLocked}
          />

          <div className="input-actions-right">
            <button className="input-btn"><FiSmile /></button>
            <button className={`input-btn mic ${isRecording ? 'recording' : ''}`} onClick={onToggleRecording}>
              <FiMic />
            </button>
            <button className="input-btn send-btn" onClick={onSend} disabled={isMessagingLocked}>
              <FiSend />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CollabChatWidget;
