import React, { useState, useRef, useEffect } from 'react';
import { FiX, FiSend, FiPaperclip, FiMic, FiMoreVertical, FiImage, FiSmile, FiTrash2 } from 'react-icons/fi';
import { useAuthStore } from '@/stores/auth.store';
import collaborationApi from '../services/collaborationApi';
import '../styles/MessagingDrawer.css';

interface Message {
  id: string;
  sender: 'me' | 'them';
  text: string;
  time: string;
  type: 'text' | 'voice' | 'file';
  fileUrl?: string;
}

interface MessagingDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  freelance: {
    id: string;
    nom: string;
    photo: string;
    disponible?: boolean;
  };
}

const MessagingDrawer: React.FC<MessagingDrawerProps> = ({ isOpen, onClose, freelance }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [spaceId, setSpaceId] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const { user: currentUser, isAuthenticated } = useAuthStore();

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Timer for voice recording
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setRecordingTime(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  // Find or create collaboration space
  useEffect(() => {
    if (isOpen && isAuthenticated && freelance.id) {
      const initSpace = async () => {
        try {
          const spaces = await collaborationApi.listMySpaces();
          const existing = spaces.find(s => s.proId === freelance.id || s.customerId === freelance.id);
          if (existing) {
            setSpaceId(existing.id);
            const remoteMessages = await collaborationApi.listMessages(existing.id);
            setMessages(remoteMessages.map(msg => ({
              id: msg.id,
              sender: msg.senderId === currentUser?.id ? 'me' : 'them',
              text: msg.content,
              time: new Date(msg.sentAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
              type: 'text'
            })));
          }
        } catch (error) {
          console.error("Failed to init messaging space:", error);
        }
      };
      initSpace();
    }
  }, [isOpen, isAuthenticated, freelance.id, currentUser?.id]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isSending) return;
    
    const textToSend = inputText.trim();
    setInputText('');
    setIsSending(true);

    // Optimistic update
    const tempId = Date.now().toString();
    const newMessage: Message = {
      id: tempId,
      sender: 'me',
      text: textToSend,
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      type: 'text'
    };
    setMessages(prev => [...prev, newMessage]);

    try {
      let currentSpaceId = spaceId;
      
      // Create space if doesn't exist
      if (!currentSpaceId) {
        const newSpace = await collaborationApi.createSpace({
          proId: freelance.id,
          title: `Conversation avec ${freelance.nom}`
        });
        currentSpaceId = newSpace.id;
        setSpaceId(currentSpaceId);
      }

      await collaborationApi.sendMessage(currentSpaceId, textToSend);
    } catch (error) {
      console.error("Failed to send message:", error);
      // Remove optimistic message or show error
    } finally {
      setIsSending(false);
    }
  };

  const handleVoiceRecord = () => {
    setIsRecording(!isRecording);
    if (isRecording) {
      // Simulate sending voice message
      const newMessage: Message = {
        id: Date.now().toString(),
        sender: 'me',
        text: 'Message vocal (' + formatTime(recordingTime) + ')',
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        type: 'voice'
      };
      setMessages(prev => [...prev, newMessage]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const newMessage: Message = {
        id: Date.now().toString(),
        sender: 'me',
        text: `Fichier : ${file.name}`,
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        type: 'file'
      };
      setMessages(prev => [...prev, newMessage]);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      <div className={`messaging-drawer ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <header className="messaging-header">
          <div className="messaging-user-info">
            <img src={freelance.photo} alt={freelance.nom} className="messaging-avatar" />
            <div className="messaging-user-details">
              <h3>{freelance.nom}</h3>
              <div className="messaging-status">
                <span className={`status-dot ${freelance.disponible ? 'online' : ''}`}></span>
                {freelance.disponible ? 'En ligne' : 'Hors ligne'}
              </div>
            </div>
          </div>
          <div className="messaging-actions">
            <button className="messaging-more-btn"><FiMoreVertical /></button>
            <button className="messaging-close-btn" onClick={onClose}><FiX /></button>
          </div>
        </header>

        {/* Body */}
        <div className="messaging-body">
          {messages.length === 0 ? (
            <div className="messaging-empty">
              <p>Envoyez un message pour démarrer la conversation avec {freelance.nom}.</p>
            </div>
          ) : (
            messages.map(msg => (
              <div key={msg.id} className={`message-bubble ${msg.sender === 'me' ? 'sent' : 'received'}`}>
                {msg.type === 'voice' && <FiMic style={{marginRight: '8px'}} />}
                {msg.type === 'file' && <FiPaperclip style={{marginRight: '8px'}} />}
                {msg.text}
                <span className="message-time">{msg.time}</span>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Footer */}
        <footer className="messaging-footer">
          <div className="messaging-input-wrapper">
            {isRecording ? (
              <div className="recording-ui">
                <div className="recording-dot"></div>
                <span className="recording-timer">{formatTime(recordingTime)}</span>
                <div className="waveform">
                  {[...Array(15)].map((_, i) => (
                    <div key={i} className="waveform-bar" style={{animationDelay: `${i * 0.1}s`}}></div>
                  ))}
                </div>
                <button className="input-btn" onClick={() => setIsRecording(false)}><FiTrash2 /></button>
              </div>
            ) : (
              <>
                <div className="input-actions-left">
                  <button className="input-btn" onClick={() => fileInputRef.current?.click()}>
                    <FiPaperclip />
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    style={{display: 'none'}} 
                    onChange={handleFileUpload}
                  />
                  <button className="input-btn"><FiImage /></button>
                </div>
                
                <textarea 
                  className="messaging-input"
                  placeholder="Écrivez votre message..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyPress}
                  rows={1}
                />

                <div className="input-actions-right">
                  <button className="input-btn"><FiSmile /></button>
                  {inputText.trim() ? (
                    <button className="input-btn send-btn" onClick={handleSendMessage} disabled={isSending}>
                      <FiSend />
                    </button>
                  ) : (
                    <button className="input-btn" onClick={handleVoiceRecord}>
                      <FiMic />
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </footer>
      </div>
    </>
  );
};

export default MessagingDrawer;
