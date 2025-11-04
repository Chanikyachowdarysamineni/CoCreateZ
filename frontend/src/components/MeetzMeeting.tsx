import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Video, VideoOff, Mic, MicOff, Phone, PhoneOff, Users, UserPlus, 
  Settings, Monitor, MoreVertical, MessageSquare, Share2, Circle,
  Volume2, Camera, CameraOff, ScreenShare, ScreenShareOff,
  Hand, Clock, Link2, Crown, Maximize2, Minimize2, 
  Grid3x3, Eye, EyeOff, Plus, Wifi, WifiOff,
  AlertCircle, CheckCircle, Loader2, X, Copy, Send,
  Smile, Paperclip, Image, FileText, Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Participant {
  id: string;
  name: string;
  avatar: string;
  isVideoOn: boolean;
  isAudioOn: boolean;
  isScreenSharing: boolean;
  isHost: boolean;
  joinedAt: Date;
  status: 'active' | 'away' | 'muted';
  stream?: MediaStream;
  screenStream?: MediaStream;
  peerConnection?: RTCPeerConnection;
  audioLevel: number;
}

interface ChatMessage {
  id: number;
  senderId: string;
  sender: string;
  message: string;
  timestamp: Date;
  type?: 'text' | 'file' | 'system';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  reactions?: { [emoji: string]: string[] }; // emoji -> array of user IDs
}

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

const MeetzMeeting: React.FC = () => {
  // Meeting state
  const [isInMeeting, setIsInMeeting] = useState(false);
  const [meetingId, setMeetingId] = useState('');
  const [meetingName, setMeetingName] = useState('');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [localParticipant, setLocalParticipant] = useState<Participant | null>(null);
  
  // User controls
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  
  // UI state
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [gridView, setGridView] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('disconnected');
  
  // Meeting creation
  const [showCreateMeeting, setShowCreateMeeting] = useState(false);
  const [newMeetingName, setNewMeetingName] = useState('');
  const [meetingPassword, setMeetingPassword] = useState('');
  const [joinMeetingId, setJoinMeetingId] = useState('');
  const [joinPassword, setJoinPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [waitingRoom, setWaitingRoom] = useState<Participant[]>([]);
  const [showWaitingRoom, setShowWaitingRoom] = useState(false);
  const [requirePassword, setRequirePassword] = useState(true);
  const [requireApproval, setRequireApproval] = useState(true);
  const [showJoinMeeting, setShowJoinMeeting] = useState(false);
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  
  // Chat and messages
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [isTyping, setIsTyping] = useState<{[key: string]: boolean}>({});
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const [showChatSearch, setShowChatSearch] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  
  // WebRTC state
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedAudioDevice, setSelectedAudioDevice] = useState<string>('');
  const [selectedVideoDevice, setSelectedVideoDevice] = useState<string>('');
  const [mediaError, setMediaError] = useState<string>('');
  const [isInitializing, setIsInitializing] = useState(false);
  
  // Toast notifications
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  // Refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const screenVideoRef = useRef<HTMLVideoElement>(null);
  const participantVideoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
  const chatInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
  const dataChannels = useRef<Map<string, RTCDataChannel>>(new Map());
  const audioContext = useRef<AudioContext | null>(null);
  const audioAnalyzers = useRef<Map<string, AnalyserNode>>(new Map());
  const animationFrameIds = useRef<Map<string, number>>(new Map());

  // ICE servers configuration
  const iceServers: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun3.l.google.com:19302' },
      { urls: 'stun:stun4.l.google.com:19302' }
    ],
    iceCandidatePoolSize: 10
  };

  // Toast notification system
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  // Generate secure meeting ID
  const generateMeetingId = useCallback(() => {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < 10; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }, []);

  // Initialize camera preview
  const initializeCameraPreview = useCallback(async () => {
    try {
      setMediaError('');
      const constraints: MediaStreamConstraints = {
        video: {
          deviceId: selectedVideoDevice ? { exact: selectedVideoDevice } : undefined,
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        },
        audio: {
          deviceId: selectedAudioDevice ? { exact: selectedAudioDevice } : undefined,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setPreviewStream(stream);
      
      if (previewVideoRef.current) {
        previewVideoRef.current.srcObject = stream;
      }
      
      console.log('Camera preview initialized successfully');
      return stream;
    } catch (error: any) {
      console.error('Error initializing camera preview:', error);
      setMediaError(error.message || 'Failed to access camera');
      showToast('Failed to access camera. Please check permissions.', 'error');
      return null;
    }
  }, [selectedVideoDevice, selectedAudioDevice, showToast]);

  // Stop camera preview
  const stopCameraPreview = useCallback(() => {
    if (previewStream) {
      previewStream.getTracks().forEach(track => track.stop());
      setPreviewStream(null);
    }
    if (previewVideoRef.current) {
      previewVideoRef.current.srcObject = null;
    }
  }, [previewStream]);

  // Get available media devices
  const getMediaDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices.filter(device => device.kind === 'audioinput');
      const videoInputs = devices.filter(device => device.kind === 'videoinput');
      
      setAudioDevices(audioInputs);
      setVideoDevices(videoInputs);
      
      if (audioInputs.length > 0 && !selectedAudioDevice) {
        setSelectedAudioDevice(audioInputs[0].deviceId);
      }
      if (videoInputs.length > 0 && !selectedVideoDevice) {
        setSelectedVideoDevice(videoInputs[0].deviceId);
      }
      
      return { audioInputs, videoInputs };
    } catch (error) {
      console.error('Error getting media devices:', error);
      return { audioInputs: [], videoInputs: [] };
    }
  }, [selectedAudioDevice, selectedVideoDevice]);

  // Setup audio level monitoring
  const setupAudioMonitoring = useCallback((stream: MediaStream, participantId: string) => {
    try {
      if (!audioContext.current || audioContext.current.state === 'closed') {
        audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const audioSource = audioContext.current.createMediaStreamSource(stream);
      const analyzer = audioContext.current.createAnalyser();
      analyzer.fftSize = 256;
      audioSource.connect(analyzer);
      audioAnalyzers.current.set(participantId, analyzer);

      const dataArray = new Uint8Array(analyzer.frequencyBinCount);
      
      const updateAudioLevel = () => {
        if (audioContext.current?.state !== 'running') return;
        
        analyzer.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        const normalizedLevel = Math.min(average / 128, 1);
        
        setParticipants(prev => prev.map(p => 
          p.id === participantId ? { ...p, audioLevel: normalizedLevel } : p
        ));
        
        if (participantId === 'local' && localParticipant) {
          setLocalParticipant(prev => prev ? { ...prev, audioLevel: normalizedLevel } : null);
        }
        
        const frameId = requestAnimationFrame(updateAudioLevel);
        animationFrameIds.current.set(participantId, frameId);
      };
      
      updateAudioLevel();
    } catch (error) {
      console.error('Error setting up audio monitoring:', error);
    }
  }, [localParticipant]);

  // Initialize local media stream
  const initializeLocalStream = useCallback(async () => {
    try {
      setIsInitializing(true);
      setConnectionStatus('connecting');
      setMediaError('');
      
      const constraints: MediaStreamConstraints = {
        video: {
          deviceId: selectedVideoDevice ? { exact: selectedVideoDevice } : undefined,
          width: { ideal: 1920, max: 1920 },
          height: { ideal: 1080, max: 1080 },
          frameRate: { ideal: 30, max: 60 }
        },
        audio: {
          deviceId: selectedAudioDevice ? { exact: selectedAudioDevice } : undefined,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.muted = true;
      }

      const videoTrack = stream.getVideoTracks()[0];
      const audioTrack = stream.getAudioTracks()[0];
      
      if (videoTrack) {
        videoTrack.enabled = isVideoOn;
        console.log('Video track settings:', videoTrack.getSettings());
      }
      if (audioTrack) {
        audioTrack.enabled = isAudioOn;
        console.log('Audio track settings:', audioTrack.getSettings());
      }

      // Setup audio monitoring for local stream
      setupAudioMonitoring(stream, 'local');
      
      setConnectionStatus('connected');
      setIsInitializing(false);
      showToast('Camera and microphone connected', 'success');
      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      setConnectionStatus('disconnected');
      setIsInitializing(false);
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          setMediaError('Camera/Microphone access denied. Please allow permissions and refresh.');
          showToast('Please allow camera and microphone access', 'error');
        } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
          setMediaError('No camera or microphone found. Please connect a device.');
          showToast('No camera or microphone detected', 'error');
        } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
          setMediaError('Camera/Microphone is already in use by another application.');
          showToast('Device is already in use', 'error');
        } else {
          setMediaError('Error accessing media devices: ' + error.message);
          showToast('Failed to access media devices', 'error');
        }
      }
      return null;
    }
  }, [selectedVideoDevice, selectedAudioDevice, isVideoOn, isAudioOn, showToast, setupAudioMonitoring]);

  // Initialize screen sharing
  const initializeScreenShare = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'monitor'
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 48000
        }
      });
      
      setScreenStream(stream);
      
      if (screenVideoRef.current) {
        screenVideoRef.current.srcObject = stream;
      }

      // Handle screen share stop
      const videoTrack = stream.getVideoTracks()[0];
      videoTrack.onended = () => {
        setIsScreenSharing(false);
        setScreenStream(null);
        showToast('Screen sharing stopped', 'info');
        
        // Switch back to camera in peer connections
        if (localStream) {
          peerConnections.current.forEach(pc => {
            const sender = pc.getSenders().find(s => s.track?.kind === 'video');
            if (sender && localStream.getVideoTracks()[0]) {
              sender.replaceTrack(localStream.getVideoTracks()[0]);
            }
          });
        }
      };

      // Replace video track in all peer connections
      peerConnections.current.forEach(pc => {
        const sender = pc.getSenders().find(s => s.track?.kind === 'video');
        if (sender) {
          sender.replaceTrack(videoTrack);
        }
      });

      showToast('Screen sharing started', 'success');
      return stream;
    } catch (error) {
      console.error('Error sharing screen:', error);
      if (error instanceof Error && error.name !== 'NotAllowedError') {
        showToast('Could not start screen sharing', 'error');
      }
      return null;
    }
  }, [localStream, showToast]);

  // Create peer connection
  const createPeerConnection = useCallback((participantId: string, participantName: string) => {
    const pc = new RTCPeerConnection(iceServers);
    
    // Add local stream tracks
    if (localStream) {
      localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream);
      });
    }

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('New ICE candidate:', event.candidate.type);
        // In production: send to signaling server
      }
    };

    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      console.log(`Peer connection state (${participantName}):`, pc.connectionState);
      
      if (pc.connectionState === 'connected') {
        setConnectionStatus('connected');
        showToast(`Connected to ${participantName}`, 'success');
      } else if (pc.connectionState === 'failed') {
        setConnectionStatus('disconnected');
        showToast(`Connection failed with ${participantName}`, 'error');
      } else if (pc.connectionState === 'disconnected') {
        showToast(`${participantName} disconnected`, 'info');
      }
    };

    // Handle ICE connection state
    pc.oniceconnectionstatechange = () => {
      console.log(`ICE connection state (${participantName}):`, pc.iceConnectionState);
    };

    // Handle remote stream
    pc.ontrack = (event) => {
      console.log('Received remote track:', event.track.kind, 'from', participantName);
      const [remoteStream] = event.streams;
      
      setParticipants(prev => prev.map(p => {
        if (p.id === participantId) {
          if (event.track.kind === 'video' && event.track.label.includes('screen')) {
            return { ...p, screenStream: remoteStream, isScreenSharing: true };
          }
          return { ...p, stream: remoteStream };
        }
        return p;
      }));

      // Setup video element
      const videoElement = participantVideoRefs.current.get(participantId);
      if (videoElement && !videoElement.srcObject) {
        videoElement.srcObject = remoteStream;
      }

      // Setup audio monitoring
      if (event.track.kind === 'audio') {
        setupAudioMonitoring(remoteStream, participantId);
      }
    };

    // Create data channel for chat
    const dataChannel = pc.createDataChannel('chat', {
      ordered: true
    });
    
    dataChannel.onopen = () => {
      console.log('Data channel opened with', participantName);
    };
    
    dataChannel.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'chat':
            const message: ChatMessage = data.message;
            setChatMessages(prev => [...prev, message]);
            if (!showChat) {
              setUnreadMessages(prev => prev + 1);
            }
            break;
            
          case 'typing':
            setIsTyping(prev => ({
              ...prev,
              [data.userId]: data.isTyping
            }));
            break;
            
          case 'reaction':
            setChatMessages(prev => prev.map(msg => {
              if (msg.id === data.messageId) {
                const reactions = { ...msg.reactions };
                if (!reactions[data.emoji]) {
                  reactions[data.emoji] = [];
                }
                
                if (reactions[data.emoji].includes(data.userId)) {
                  reactions[data.emoji] = reactions[data.emoji].filter(id => id !== data.userId);
                  if (reactions[data.emoji].length === 0) {
                    delete reactions[data.emoji];
                  }
                } else {
                  reactions[data.emoji].push(data.userId);
                }
                
                return { ...msg, reactions };
              }
              return msg;
            }));
            break;
            
          case 'hand-raised':
            const participantName = participants.find(p => p.id === data.userId)?.name || 'Someone';
            showToast(`${participantName} ${data.raised ? 'raised' : 'lowered'} their hand`, 'info');
            break;
            
          case 'file':
            const fileMessage: ChatMessage = {
              id: data.messageId,
              senderId: data.userId,
              sender: data.userName,
              message: `Shared a file: ${data.fileName}`,
              timestamp: new Date(data.timestamp),
              type: 'file',
              fileName: data.fileName,
              fileSize: data.fileSize,
              fileUrl: data.fileUrl,
              reactions: {}
            };
            setChatMessages(prev => [...prev, fileMessage]);
            if (!showChat) {
              setUnreadMessages(prev => prev + 1);
            }
            break;
            
          default:
            console.log('Unknown message type:', data.type);
        }
      } catch (error) {
        console.error('Error parsing data channel message:', error);
      }
    };

    dataChannel.onerror = (error) => {
      console.error('Data channel error:', error);
    };
    
    dataChannels.current.set(participantId, dataChannel);

    // Handle incoming data channels
    pc.ondatachannel = (event) => {
      const dc = event.channel;
      dc.onmessage = dataChannel.onmessage;
      dataChannels.current.set(participantId + '-incoming', dc);
    };
    
    peerConnections.current.set(participantId, pc);
    
    return pc;
  }, [localStream, showChat, showToast, setupAudioMonitoring]);

  // Simulate real-time participant joining
  useEffect(() => {
    if (isInMeeting && localStream) {
      const interval = setInterval(() => {
        if (Math.random() < 0.15 && participants.length < 6) {
          const names = ['Alice Johnson', 'Bob Smith', 'Charlie Davis', 'Diana Martinez', 'Eve Wilson', 'Frank Brown'];
          const availableNames = names.filter(name => 
            !participants.some(p => p.name === name)
          );
          
          if (availableNames.length > 0) {
            const selectedName = availableNames[Math.floor(Math.random() * availableNames.length)];
            const newParticipantId = 'peer-' + Math.random().toString(36).substr(2, 9);
            
            const newParticipant: Participant = {
              id: newParticipantId,
              name: selectedName,
              avatar: selectedName.split(' ').map(n => n[0]).join(''),
              isVideoOn: Math.random() > 0.2,
              isAudioOn: Math.random() > 0.3,
              isScreenSharing: false,
              isHost: false,
              joinedAt: new Date(),
              status: 'active',
              audioLevel: 0
            };
            
            setParticipants(prev => [...prev, newParticipant]);
            
            // Create peer connection
            setTimeout(() => {
              createPeerConnection(newParticipantId, selectedName);
            }, 500);
            
            showToast(`${selectedName} joined`, 'success');
          }
        }
      }, 8000);
      
      return () => clearInterval(interval);
    }
  }, [isInMeeting, localStream, participants, createPeerConnection, showToast]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatContainerRef.current && !chatSearchQuery) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages, chatSearchQuery]);

  // Save chat messages to localStorage
  useEffect(() => {
    if (meetingId && chatMessages.length > 0) {
      try {
        localStorage.setItem(`chat_${meetingId}`, JSON.stringify(chatMessages));
      } catch (error) {
        console.error('Error saving chat messages:', error);
      }
    }
  }, [chatMessages, meetingId]);

  // Load chat messages from localStorage
  useEffect(() => {
    if (meetingId && isInMeeting) {
      try {
        const savedMessages = localStorage.getItem(`chat_${meetingId}`);
        if (savedMessages) {
          const messages = JSON.parse(savedMessages).map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }));
          setChatMessages(messages);
        }
      } catch (error) {
        console.error('Error loading chat messages:', error);
      }
    }
  }, [meetingId, isInMeeting]);

  // Initialize devices on mount
  useEffect(() => {
    getMediaDevices();
    
    const handleDeviceChange = () => {
      console.log('Media devices changed');
      getMediaDevices();
    };
    
    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);
    
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
    };
  }, [getMediaDevices]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Stop all tracks
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
      }
      
      // Close peer connections
      peerConnections.current.forEach(pc => pc.close());
      peerConnections.current.clear();
      
      // Close data channels
      dataChannels.current.forEach(dc => dc.close());
      dataChannels.current.clear();
      
      // Cancel animation frames
      animationFrameIds.current.forEach(id => cancelAnimationFrame(id));
      animationFrameIds.current.clear();
      
      // Close audio context safely
      if (audioContext.current && audioContext.current.state !== 'closed') {
        try {
          audioContext.current.close();
        } catch (error) {
          console.warn('AudioContext already closed or closing:', error);
        }
      }
    };
  }, [localStream, screenStream]);

  const createMeeting = useCallback(async () => {
    const stream = await initializeLocalStream();
    if (!stream) {
      return;
    }

    const id = generateMeetingId();
    const name = newMeetingName || `Meeting ${id.slice(0, 4)}`;
    const password = meetingPassword || Math.random().toString(36).substring(2, 10);
    
    setMeetingId(id);
    setMeetingName(name);
    setMeetingPassword(password);
    setIsAdmin(true);
    
    const localPart: Participant = {
      id: 'local',
      name: 'You (Host)',
      avatar: 'YH',
      isVideoOn: true,
      isAudioOn: true,
      isScreenSharing: false,
      isHost: true,
      joinedAt: new Date(),
      status: 'active',
      stream: stream,
      audioLevel: 0
    };
    
    setLocalParticipant(localPart);
    setParticipants([localPart]);
    setIsInMeeting(true);
    setShowCreateMeeting(false);
    setNewMeetingName('');
    
    // Store meeting in localStorage for persistence
    const meetingData = {
      id,
      name,
      password,
      hostId: 'local',
      createdAt: new Date().toISOString(),
      requirePassword,
      requireApproval
    };
    localStorage.setItem(`meeting_${id}`, JSON.stringify(meetingData));
    
    showToast(`Meeting "${name}" created! ID: ${id}`, 'success');
  }, [newMeetingName, meetingPassword, requirePassword, requireApproval, initializeLocalStream, showToast, generateMeetingId]);

  const joinMeeting = useCallback(async (id: string, password?: string) => {
    if (!id.trim()) {
      showToast('Please enter a meeting ID', 'error');
      return;
    }
    
    // Check if meeting exists and validate password
    const meetingData = localStorage.getItem(`meeting_${id}`);
    if (!meetingData) {
      showToast('Meeting not found', 'error');
      return;
    }
    
    const meeting = JSON.parse(meetingData);
    if (meeting.requirePassword && password !== meeting.password) {
      showToast('Invalid password', 'error');
      return;
    }
    
    const stream = await initializeLocalStream();
    if (!stream) {
      return;
    }

    setMeetingId(id);
    setMeetingName(meeting.name);
    setIsAdmin(false);
    
    const localPart: Participant = {
      id: 'local',
      name: 'You',
      avatar: 'Y',
      isVideoOn: true,
      isAudioOn: true,
      isScreenSharing: false,
      isHost: false,
      joinedAt: new Date(),
      status: 'active',
      stream: stream,
      audioLevel: 0
    };
    
    setLocalParticipant(localPart);
    setParticipants([localPart]);
    setIsInMeeting(true);
    setJoinMeetingId('');
    
    showToast('Connected to meeting', 'success');
  }, [initializeLocalStream, showToast]);

  // Admin control functions
  const approveParticipant = useCallback((participantId: string) => {
    const waitingParticipant = waitingRoom.find(p => p.id === participantId);
    if (waitingParticipant && isAdmin) {
      setWaitingRoom(prev => prev.filter(p => p.id !== participantId));
      setParticipants(prev => [...prev, waitingParticipant]);
      showToast(`${waitingParticipant.name} has been admitted to the meeting`, 'success');
    }
  }, [waitingRoom, isAdmin, showToast]);

  const denyParticipant = useCallback((participantId: string) => {
    const waitingParticipant = waitingRoom.find(p => p.id === participantId);
    if (waitingParticipant && isAdmin) {
      setWaitingRoom(prev => prev.filter(p => p.id !== participantId));
      showToast(`${waitingParticipant.name} was denied access`, 'info');
    }
  }, [waitingRoom, isAdmin, showToast]);

  const removeParticipant = useCallback((participantId: string) => {
    if (isAdmin && participantId !== 'local') {
      setParticipants(prev => prev.filter(p => p.id !== participantId));
      showToast('Participant removed from meeting', 'info');
    }
  }, [isAdmin, showToast]);

  const muteParticipant = useCallback((participantId: string) => {
    if (isAdmin && participantId !== 'local') {
      setParticipants(prev => prev.map(p => 
        p.id === participantId ? { ...p, isAudioOn: false } : p
      ));
      showToast('Participant muted', 'info');
    }
  }, [isAdmin, showToast]);

  const generateMeetingLink = useCallback(() => {
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/meeting/${meetingId}${meetingPassword ? `?pwd=${meetingPassword}` : ''}`;
    navigator.clipboard.writeText(link);
    showToast('Meeting link copied to clipboard!', 'success');
    return link;
  }, [meetingId, meetingPassword, showToast]);

  const leaveMeeting = useCallback(() => {
    // Stop all tracks
    if (localStream) {
      localStream.getTracks().forEach(track => {
        track.stop();
        console.log('Stopped track:', track.kind);
      });
      setLocalStream(null);
    }
    
    if (screenStream) {
      screenStream.getTracks().forEach(track => {
        track.stop();
      });
      setScreenStream(null);
    }

    // Close all peer connections
    peerConnections.current.forEach((pc, id) => {
      pc.close();
      console.log('Closed peer connection:', id);
    });
    peerConnections.current.clear();
    
    // Close all data channels
    dataChannels.current.forEach(dc => dc.close());
    dataChannels.current.clear();
    
    // Cancel audio monitoring
    animationFrameIds.current.forEach(id => cancelAnimationFrame(id));
    animationFrameIds.current.clear();
    audioAnalyzers.current.clear();

    setIsInMeeting(false);
    setMeetingId('');
    setMeetingName('');
    setLocalParticipant(null);
    setParticipants([]);
    setShowChat(false);
    setShowParticipants(false);
    setIsScreenSharing(false);
    setIsHandRaised(false);
    setConnectionStatus('disconnected');
    setChatMessages([]);
    setUnreadMessages(0);
    
    showToast('Left meeting', 'info');
  }, [localStream, screenStream, showToast]);

  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOn(videoTrack.enabled);
        
        setParticipants(prev => prev.map(p => 
          p.id === 'local' ? { ...p, isVideoOn: videoTrack.enabled } : p
        ));
        
        if (localParticipant) {
          setLocalParticipant(prev => prev ? { ...prev, isVideoOn: videoTrack.enabled } : null);
        }
        
        showToast(videoTrack.enabled ? 'Camera turned on' : 'Camera turned off', 'info');
      }
    }
  }, [localStream, localParticipant, showToast]);

  const toggleAudio = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioOn(audioTrack.enabled);
        
        setParticipants(prev => prev.map(p => 
          p.id === 'local' ? { ...p, isAudioOn: audioTrack.enabled } : p
        ));
        
        if (localParticipant) {
          setLocalParticipant(prev => prev ? { ...prev, isAudioOn: audioTrack.enabled } : null);
        }
        
        showToast(audioTrack.enabled ? 'Microphone unmuted' : 'Microphone muted', 'info');
      }
    }
  }, [localStream, localParticipant, showToast]);

  const toggleScreenShare = useCallback(async () => {
    if (isScreenSharing) {
      if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
        setScreenStream(null);
        
        // Switch back to camera
        if (localStream) {
          peerConnections.current.forEach(pc => {
            const sender = pc.getSenders().find(s => s.track?.kind === 'video');
            if (sender && localStream.getVideoTracks()[0]) {
              sender.replaceTrack(localStream.getVideoTracks()[0]);
            }
          });
        }
      }
      setIsScreenSharing(false);
      showToast('Screen sharing stopped', 'info');
    } else {
      const stream = await initializeScreenShare();
      if (stream) {
        setIsScreenSharing(true);
      }
    }
  }, [isScreenSharing, screenStream, localStream, initializeScreenShare, showToast]);

  const copyMeetingLink = useCallback(() => {
    const link = `https://meetz.app/join/${meetingId}`;
    navigator.clipboard.writeText(link);
    showToast('Meeting link copied to clipboard!', 'success');
  }, [meetingId, showToast]);

  const sendChatMessage = useCallback(() => {
    if (!newMessage.trim()) return;
    
    try {
      const message: ChatMessage = {
        id: Date.now(),
        senderId: 'local',
        sender: localParticipant?.name || 'You',
        message: newMessage.trim(),
        timestamp: new Date(),
        type: 'text',
        reactions: {}
      };
      
      setChatMessages(prev => [...prev, message]);
      setNewMessage('');
      
      // Send through all data channels with error handling
      dataChannels.current.forEach(dc => {
        try {
          if (dc.readyState === 'open') {
            dc.send(JSON.stringify({
              type: 'chat',
              message: message
            }));
          }
        } catch (error) {
          console.error('Error sending chat message:', error);
        }
      });
      
      // Clear typing indicator
      if (typingTimeout) {
        clearTimeout(typingTimeout);
        setTypingTimeout(null);
      }
      
      // Send stop typing notification
      dataChannels.current.forEach(dc => {
        try {
          if (dc.readyState === 'open') {
            dc.send(JSON.stringify({
              type: 'typing',
              isTyping: false,
              userId: 'local'
            }));
          }
        } catch (error) {
          console.error('Error sending typing indicator:', error);
        }
      });
      
      if (!showChat) {
        setUnreadMessages(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error in sendChatMessage:', error);
      showToast('Failed to send message', 'error');
    }
  }, [newMessage, localParticipant, showChat, showToast, typingTimeout]);

  // Handle typing indicators
  const handleTyping = useCallback(() => {
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    // Send typing indicator
    dataChannels.current.forEach(dc => {
      try {
        if (dc.readyState === 'open') {
          dc.send(JSON.stringify({
            type: 'typing',
            isTyping: true,
            userId: 'local',
            userName: localParticipant?.name || 'You'
          }));
        }
      } catch (error) {
        console.error('Error sending typing indicator:', error);
      }
    });
    
    // Set timeout to stop typing
    const timeout = setTimeout(() => {
      dataChannels.current.forEach(dc => {
        try {
          if (dc.readyState === 'open') {
            dc.send(JSON.stringify({
              type: 'typing',
              isTyping: false,
              userId: 'local'
            }));
          }
        } catch (error) {
          console.error('Error sending stop typing:', error);
        }
      });
    }, 2000);
    
    setTypingTimeout(timeout);
  }, [localParticipant, typingTimeout]);

  // Add emoji reaction to message
  const addReaction = useCallback((messageId: number, emoji: string) => {
    setChatMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const reactions = { ...msg.reactions };
        if (!reactions[emoji]) {
          reactions[emoji] = [];
        }
        
        const userId = 'local';
        if (reactions[emoji].includes(userId)) {
          reactions[emoji] = reactions[emoji].filter(id => id !== userId);
          if (reactions[emoji].length === 0) {
            delete reactions[emoji];
          }
        } else {
          reactions[emoji].push(userId);
        }
        
        return { ...msg, reactions };
      }
      return msg;
    }));
    
    // Send reaction through data channels
    dataChannels.current.forEach(dc => {
      try {
        if (dc.readyState === 'open') {
          dc.send(JSON.stringify({
            type: 'reaction',
            messageId,
            emoji,
            userId: 'local'
          }));
        }
      } catch (error) {
        console.error('Error sending reaction:', error);
      }
    });
  }, []);

  const raiseHand = useCallback(() => {
    setIsHandRaised(!isHandRaised);
    
    // Broadcast hand raise
    dataChannels.current.forEach(dc => {
      if (dc.readyState === 'open') {
        dc.send(JSON.stringify({
          type: 'hand-raised',
          name: localParticipant?.name || 'You',
          raised: !isHandRaised
        }));
      }
    });
    
    showToast(isHandRaised ? 'Hand lowered' : 'Hand raised', 'info');
  }, [isHandRaised, localParticipant, showToast]);

  if (!isInMeeting) {
    return (
      <div className="min-h-screen bg-background p-6 overflow-auto">
        <div className="max-w-6xl mx-auto">
          {/* Toast Notifications */}
          <div className="fixed top-4 right-4 z-50 space-y-2">
            <AnimatePresence>
              {toasts.map(toast => (
                <motion.div
                  key={toast.id}
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 100 }}
                  className={`px-4 py-3 rounded-lg shadow-lg text-white flex items-center gap-2 min-w-[300px] ${
                    toast.type === 'success' ? 'bg-green-600' :
                    toast.type === 'error' ? 'bg-red-600' : 'bg-blue-600'
                  }`}
                >
                  {toast.type === 'success' && <CheckCircle className="w-5 h-5" />}
                  {toast.type === 'error' && <AlertCircle className="w-5 h-5" />}
                  {toast.type === 'info' && <Wifi className="w-5 h-5" />}
                  <span className="flex-1">{toast.message}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Header */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-3 mb-4"
            >
              <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-xl">
                <Video className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Meetz
              </h1>
            </motion.div>
            <p className="text-xl text-muted-foreground">
              Real-Time WebRTC Video Conferencing
            </p>
          </div>

          {/* Media Error Alert */}
          <AnimatePresence>
            {mediaError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-6"
              >
                <Alert className="bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800 dark:text-red-400">{mediaError}</AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-0 bg-card/80 backdrop-blur-xl shadow-2xl hover:shadow-3xl transition-all duration-300 cursor-pointer group overflow-hidden relative"
                    onClick={() => setShowCreateMeeting(true)}>
                <div className="absolute inset-0 bg-gradient-primary/10 group-hover:bg-gradient-primary/20 transition-all" />
                <CardHeader className="text-center pb-4 relative z-10">
                  <div className="w-20 h-20 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform">
                    <Video className="w-10 h-10 text-white" />
                  </div>
                  <CardTitle className="text-2xl">Start New Meeting</CardTitle>
                </CardHeader>
                <CardContent className="text-center relative z-10">
                  <p className="text-muted-foreground mb-6">Create an instant meeting with HD video and crystal clear audio</p>
                  <Button className="w-full gap-2 bg-gradient-primary text-white shadow-lg hover:shadow-xl">
                    <Plus className="w-5 h-5" />
                    Create Meeting
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-0 bg-card/80 backdrop-blur-xl shadow-2xl hover:shadow-3xl transition-all duration-300 group overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-primary/10 group-hover:bg-gradient-primary/20 transition-all" />
                <CardHeader className="text-center pb-4 relative z-10">
                  <div className="w-20 h-20 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform">
                    <Link2 className="w-10 h-10 text-white" />
                  </div>
                  <CardTitle className="text-2xl">Join Meeting</CardTitle>
                </CardHeader>
                <CardContent className="text-center relative z-10">
                  <p className="text-muted-foreground mb-6">Enter a meeting ID with password to join</p>
                  <Button 
                    onClick={() => setShowJoinMeeting(true)} 
                    className="w-full bg-gradient-primary text-white shadow-lg py-3"
                  >
                    <Link2 className="w-4 h-4 mr-2" />
                    Join Meeting
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
          >
            {[
              { icon: Video, label: 'HD Video', color: 'from-blue-500 to-cyan-500' },
              { icon: Mic, label: 'Crystal Audio', color: 'from-purple-500 to-pink-500' },
              { icon: ScreenShare, label: 'Screen Share', color: 'from-green-500 to-emerald-500' },
              { icon: MessageSquare, label: 'Live Chat', color: 'from-orange-500 to-red-500' }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="bg-card/80 backdrop-blur-xl rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-all"
              >
                <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center mx-auto mb-3`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <p className="font-medium text-gray-700 dark:text-gray-300">{feature.label}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Recent Meetings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="border-0 bg-card/80 backdrop-blur-xl shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Clock className="w-6 h-6 text-blue-500" />
                  Recent Meetings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: 'Team Standup', time: '2 hours ago', participants: 5, duration: '45 min' },
                    { name: 'Project Review', time: 'Yesterday', participants: 8, duration: '1h 20min' },
                    { name: 'Client Presentation', time: '2 days ago', participants: 12, duration: '2h 15min' }
                  ].map((meeting, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-xl hover:from-blue-50 hover:to-indigo-50 dark:hover:from-gray-600 dark:hover:to-blue-900 cursor-pointer transition-all duration-300 group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <Video className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-lg">{meeting.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {meeting.time} • {meeting.participants} participants • {meeting.duration}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="gap-2 hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all">
                        <Video className="w-4 h-4" />
                        Join Again
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Create Meeting Dialog */}
        <Dialog open={showCreateMeeting} onOpenChange={(open) => {
          setShowCreateMeeting(open);
          if (!open) {
            stopCameraPreview();
            setShowPreview(false);
          }
        }}>
          <DialogContent className="max-w-2xl bg-card text-card-foreground">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Video className="w-6 h-6 text-blue-500" />
                Create New Meeting
              </DialogTitle>
              <DialogDescription>
                Set up a secure video meeting room with camera preview and password protection.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Meeting Settings */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Meeting Name (Optional)</label>
                  <input
                    type="text"
                    value={newMeetingName}
                    onChange={(e) => setNewMeetingName(e.target.value)}
                    placeholder="e.g., Team Standup"
                    className="w-full px-4 py-3 border-2 rounded-lg bg-card border-border focus:border-primary focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Meeting Password</label>
                  <input
                    type="text"
                    value={meetingPassword}
                    onChange={(e) => setMeetingPassword(e.target.value)}
                    placeholder="Auto-generated if empty"
                    className="w-full px-4 py-3 border-2 rounded-lg bg-card border-border focus:border-primary focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Require Password</label>
                    <input
                      type="checkbox"
                      checked={requirePassword}
                      onChange={(e) => setRequirePassword(e.target.checked)}
                      className="rounded"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Require Host Approval</label>
                    <input
                      type="checkbox"
                      checked={requireApproval}
                      onChange={(e) => setRequireApproval(e.target.checked)}
                      className="rounded"
                    />
                  </div>
                </div>
                
                {videoDevices.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Camera</label>
                    <select
                      value={selectedVideoDevice}
                      onChange={(e) => setSelectedVideoDevice(e.target.value)}
                      className="w-full px-4 py-3 border-2 rounded-lg bg-card border-border focus:border-primary focus:outline-none transition-colors"
                    >
                      {videoDevices.map(device => (
                        <option key={device.deviceId} value={device.deviceId}>
                          {device.label || `Camera ${device.deviceId.slice(0, 5)}`}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                
                {audioDevices.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Microphone</label>
                    <select
                      value={selectedAudioDevice}
                      onChange={(e) => setSelectedAudioDevice(e.target.value)}
                      className="w-full px-4 py-3 border-2 rounded-lg bg-card border-border focus:border-primary focus:outline-none transition-colors"
                    >
                      {audioDevices.map(device => (
                        <option key={device.deviceId} value={device.deviceId}>
                          {device.label || `Microphone ${device.deviceId.slice(0, 5)}`}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Camera Preview */}
              <div className="space-y-4">
                <label className="block text-sm font-medium">Camera Preview</label>
                <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                  {showPreview ? (
                    <video
                      ref={previewVideoRef}
                      autoPlay
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-card">
                      <Camera className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                  
                  <div className="absolute bottom-2 left-2 right-2 flex gap-2">
                    <Button
                      size="sm"
                      variant={showPreview ? "destructive" : "default"}
                      onClick={() => {
                        if (showPreview) {
                          stopCameraPreview();
                          setShowPreview(false);
                        } else {
                          initializeCameraPreview();
                          setShowPreview(true);
                        }
                      }}
                      className="flex-1"
                    >
                      {showPreview ? (
                        <>
                          <CameraOff className="w-4 h-4 mr-2" />
                          Stop Preview
                        </>
                      ) : (
                        <>
                          <Camera className="w-4 h-4 mr-2" />
                          Test Camera
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                
                {mediaError && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-red-600">
                      {mediaError}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
            
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setShowCreateMeeting(false)}>
                Cancel
              </Button>
              <Button 
                onClick={createMeeting} 
                className="gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                disabled={isInitializing}
              >
                {isInitializing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Initializing...
                  </>
                ) : (
                  <>
                    <Video className="w-4 h-4" />
                    Start Meeting
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Join Meeting Dialog */}
        <Dialog open={showJoinMeeting} onOpenChange={(open) => {
          setShowJoinMeeting(open);
          if (!open) {
            stopCameraPreview();
            setShowPreview(false);
          }
        }}>
          <DialogContent className="max-w-2xl bg-white dark:bg-gray-800">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Link2 className="w-6 h-6 text-blue-500" />
                Join Meeting
              </DialogTitle>
              <DialogDescription>
                Enter the meeting ID and password to join the meeting with camera preview.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Join Settings */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Meeting ID</label>
                  <input
                    type="text"
                    value={joinMeetingId}
                    onChange={(e) => setJoinMeetingId(e.target.value.toUpperCase())}
                    placeholder="e.g., ABCD123456"
                    className="w-full px-4 py-3 border-2 rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:border-blue-500 focus:outline-none transition-colors"
                    maxLength={10}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Password</label>
                  <input
                    type="password"
                    value={joinPassword}
                    onChange={(e) => setJoinPassword(e.target.value)}
                    placeholder="Enter meeting password"
                    className="w-full px-4 py-3 border-2 rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>
                
                {videoDevices.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Camera</label>
                    <select
                      value={selectedVideoDevice}
                      onChange={(e) => setSelectedVideoDevice(e.target.value)}
                      className="w-full px-4 py-3 border-2 rounded-lg bg-card border-border focus:border-primary focus:outline-none transition-colors"
                    >
                      {videoDevices.map(device => (
                        <option key={device.deviceId} value={device.deviceId}>
                          {device.label || `Camera ${device.deviceId.slice(0, 5)}`}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                
                {audioDevices.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Microphone</label>
                    <select
                      value={selectedAudioDevice}
                      onChange={(e) => setSelectedAudioDevice(e.target.value)}
                      className="w-full px-4 py-3 border-2 rounded-lg bg-card border-border focus:border-primary focus:outline-none transition-colors"
                    >
                      {audioDevices.map(device => (
                        <option key={device.deviceId} value={device.deviceId}>
                          {device.label || `Microphone ${device.deviceId.slice(0, 5)}`}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Camera Preview */}
              <div className="space-y-4">
                <label className="block text-sm font-medium">Camera Preview</label>
                <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                  {showPreview ? (
                    <video
                      ref={previewVideoRef}
                      autoPlay
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-card">
                      <Camera className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                  
                  <div className="absolute bottom-2 left-2 right-2 flex gap-2">
                    <Button
                      size="sm"
                      variant={showPreview ? "destructive" : "default"}
                      onClick={() => {
                        if (showPreview) {
                          stopCameraPreview();
                          setShowPreview(false);
                        } else {
                          initializeCameraPreview();
                          setShowPreview(true);
                        }
                      }}
                      className="flex-1"
                    >
                      {showPreview ? (
                        <>
                          <CameraOff className="w-4 h-4 mr-2" />
                          Stop Preview
                        </>
                      ) : (
                        <>
                          <Camera className="w-4 h-4 mr-2" />
                          Test Camera
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                
                {mediaError && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-red-600">
                      {mediaError}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
            
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setShowJoinMeeting(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => joinMeeting(joinMeetingId, joinPassword)} 
                className="gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white"
                disabled={!joinMeetingId.trim() || !joinPassword.trim() || isInitializing}
              >
                {isInitializing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Joining...
                  </>
                ) : (
                  <>
                    <Link2 className="w-4 h-4" />
                    Join Meeting
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // In-meeting UI
  return (
    <div className={`h-screen bg-background text-foreground flex flex-col ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100 }}
              className={`px-4 py-3 rounded-lg shadow-lg text-white flex items-center gap-2 min-w-[300px] ${
                toast.type === 'success' ? 'bg-green-600' :
                toast.type === 'error' ? 'bg-red-600' : 'bg-blue-600'
              }`}
            >
              {toast.type === 'success' && <CheckCircle className="w-5 h-5" />}
              {toast.type === 'error' && <AlertCircle className="w-5 h-5" />}
              {toast.type === 'info' && <Wifi className="w-5 h-5" />}
              <span className="flex-1">{toast.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

  {/* Meeting Header */}
  <div className="bg-card px-6 py-4 flex items-center justify-between border-b border-border shadow-lg">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Video className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg">{meetingName}</h2>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{new Date().toLocaleTimeString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  {connectionStatus === 'connected' ? (
                    <>
                      <Wifi className="w-3 h-3 text-green-400" />
                      <span className="text-green-400">Connected</span>
                    </>
                  ) : connectionStatus === 'connecting' ? (
                    <>
                      <Loader2 className="w-3 h-3 text-yellow-400 animate-spin" />
                      <span className="text-yellow-400">Connecting...</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-3 h-3 text-red-400" />
                      <span className="text-red-400">Disconnected</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={copyMeetingLink}
            className="gap-2 text-white border-border hover:bg-card hover:border-border"
          >
            <Share2 className="w-4 h-4" />
            Share Link
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="text-white border-border hover:bg-card hover:border-border"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Video Grid */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className={`h-full ${
          gridView 
            ? participants.length === 1 ? 'flex items-center justify-center' :
              participants.length === 2 ? 'grid grid-cols-2 gap-4' :
              participants.length <= 4 ? 'grid grid-cols-2 gap-4' :
              participants.length <= 9 ? 'grid grid-cols-3 gap-4' :
              'grid grid-cols-4 gap-4'
            : 'flex flex-col gap-4'
        }`}>
          {participants.map((participant) => (
            <motion.div
              key={participant.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`relative bg-card rounded-xl overflow-hidden shadow-2xl ${
                participants.length === 1 ? 'w-full max-w-4xl aspect-video' : 'aspect-video'
              }`}
            >
              {participant.id === 'local' ? (
                participant.isVideoOn ? (
                  <video
                    ref={localVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover transform scale-x-[-1]"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-primary flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-24 h-24 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-4xl font-bold text-white">{participant.avatar}</span>
                      </div>
                      <CameraOff className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-muted-foreground font-medium">Camera off</p>
                    </div>
                  </div>
                )
              ) : participant.stream ? (
                <video
                  ref={(el) => {
                    if (el) {
                      participantVideoRefs.current.set(participant.id, el);
                      el.srcObject = participant.stream || null;
                    }
                  }}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : participant.isVideoOn ? (
                <div className="w-full h-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
                  <div className="text-6xl font-bold text-white drop-shadow-lg">{participant.avatar}</div>
                </div>
                ) : (
                <div className="w-full h-full bg-card flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl font-bold text-white">{participant.avatar}</span>
                    </div>
                    <CameraOff className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-muted-foreground font-medium">Camera off</p>
                  </div>
                </div>
              )}
              
              {/* Screen sharing indicator */}
              {participant.isScreenSharing && (
                <div className="absolute top-3 right-3 px-3 py-1.5 bg-green-500 rounded-lg flex items-center gap-1.5 shadow-lg">
                  <Monitor className="w-4 h-4" />
                  <span className="text-sm font-medium">Presenting</span>
                </div>
              )}
              
              {/* Participant info overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{participant.name}</span>
                    {participant.isHost && (
                      <div className="px-2 py-0.5 bg-yellow-500 rounded-full flex items-center gap-1">
                        <Crown className="w-3 h-3" />
                        <span className="text-xs font-medium">Host</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {participant.isAudioOn ? (
                      <motion.div
                        animate={{ 
                          scale: participant.audioLevel > 0.1 ? [1, 1.3, 1] : 1,
                          opacity: participant.audioLevel > 0.1 ? 1 : 0.7
                        }}
                        transition={{ duration: 0.3 }}
                        className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center relative"
                      >
                        <Volume2 className="w-4 h-4" />
                        {participant.audioLevel > 0.1 && (
                          <motion.div
                            className="absolute inset-0 bg-green-400 rounded-full"
                            initial={{ scale: 1, opacity: 0.5 }}
                            animate={{ scale: 1.5, opacity: 0 }}
                            transition={{ repeat: Infinity, duration: 1 }}
                          />
                        )}
                      </motion.div>
                    ) : (
                      <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                        <MicOff className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Screen Share Preview */}
      <AnimatePresence>
        {isScreenSharing && screenStream && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-24 right-6 w-80 aspect-video bg-card rounded-lg overflow-hidden shadow-2xl border-2 border-green-500 z-40"
          >
            <video
              ref={screenVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 left-2 px-2 py-1 bg-green-500 rounded flex items-center gap-1 text-xs font-medium">
              <Monitor className="w-3 h-3" />
              Your Screen
            </div>
            <Button
              size="sm"
              variant="destructive"
              className="absolute top-2 right-2"
              onClick={toggleScreenShare}
            >
              <X className="w-4 h-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Meeting Controls */}
  <div className="bg-card px-6 py-5 border-t border-border shadow-2xl">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          {/* Left controls */}
          <div className="flex items-center gap-3">
            <Button
              variant={isAudioOn ? "default" : "destructive"}
              size="lg"
              onClick={toggleAudio}
              className="gap-2 h-12 px-6 rounded-xl shadow-lg hover:scale-105 transition-transform"
            >
              {isAudioOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              <span className="hidden sm:inline">{isAudioOn ? 'Mute' : 'Unmute'}</span>
            </Button>
            
            <Button
              variant={isVideoOn ? "default" : "destructive"}
              size="lg"
              onClick={toggleVideo}
              className="gap-2 h-12 px-6 rounded-xl shadow-lg hover:scale-105 transition-transform"
            >
              {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              <span className="hidden sm:inline">{isVideoOn ? 'Stop Video' : 'Start Video'}</span>
            </Button>
            
            <Button
              variant={isScreenSharing ? "default" : "outline"}
              size="lg"
              onClick={toggleScreenShare}
              className="gap-2 h-12 px-6 rounded-xl border-gray-600 hover:border-gray-500 shadow-lg hover:scale-105 transition-transform"
            >
              {isScreenSharing ? <ScreenShareOff className="w-5 h-5" /> : <ScreenShare className="w-5 h-5" />}
              <span className="hidden sm:inline">{isScreenSharing ? 'Stop Sharing' : 'Share'}</span>
            </Button>
          </div>

          {/* Center controls */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                setShowParticipants(!showParticipants);
                setShowChat(false);
              }}
              className="gap-2 h-12 px-6 rounded-xl border-gray-600 hover:border-gray-500 hover:bg-gray-700 shadow-lg hover:scale-105 transition-transform"
            >
              <Users className="w-5 h-5" />
              <span>{participants.length}</span>
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                setShowChat(!showChat);
                setShowParticipants(false);
                if (!showChat) setUnreadMessages(0);
              }}
              className="gap-2 h-12 px-6 rounded-xl border-gray-600 hover:border-gray-500 hover:bg-gray-700 shadow-lg hover:scale-105 transition-transform relative"
            >
              <MessageSquare className="w-5 h-5" />
              <span className="hidden sm:inline">Chat</span>
              {unreadMessages > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full text-xs flex items-center justify-center font-bold shadow-lg"
                >
                  {unreadMessages}
                </motion.span>
              )}
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              onClick={() => setGridView(!gridView)}
              className="h-12 px-4 rounded-xl border-gray-600 hover:border-gray-500 hover:bg-gray-700 shadow-lg hover:scale-105 transition-transform"
            >
              <Grid3x3 className="w-5 h-5" />
            </Button>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-3">
            <Button
              variant={isHandRaised ? "default" : "outline"}
              size="lg"
              onClick={raiseHand}
              className={`h-12 px-4 rounded-xl border-gray-600 hover:border-gray-500 shadow-lg hover:scale-105 transition-transform ${
                isHandRaised ? 'bg-yellow-500 hover:bg-yellow-600' : ''
              }`}
            >
              <Hand className={`w-5 h-5 ${isHandRaised ? 'animate-bounce' : ''}`} />
            </Button>
            
            <Button
              variant="destructive"
              size="lg"
              onClick={leaveMeeting}
              className="gap-2 h-12 px-6 rounded-xl shadow-lg hover:scale-105 transition-transform bg-red-600 hover:bg-red-700"
            >
              <PhoneOff className="w-5 h-5" />
              <span className="hidden sm:inline">Leave</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Chat Sidebar */}
      <AnimatePresence>
        {showChat && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-96 bg-card border-l border-border flex flex-col shadow-2xl z-40"
          >
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-400" />
                Meeting Chat
                {unreadMessages > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {unreadMessages}
                  </span>
                )}
              </h3>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => setShowChatSearch(!showChatSearch)}
                  className="hover:bg-gray-700 text-gray-400 hover:text-white"
                  title="Search messages"
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setShowChat(false)} className="hover:bg-card">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {/* Chat Search */}
            {showChatSearch && (
              <div className="p-3 border-b border-border bg-card">
                <input
                  type="text"
                  value={chatSearchQuery}
                  onChange={(e) => setChatSearchQuery(e.target.value)}
                  placeholder="Search messages..."
                  className="w-full px-3 py-2 bg-card border border-border rounded-lg text-muted-foreground placeholder:muted-foreground focus:border-primary focus:outline-none text-sm"
                />
              </div>
            )}
            
            <div 
              ref={chatContainerRef} 
              className="flex-1 overflow-y-auto p-5 space-y-4 relative"
              onScroll={(e) => {
                const container = e.target as HTMLDivElement;
                const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
                setShowScrollButton(!isNearBottom && chatMessages.length > 5);
              }}
            >
              {(() => {
                const filteredMessages = chatSearchQuery 
                  ? chatMessages.filter(msg => 
                      msg.message.toLowerCase().includes(chatSearchQuery.toLowerCase()) ||
                      msg.sender.toLowerCase().includes(chatSearchQuery.toLowerCase())
                    )
                  : chatMessages;
                  
                return filteredMessages.length === 0 ? (
                  <div className="text-center text-gray-400 mt-20">
                    <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p className="text-lg">
                      {chatSearchQuery ? 'No messages match your search' : 'No messages yet'}
                    </p>
                    <p className="text-sm mt-2">
                      {chatSearchQuery ? 'Try a different search term' : 'Start the conversation!'}
                    </p>
                  </div>
                ) : (
                  <>
                    {filteredMessages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`group relative ${
                        msg.senderId === 'local' ? 'flex justify-end' : 'flex justify-start'
                      }`}
                    >
                      <div className={`max-w-[80%] rounded-2xl p-4 shadow-lg ${
                        msg.senderId === 'local' 
                          ? 'bg-gradient-primary text-white' 
                          : 'bg-card text-muted-foreground'
                      }`}>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`font-semibold text-sm ${
                            msg.senderId === 'local' ? 'text-blue-100' : 'text-blue-400'
                          }`}>
                            {msg.sender}
                          </span>
                          <span className="text-xs text-gray-300 opacity-75">
                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        
                        {msg.type === 'file' ? (
                          <div className="flex items-center gap-3 p-3 bg-black/20 rounded-lg">
                            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                              {msg.fileName?.endsWith('.pdf') ? <FileText className="w-5 h-5" /> :
                               msg.fileName?.match(/\.(jpg|jpeg|png|gif)$/i) ? <Image className="w-5 h-5" /> :
                               <Paperclip className="w-5 h-5" />}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{msg.fileName}</p>
                              <p className="text-xs opacity-75">{msg.fileSize ? `${(msg.fileSize / 1024).toFixed(1)} KB` : ''}</p>
                            </div>
                            <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <p className="text-sm break-words leading-relaxed">{msg.message}</p>
                        )}
                        
                        {/* Reactions */}
                        {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {Object.entries(msg.reactions).map(([emoji, users]) => (
                              <button
                                key={emoji}
                                onClick={() => addReaction(msg.id, emoji)}
                                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-all hover:scale-110 ${
                                  users.includes('local') 
                                    ? 'bg-yellow-500/30 border border-yellow-500/50' 
                                    : 'bg-white/10 hover:bg-white/20'
                                }`}
                              >
                                <span>{emoji}</span>
                                <span>{users.length}</span>
                              </button>
                            ))}
                          </div>
                        )}
                        
                        {/* Quick reactions on hover */}
                        <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex bg-card rounded-full p-1 shadow-lg border border-border">
                            {['👍', '❤️', '😄', '😮', '😢', '😡'].map(emoji => (
                              <button
                                key={emoji}
                                onClick={() => addReaction(msg.id, emoji)}
                                className="w-8 h-8 rounded-full hover:bg-card transition-colors flex items-center justify-center text-sm"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  
                  {/* Typing Indicators */}
                  {Object.entries(isTyping).filter(([userId, typing]) => typing && userId !== 'local').length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-start"
                    >
                      <div className="bg-card rounded-2xl p-4 max-w-[80%]">
                        <div className="flex items-center gap-2">
                          <div className="flex space-x-1">
                            {[0, 1, 2].map((i) => (
                              <motion.div
                                key={i}
                                className="w-2 h-2 bg-blue-400 rounded-full"
                                animate={{ scale: [1, 1.5, 1] }}
                                transition={{ 
                                  duration: 1, 
                                  repeat: Infinity, 
                                  delay: i * 0.2 
                                }}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-400">
                            {Object.entries(isTyping)
                              .filter(([userId, typing]) => typing && userId !== 'local')
                              .map(([userId]) => participants.find(p => p.id === userId)?.name || 'Someone')
                              .join(', ')} typing...
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </>
              );
            })()}
            
            {/* Scroll to bottom button */}
            {showScrollButton && (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                onClick={() => {
                  if (chatContainerRef.current) {
                    chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
                  }
                }}
                className="absolute bottom-4 right-4 w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center shadow-lg transition-colors z-10"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </motion.button>
            )}
          </div>
            
            <div className="p-5 border-t border-gray-700 bg-gray-800 space-y-3">
              {/* File upload area */}
              <div className="hidden">
                <input
                  type="file"
                  id="chat-file-input"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      // Handle file upload
                      const message: ChatMessage = {
                        id: Date.now(),
                        senderId: 'local',
                        sender: localParticipant?.name || 'You',
                        message: `Shared a file: ${file.name}`,
                        timestamp: new Date(),
                        type: 'file',
                        fileName: file.name,
                        fileSize: file.size,
                        reactions: {}
                      };
                      setChatMessages(prev => [...prev, message]);
                      e.target.value = '';
                    }
                  }}
                  accept="image/*,.pdf,.doc,.docx,.txt"
                />
              </div>
              
              {/* Emoji Picker */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {['😀', '😂', '😍', '🤔', '👍', '👎', '❤️', '🎉', '🔥', '💯'].map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => setNewMessage(prev => prev + emoji)}
                    className="flex-shrink-0 w-8 h-8 rounded-full hover:bg-gray-700 transition-colors flex items-center justify-center text-lg"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              
              {/* Message input */}
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => document.getElementById('chat-file-input')?.click()}
                  className="hover:bg-gray-700 text-gray-400 hover:text-white"
                  title="Share file"
                >
                  <Paperclip className="w-4 h-4" />
                </Button>
                
                <div className="flex-1 relative">
                          <input
                    ref={chatInputRef}
                    type="text"
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      if (e.target.value.trim()) {
                        handleTyping();
                      }
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendChatMessage();
                      }
                    }}
                    placeholder="Type a message..."
                    className="w-full px-4 py-3 pr-12 bg-card border border-border rounded-lg text-muted-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors resize-none"
                    maxLength={1000}
                  />
                  
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
                    {newMessage.length}/1000
                  </div>
                </div>
                
                <Button 
                  size="lg" 
                  onClick={sendChatMessage}
                  className={`px-6 rounded-lg shadow-lg transition-all ${
                    newMessage.trim() 
                      ? 'bg-primary hover:bg-primary-600 text-white' 
                      : 'bg-card text-muted-foreground cursor-not-allowed'
                  }`}
                  disabled={!newMessage.trim()}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Chat stats */}
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>{chatMessages.length} messages</span>
                <span>Press Enter to send, Shift+Enter for new line</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Participants Sidebar */}
      <AnimatePresence>
        {showParticipants && (
          <motion.div
            initial={{ x: -400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -400, opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed left-0 top-0 bottom-0 w-96 bg-gray-800 border-r border-gray-700 flex flex-col shadow-2xl z-40"
          >
            <div className="p-5 border-b border-gray-700 flex items-center justify-between">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" />
                Participants ({participants.length})
              </h3>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setShowInviteDialog(true)} 
                  className="gap-1 border-gray-600 hover:bg-gray-700"
                >
                  <UserPlus className="w-4 h-4" />
                  Invite
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setShowParticipants(false)} className="hover:bg-gray-700">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {participants.map((participant) => (
                <motion.div
                  key={participant.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-700 transition-all cursor-pointer group"
                >
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center text-lg font-bold shadow-lg">
                      {participant.avatar}
                    </div>
                    {participant.audioLevel > 0.1 && participant.isAudioOn && (
                      <motion.div
                        className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-gray-800"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                      >
                        <Volume2 className="w-3 h-3" />
                      </motion.div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold truncate">{participant.name}</span>
                      {participant.isHost && (
                        <div className="px-2 py-0.5 bg-yellow-500 rounded-full flex items-center gap-1">
                          <Crown className="w-3 h-3" />
                          <span className="text-xs font-medium">Host</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {!participant.isAudioOn && (
                        <div className="flex items-center gap-1 text-xs text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">
                          <MicOff className="w-3 h-3" />
                          <span>Muted</span>
                        </div>
                      )}
                      {!participant.isVideoOn && (
                        <div className="flex items-center gap-1 text-xs text-gray-400 bg-gray-700 px-2 py-0.5 rounded-full">
                          <VideoOff className="w-3 h-3" />
                          <span>No video</span>
                        </div>
                      )}
                      {participant.isScreenSharing && (
                        <div className="flex items-center gap-1 text-xs text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">
                          <Monitor className="w-3 h-3" />
                          <span>Presenting</span>
                        </div>
                      )}
                      {participant.isAudioOn && participant.isVideoOn && !participant.isScreenSharing && (
                        <div className="flex items-center gap-1 text-xs text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">
                          <CheckCircle className="w-3 h-3" />
                          <span>Active</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {isAdmin && participant.id !== 'local' && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => muteParticipant(participant.id)}
                        className="hover:bg-gray-600 text-red-400 hover:text-red-300"
                        title="Mute participant"
                      >
                        <MicOff className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => removeParticipant(participant.id)}
                        className="hover:bg-gray-600 text-red-400 hover:text-red-300"
                        title="Remove participant"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                  {!isAdmin && (
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-600"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  )}
                </motion.div>
              ))}
              
              {/* Waiting Room for Admin */}
              {isAdmin && waitingRoom.length > 0 && (
                <div className="border-t border-gray-700 pt-4 mt-4">
                  <h4 className="font-semibold text-sm text-yellow-400 mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Waiting Room ({waitingRoom.length})
                  </h4>
                  {waitingRoom.map((participant) => (
                    <motion.div
                      key={participant.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 mb-2"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-sm font-bold">
                        {participant.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-medium truncate">{participant.name}</span>
                        <p className="text-xs text-gray-400">Waiting for approval</p>
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          onClick={() => approveParticipant(participant.id)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                          title="Admit to meeting"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => denyParticipant(participant.id)}
                          className="hover:bg-red-600 text-red-400 hover:text-red-300"
                          title="Deny access"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Invite Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="max-w-md bg-gray-800 text-white border-gray-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Share2 className="w-6 h-6 text-blue-400" />
              Invite to Meeting
            </DialogTitle>
            <DialogDescription>
              Share the meeting link or send email invitations to participants.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Meeting Link</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={`${window.location.origin}/meeting/${meetingId}${meetingPassword ? `?pwd=${meetingPassword}` : ''}`}
                  readOnly
                  className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
                />
                <Button onClick={generateMeetingLink} className="bg-blue-600 hover:bg-blue-700">
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Meeting ID</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={meetingId}
                    readOnly
                    className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white font-mono text-lg"
                  />
                  <Button 
                    onClick={() => {
                      navigator.clipboard.writeText(meetingId);
                      showToast('Meeting ID copied!', 'success');
                    }} 
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              {meetingPassword && (
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Password</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={meetingPassword}
                      readOnly
                      className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white font-mono"
                    />
                    <Button 
                      onClick={() => {
                        navigator.clipboard.writeText(meetingPassword);
                        showToast('Password copied!', 'success');
                      }} 
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <p className="text-sm text-gray-300">
                Share this information with others to invite them to join. {isAdmin ? 'As the host, you can approve participants from the waiting room.' : ''}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInviteDialog(false)} className="border-gray-600 hover:bg-gray-700">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MeetzMeeting;