import React, { useState, useRef, useEffect, useMemo } from 'react';
import { FiX, FiSend, FiPaperclip, FiMic, FiMoreVertical, FiImage, FiSmile, FiTrash2, FiChevronLeft } from 'react-icons/fi';
import { toast } from 'sonner';
import EmojiPicker from './EmojiPicker';
import { useAuthStore } from '@/stores/auth.store';
import collaborationApi, { CollaborationSpaceResponse } from '../services/collaborationApi';
import profileApi from '../../profile/services/profileApi';
import { useUIStore } from '@/stores/ui.store';
import '../styles/MessagingDrawer.css';

interface Message {
  id: string;
  sender: 'me' | 'them';
  text: string;
  time: string;
  type: 'text' | 'voice' | 'file';
  fileUrl?: string;
  fullDate: string;
}

interface MessagingDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  freelance?: {
    id: string;
    nom: string;
    photo: string;
    disponible?: boolean;
  };
  initialSpaceId?: string | null;
}

const MessagingDrawer: React.FC<MessagingDrawerProps> = ({ isOpen, onClose, freelance, initialSpaceId }) => {
  const [view, setView] = useState<'list' | 'chat'>('chat');
  const [spaces, setSpaces] = useState<CollaborationSpaceResponse[]>([]);
  const [selectedSpace, setSelectedSpace] = useState<CollaborationSpaceResponse | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [spaceId, setSpaceId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeParticipantPhoto, setActiveParticipantPhoto] = useState<string | null>(null);
  const [photosMap, setPhotosMap] = useState<Record<string, string>>({});
  const [namesMap, setNamesMap] = useState<Record<string, string>>({});
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
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
        sender: String(msg.senderId) === String(currentUser?.id) ? 'me' : 'them',
        text: msg.content,
        time: new Date(msg.sentAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        fullDate: new Date(msg.sentAt).toISOString().split('T')[0],
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

          if (initialSpaceId) {
            const existing = allSpaces.find(s => s.id === initialSpaceId);
            if (existing) {
              handleSelectSpace(existing);
              return;
            }
          }

          if (freelance?.id) {
            const existing = allSpaces.find(s => s.proId === freelance.id || s.customerId === freelance.id);
            if (existing) {
              handleSelectSpace(existing);
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
  }, [isOpen, isAuthenticated, freelance?.id, initialSpaceId]);
  
  // Fetch real photos for all spaces in the list
  useEffect(() => {
    if (view === 'list' && spaces.length > 0) {
      const fetchDetails = async () => {
        const newPhotos = { ...photosMap };
        const newNames = { ...namesMap };
        let hasNew = false;
        
        for (const space of spaces) {
          const other = getOtherParticipant(space);
          if (other.id && (!newPhotos[other.id] || !newNames[other.id])) {
            try {
              let details: Record<string, any> | null = null;
              const isCurrentUserCustomer = currentUser?.role === 'ROLE_CUSTOMER' || currentUser?.role === 'ROLE_ENTERPRISE';
              if (isCurrentUserCustomer) {
                details = await collaborationApi.getProProfileDetails(other.id);
              } else {
                details = await collaborationApi.getCustomerProfileDetails(other.id);
              }
              
              if (details) {
                const photoCandidate = details.avatarUrl || details.logoUrl || details.avatar || details.photo;
                if (typeof photoCandidate === 'string' && photoCandidate) {
                  newPhotos[other.id] = photoCandidate;
                  hasNew = true;
                }
                const nameCandidate = details.fullName || details.displayName || 
                  (details.firstName && details.lastName ? `${details.firstName} ${details.lastName}` : null);
                if (typeof nameCandidate === 'string' && nameCandidate) {
                  newNames[other.id] = nameCandidate;
                  hasNew = true;
                }
              }
            } catch (e) {
              console.warn("Failed to fetch details for", other.id, e);
            }
          }
        }
        
        if (hasNew) {
          setPhotosMap(newPhotos);
          setNamesMap(newNames);
        }
      };
      
      fetchDetails();
    }
  }, [view, spaces]);

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
      fullDate: new Date().toISOString().split('T')[0],
      type: 'text'
    };
    setMessages(prev => [...prev, newMessage]);

    try {
      let currentSpaceId = spaceId;
      
      // Create space if doesn't exist
      if (!currentSpaceId && freelance?.id) {
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
        toast.success("Message envoyé");
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
    
    // Fetch real photo for active participant
    const isCurrentUserCustomer = currentUser?.role === 'ROLE_CUSTOMER' || currentUser?.role === 'ROLE_ENTERPRISE';
    const otherId = isCurrentUserCustomer ? space.proId : space.customerId;
    
    try {
      let details: Record<string, unknown> | null = null;
      if (isCurrentUserCustomer) {
        details = await collaborationApi.getProProfileDetails(otherId);
      } else {
        details = await collaborationApi.getCustomerProfileDetails(otherId);
      }

      if (details) {
        const photoCandidate = details.avatarUrl || details.logoUrl || details.avatar || details.photo;
        if (typeof photoCandidate === 'string' && photoCandidate) {
          setActiveParticipantPhoto(photoCandidate);
          setPhotosMap(prev => ({ ...prev, [otherId]: photoCandidate }));
        }
        
        const nameCandidate = details.fullName || details.displayName || 
          (details.firstName && details.lastName ? `${details.firstName} ${details.lastName}` : null);
        
        if (typeof nameCandidate === 'string' && nameCandidate) {
          setNamesMap(prev => ({ ...prev, [otherId]: nameCandidate }));
        }
      }
    } catch (e) {
      console.error("Failed to fetch participant details", e);
    }

    await loadMessages(space.id);
    setIsLoading(false);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        // In a real app, you would upload this blob to a server
        // For now we'll add it to the messages with a local URL
        const newMessage: Message = {
          id: Date.now().toString(),
          sender: 'me',
          text: 'Message vocal (' + formatTime(recordingTime) + ')',
          time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          fullDate: new Date().toISOString().split('T')[0],
          type: 'voice',
          fileUrl: audioUrl
        };
        setMessages(prev => [...prev, newMessage]);
        
        // Stop all tracks to release the microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast.error("Impossible d'accéder au micro. Veuillez vérifier vos permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleVoiceRecord = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.onstop = null; // Don't trigger the message creation
      mediaRecorderRef.current.stop();
      // Stop all tracks
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      setRecordingTime(0);
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
        fullDate: new Date().toISOString().split('T')[0],
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

  const formatDateHeader = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);

    const dStr = d.toDateString();
    if (dStr === now.toDateString()) return "Aujourd'hui";
    if (dStr === yesterday.toDateString()) return "Hier";
    
    return `Envoyé le ${d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}`;
  };

  const getOtherParticipant = (space: CollaborationSpaceResponse) => {
    const isCurrentUserCustomer = currentUser?.role === 'ROLE_CUSTOMER' || currentUser?.role === 'ROLE_ENTERPRISE';
    const details = isCurrentUserCustomer ? space.proDetails : space.customerDetails;
    const fallbackName = isCurrentUserCustomer ? space.proName : space.customerName;
    const otherId = String(isCurrentUserCustomer ? space.proId : space.customerId);
    
    let name = namesMap[otherId] || details?.fullName || details?.displayName || (details?.firstName && details?.lastName ? `${details.firstName} ${details.lastName}` : fallbackName) || "Utilisateur";
    
    // Clean name if it contains technical prefixes
    if (name && typeof name === 'string') {
      name = name.replace(/Collaboration avec /i, '')
                 .replace(/Demande de collaboration /i, '')
                 .replace(/Conversation avec /i, '');
    }
    
    return {
      name,
      id: otherId
    };
  };

  const getParticipantPhoto = (participantName: string) => {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(participantName)}`;
  };

  const currentChatInfo = useMemo(() => {
    if (selectedSpace) {
      const other = getOtherParticipant(selectedSpace);
      const name = other.name;
      return {
        name: name,
        photo: activeParticipantPhoto || photosMap[String(other.id)] || getParticipantPhoto(name),
        disponible: false
      };
    }
    if (freelance) {
      const name = freelance.nom.replace(/Collaboration avec /i, '')
                                .replace(/Demande de collaboration /i, '')
                                .replace(/Conversation avec /i, '');
      return {
        name: name,
        photo: freelance.photo || getParticipantPhoto(name),
        disponible: freelance.disponible
      };
    }
    return {
      name: "Messagerie",
      photo: "",
      disponible: false
    };
  }, [selectedSpace, freelance, activeParticipantPhoto, photosMap, namesMap]);

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
                  const photo = photosMap[other.id] || getParticipantPhoto(other.name);
                  return (
                    <div key={space.id} className="conversation-item" onClick={() => handleSelectSpace(space)}>
                      <img src={photo} alt={other.name} className="conversation-avatar" />
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
                messages.map((msg, index) => {
                  const showDateHeader = index === 0 || messages[index - 1].fullDate !== msg.fullDate;
                  return (
                    <React.Fragment key={msg.id}>
                      {showDateHeader && (
                        <div className="message-date-header">
                          <span>{formatDateHeader(msg.fullDate)}</span>
                        </div>
                      )}
                      <div className={`message-bubble ${msg.sender === 'me' ? 'sent' : 'received'}`}>
                        {msg.type === 'voice' ? (
                          <div className="voice-message-content">
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                              <FiMic style={{ marginRight: '8px' }} />
                              <span>Message vocal</span>
                            </div>
                            {msg.fileUrl && (
                              <audio controls src={msg.fileUrl} style={{ width: '100%', height: '30px', marginTop: '4px' }} />
                            )}
                          </div>
                        ) : (
                          <>
                            {msg.type === 'file' && <FiPaperclip style={{ marginRight: '8px' }} />}
                            {msg.text}
                          </>
                        )}
                        <span className="message-time">{msg.time}</span>
                      </div>
                    </React.Fragment>
                  );
                })
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
                  <button className="input-btn" onClick={cancelRecording} title="Annuler">
                    <FiTrash2 />
                  </button>
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
                    {showEmojiPicker && (
                      <div style={{ position: 'absolute', bottom: '100%', right: 0, marginBottom: '10px' }}>
                        <EmojiPicker 
                          onSelect={(emoji) => setInputText(prev => prev + emoji)} 
                          onClose={() => setShowEmojiPicker(false)} 
                        />
                      </div>
                    )}
                    <button className="input-btn" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                      <FiSmile />
                    </button>
                    <button className={`input-btn mic ${isRecording ? 'recording' : ''}`} onClick={handleVoiceRecord}>
                      <FiMic />
                    </button>
                    <button className="input-btn send-btn" onClick={handleSendMessage} disabled={isSending || !inputText.trim()}>
                      <FiSend />
                    </button>
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
