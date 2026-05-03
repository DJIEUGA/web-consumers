import React, { useState, useRef, useEffect, useMemo } from 'react';
import { FiX, FiSend, FiPaperclip, FiMic, FiMoreVertical, FiImage, FiSmile, FiTrash2, FiChevronLeft } from 'react-icons/fi';
import { useAuthStore } from '@/stores/auth.store';
import collaborationApi, { CollaborationSpaceResponse } from '../services/collaborationApi';
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
  const [view, setView] = useState<'list' | 'chat'>('chat');
  const [spaces, setSpaces] = useState<CollaborationSpaceResponse[]>([]);
  const [selectedSpace, setSelectedSpace] = useState<CollaborationSpaceResponse | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [spaceId, setSpaceId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
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

  const loadMessages = async (sid: string) => {
    try {
      const remoteMessages = await collaborationApi.listMessages(sid);
      setMessages(remoteMessages.map(msg => ({
        id: msg.id,
        sender: msg.senderId === currentUser?.id ? 'me' : 'them',
        text: msg.content,
        time: new Date(msg.sentAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        type: 'text'
      })));
    } catch (error) {
      console.error("Failed to load messages:", error);
    }
  };

  // Find or create collaboration space
  useEffect(() => {
    if (isOpen && isAuthenticated) {
      const init = async () => {
        setIsLoading(true);
        try {
          const allSpaces = await collaborationApi.listMySpaces();
          setSpaces(allSpaces);

          if (freelance.id) {
            const existing = allSpaces.find(s => s.proId === freelance.id || s.customerId === freelance.id);
            if (existing) {
              setSelectedSpace(existing);
              setSpaceId(existing.id);
              setView('chat');
              await loadMessages(existing.id);
            } else {
              setSelectedSpace(null);
              setSpaceId(null);
              setMessages([]);
              setView('chat');
            }
          } else {
            setView('list');
          }
        } catch (error) {
          console.error("Failed to init messaging:", error);
        } finally {
          setIsLoading(false);
        }
      };
      init();
    }
  }, [isOpen, isAuthenticated, freelance.id]);

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
      if (!currentSpaceId && freelance.id) {
        const newSpace = await collaborationApi.createSpace({
          proId: freelance.id,
          title: `Conversation avec ${freelance.nom}`
        });
        currentSpaceId = newSpace.id;
        setSpaceId(currentSpaceId);
        
        // Update spaces list
        const updatedSpaces = await collaborationApi.listMySpaces();
        setSpaces(updatedSpaces);
        setSelectedSpace(newSpace);
      }

      if (currentSpaceId) {
        await collaborationApi.sendMessage(currentSpaceId, textToSend);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleSelectSpace = async (space: CollaborationSpaceResponse) => {
    setSelectedSpace(space);
    setSpaceId(space.id);
    setView('chat');
    setIsLoading(true);
    await loadMessages(space.id);
    setIsLoading(false);
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

  const getOtherParticipant = (space: CollaborationSpaceResponse) => {
    const isCustomer = currentUser?.id === space.customerId;
    return {
      name: isCustomer ? space.proName : space.customerName,
      id: isCustomer ? space.proId : space.customerId
    };
  };

  const getParticipantPhoto = (participantName: string) => {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(participantName)}`;
  };

  const currentChatInfo = useMemo(() => {
    if (selectedSpace) {
      const other = getOtherParticipant(selectedSpace);
      return {
        name: other.name,
        photo: getParticipantPhoto(other.name),
        disponible: false
      };
    }
    return {
      name: freelance.nom,
      photo: freelance.photo,
      disponible: freelance.disponible
    };
  }, [selectedSpace, freelance, currentUser]);

  return (
    <>
      <div className={`messaging-drawer ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <header className="messaging-header">
          {view === 'chat' ? (
            <>
              <div className="messaging-user-info">
                <button className="input-btn back-btn" onClick={() => setView('list')}>
                  <FiChevronLeft />
                </button>
                <img src={currentChatInfo.photo} alt={currentChatInfo.name} className="messaging-avatar" />
                <div className="messaging-user-details">
                  <h3>{currentChatInfo.name}</h3>
                  <div className="messaging-status">
                    <span className={`status-dot ${currentChatInfo.disponible ? 'online' : ''}`}></span>
                    {currentChatInfo.disponible ? 'En ligne' : 'Hors ligne'}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="messaging-user-details">
              <h3>Mes messages</h3>
            </div>
          )}
          
          <div className="messaging-actions">
            <button className="messaging-more-btn"><FiMoreVertical /></button>
            <button className="messaging-close-btn" onClick={onClose}><FiX /></button>
          </div>
        </header>

        {/* Body */}
        <div className="messaging-body">
          {view === 'list' ? (
            <div className="messaging-list">
              {isLoading ? (
                <div className="messaging-empty"><p>Chargement...</p></div>
              ) : spaces.length === 0 ? (
                <div className="messaging-empty">
                  <p>Aucune conversation trouvée.</p>
                </div>
              ) : (
                spaces.map(space => {
                  const other = getOtherParticipant(space);
                  return (
                    <div key={space.id} className="conversation-item" onClick={() => handleSelectSpace(space)}>
                      <img src={getParticipantPhoto(other.name)} alt={other.name} className="conversation-avatar" />
                      <div className="conversation-details">
                        <div className="conversation-header">
                          <span className="conversation-name">{other.name}</span>
                          <span className="conversation-time">
                            {new Date(space.updatedAt).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                        <p className="conversation-preview">{space.title}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            <>
              {isLoading ? (
                <div className="messaging-empty"><p>Chargement des messages...</p></div>
              ) : messages.length === 0 ? (
                <div className="messaging-empty">
                  <p>Envoyez un message pour démarrer la conversation avec {currentChatInfo.name}.</p>
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
            </>
          )}
        </div>

        {/* Footer */}
        {view === 'chat' && (
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
        )}
      </div>
    </>
  );
};

export default MessagingDrawer;
