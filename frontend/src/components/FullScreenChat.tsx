import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle, Send, Search, Phone, Video, MoreVertical,
  Paperclip, Smile, Image, File, Users, User, Circle,
  CheckCheck, Check, Pin, Archive, Trash2, Edit3,
  Clock, Star, Hash, AtSign, Bell, BellOff, Plus,
  Minimize2, Maximize2, Settings, UserPlus, Volume2,
  VolumeX, Camera, CameraOff, Share2, Download,
  ArrowLeft, Filter, SortAsc, Eye, EyeOff, Reply,
  Heart, Zap, Coffee, X, Mic, MicOff, Info,
  ChevronDown, ChevronRight, Type, Bold, Italic,
  Code, Link, List, Quote, Calendar, MapPin,
  TrendingUp, Activity, Shield, Crown, Palette,
  Monitor, Smartphone, Moon, Sun, Headphones, Upload,
  Wifi, WifiOff, Signal, Radio, CheckCircle2,
  AlertCircle, Loader2, Globe, Network, Users2, 
  Layers, Target, ArrowRight, Mouse, Play
} from 'lucide-react';

// Real-time connection interface
interface RTCConnection {
  id: string;
  peerConnection: RTCPeerConnection;
  dataChannel: RTCDataChannel | null;
  status: 'connecting' | 'connected' | 'disconnected' | 'failed';
  latency: number;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
}

// Real-time event types
interface RTCEvent {
  type: 'message' | 'typing' | 'reaction' | 'presence' | 'cursor' | 'activity';
  data: any;
  timestamp: Date;
  userId: string;
}

// Cursor position interface
interface CursorPosition {
  userId: string;
  x: number;
  y: number;
  timestamp: Date;
  color: string;
}

interface Message {
  id: string;
  content: string;
  sender: string;
  senderId: string;
  timestamp: Date;
  editedAt?: Date;
  type: 'text' | 'image' | 'file' | 'system' | 'voice' | 'code' | 'poll';
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  reactions?: { emoji: string; users: string[]; timestamp: Date }[];
  replyTo?: string;
  mentions?: string[];
  attachments?: { name: string; size: string; type: string; url: string }[];
  isEdited?: boolean;
  isPinned?: boolean;
  isForwarded?: boolean;
  threadReplies?: number;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

interface ChatUser {
  id: string;
  name: string;
  username?: string;
  avatar: string;
  status: 'online' | 'away' | 'busy' | 'offline' | 'focus';
  lastSeen?: Date;
  role?: string;
  isTyping?: boolean;
  customStatus?: string;
  timezone?: string;
  device?: 'desktop' | 'mobile' | 'web';
  permissions?: ('admin' | 'moderator' | 'member')[];
}

interface Channel {
  id: string;
  name: string;
  type: 'direct' | 'group' | 'channel' | 'announcement' | 'private';
  participants: string[];
  admins: string[];
  unreadCount: number;
  lastMessage?: Message;
  isMuted: boolean;
  isPinned: boolean;
  isArchived?: boolean;
  description?: string;
  topic?: string;
  createdAt: Date;
  avatar?: string;
  isEncrypted?: boolean;
  autoDelete?: number; // hours
  memberCount?: number;
  tags?: string[];
}

const FullScreenChat: React.FC = () => {
  const [activeChannel, setActiveChannel] = useState<string>('general');
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showUserPanel, setShowUserPanel] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [messageFilter, setMessageFilter] = useState<'all' | 'unread' | 'mentions' | 'starred'>('all');
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('light');
  const [notifications, setNotifications] = useState(true);
  const [showThreads, setShowThreads] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [messageOptions, setMessageOptions] = useState<string | null>(null);
  const [showChannelInfo, setShowChannelInfo] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  
  // Real-time states
  const [rtcConnections, setRtcConnections] = useState<Map<string, RTCConnection>>(new Map());
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const [networkQuality, setNetworkQuality] = useState<'excellent' | 'good' | 'fair' | 'poor'>('excellent');
  const [cursorPositions, setCursorPositions] = useState<Map<string, CursorPosition>>(new Map());
  const [liveActivities, setLiveActivities] = useState<Map<string, string>>(new Map());
  const [realTimeTyping, setRealTimeTyping] = useState<Map<string, Date>>(new Map());
  const [messageDeliveryStatus, setMessageDeliveryStatus] = useState<Map<string, 'sending' | 'sent' | 'delivered' | 'read'>>(new Map());
  const [bandwidthStats, setBandwidthStats] = useState({ upload: 0, download: 0, latency: 0 });
  const [onlinePresence, setOnlinePresence] = useState<Map<string, { status: string, lastSeen: Date }>>(new Map());
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const rtcDataChannels = useRef<Map<string, RTCDataChannel>>(new Map());
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);
  const cursorUpdateInterval = useRef<NodeJS.Timeout | null>(null);

  // Real-time performance monitoring
  const [performanceMetrics, setPerformanceMetrics] = useState({
    messageLatency: 0,
    connectionStability: 100,
    dataChannelThroughput: 0,
    activeConnections: 0,
    lastUpdate: new Date()
  });

  // Monitor performance metrics
  useEffect(() => {
    const performanceInterval = setInterval(() => {
      setPerformanceMetrics({
        messageLatency: bandwidthStats.latency,
        connectionStability: Math.max(0, 100 - (bandwidthStats.latency / 10)),
        dataChannelThroughput: bandwidthStats.upload + bandwidthStats.download,
        activeConnections: rtcConnections.size,
        lastUpdate: new Date()
      });
    }, 2000);

    return () => clearInterval(performanceInterval);
  }, [bandwidthStats, rtcConnections.size]);

  // Simulate bandwidth updates
  useEffect(() => {
    const bandwidthInterval = setInterval(() => {
      if (connectionStatus === 'connected') {
        setBandwidthStats(prev => ({
          ...prev,
          upload: Math.random() * 1024 * 10, // Random upload in bytes
          download: Math.random() * 1024 * 15, // Random download in bytes
        }));
      }
    }, 3000);

    return () => clearInterval(bandwidthInterval);
  }, [connectionStatus]);

  // Enhanced emoji options
  const commonEmojis = ['👍', '❤️', '😂', '😮', '😢', '😡', '🎉', '🚀', '💯', '🔥', '⭐', '✅'];
  
  // Real-time connection management
  const initializeRTCConnection = useCallback(async (userId: string) => {
    try {
      const peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });

      // Create data channel for real-time communication
      const dataChannel = peerConnection.createDataChannel('chat', {
        ordered: true,
        maxRetransmits: 3
      });

      dataChannel.onopen = () => {
        console.log('Data channel opened for user:', userId);
        setConnectionStatus('connected');
        rtcDataChannels.current.set(userId, dataChannel);
      };

      dataChannel.onmessage = (event) => {
        const rtcEvent: RTCEvent = JSON.parse(event.data);
        handleRTCEvent(rtcEvent);
      };

      dataChannel.onerror = (error) => {
        console.error('Data channel error:', error);
        setNetworkQuality('poor');
      };

      peerConnection.onconnectionstatechange = () => {
        const state = peerConnection.connectionState;
        if (state === 'connected') {
          setConnectionStatus('connected');
          measureLatency(dataChannel);
        } else if (state === 'disconnected' || state === 'failed') {
          setConnectionStatus('disconnected');
          reconnectRTC(userId);
        }
      };

      const connection: RTCConnection = {
        id: userId,
        peerConnection,
        dataChannel,
        status: 'connecting',
        latency: 0,
        quality: 'excellent'
      };

      setRtcConnections(prev => new Map(prev).set(userId, connection));
      return connection;
    } catch (error) {
      console.error('Failed to initialize RTC connection:', error);
      setConnectionStatus('disconnected');
      return null;
    }
  }, []);

  // Handle real-time events
  const handleRTCEvent = useCallback((event: RTCEvent) => {
    switch (event.type) {
      case 'message':
        setMessages(prev => [...prev, event.data]);
        setMessageDeliveryStatus(prev => new Map(prev).set(event.data.id, 'delivered'));
        break;
      case 'typing':
        if (event.data.isTyping) {
          setRealTimeTyping(prev => new Map(prev).set(event.userId, new Date()));
          setTypingUsers(prev => [...prev.filter(u => u !== event.userId), event.userId]);
        } else {
          setRealTimeTyping(prev => {
            const newMap = new Map(prev);
            newMap.delete(event.userId);
            return newMap;
          });
          setTypingUsers(prev => prev.filter(u => u !== event.userId));
        }
        break;
      case 'reaction':
        setMessages(prev => prev.map(msg => 
          msg.id === event.data.messageId 
            ? { ...msg, reactions: [...(msg.reactions || []), event.data.reaction] }
            : msg
        ));
        break;
      case 'cursor':
        setCursorPositions(prev => new Map(prev).set(event.userId, event.data));
        break;
      case 'presence':
        setOnlinePresence(prev => new Map(prev).set(event.userId, event.data));
        break;
      case 'activity':
        setLiveActivities(prev => new Map(prev).set(event.userId, event.data.activity));
        break;
    }
  }, []);

  // Send real-time event
  const sendRTCEvent = useCallback((event: Omit<RTCEvent, 'timestamp' | 'userId'>) => {
    const rtcEvent: RTCEvent = {
      ...event,
      timestamp: new Date(),
      userId: 'current-user'
    };

    rtcDataChannels.current.forEach((channel) => {
      if (channel.readyState === 'open') {
        try {
          channel.send(JSON.stringify(rtcEvent));
        } catch (error) {
          console.error('Failed to send RTC event:', error);
        }
      }
    });
  }, []);

  // Measure network latency
  const measureLatency = useCallback((dataChannel: RTCDataChannel) => {
    const measureStart = Date.now();
    const pingMessage = JSON.stringify({ type: 'ping', timestamp: measureStart });
    
    if (dataChannel.readyState === 'open') {
      dataChannel.send(pingMessage);
      
      // Simulate latency measurement (in real app, you'd wait for pong response)
      setTimeout(() => {
        const latency = Date.now() - measureStart;
        setBandwidthStats(prev => ({ ...prev, latency }));
        
        // Update network quality based on latency
        if (latency < 50) setNetworkQuality('excellent');
        else if (latency < 100) setNetworkQuality('good');
        else if (latency < 200) setNetworkQuality('fair');
        else setNetworkQuality('poor');
      }, 50);
    }
  }, []);

  // Reconnect RTC when connection fails
  const reconnectRTC = useCallback(async (userId: string) => {
    console.log('Attempting to reconnect to user:', userId);
    setConnectionStatus('connecting');
    
    // Wait a bit before reconnecting
    setTimeout(() => {
      initializeRTCConnection(userId);
    }, 2000);
  }, [initializeRTCConnection]);

  // Track cursor movements for real-time collaboration
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (connectionStatus === 'connected') {
      const rect = chatContainerRef.current?.getBoundingClientRect();
      if (rect) {
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        
        sendRTCEvent({
          type: 'cursor',
          data: { x, y, color: '#3B82F6' }
        });
      }
    }
  }, [connectionStatus, sendRTCEvent]);

  // Real-time typing indicator
  const handleTypingChange = useCallback((isTyping: boolean) => {
    sendRTCEvent({
      type: 'typing',
      data: { isTyping }
    });

    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }

    if (isTyping) {
      typingTimeout.current = setTimeout(() => {
        sendRTCEvent({
          type: 'typing',
          data: { isTyping: false }
        });
      }, 3000);
    }
  }, [sendRTCEvent]);

  // Initialize real-time connections on mount
  useEffect(() => {
    // Simulate connecting to other users
    const userIds = ['1', '2', '3', '4', '5'];
    userIds.forEach(userId => {
      initializeRTCConnection(userId);
    });

    // Cleanup on unmount
    return () => {
      rtcDataChannels.current.forEach(channel => {
        if (channel.readyState === 'open') {
          channel.close();
        }
      });
      
      if (typingTimeout.current) {
        clearTimeout(typingTimeout.current);
      }
      
      if (cursorUpdateInterval.current) {
        clearInterval(cursorUpdateInterval.current);
      }
    };
  }, [initializeRTCConnection]);

  // Monitor network quality periodically
  useEffect(() => {
    const interval = setInterval(() => {
      rtcDataChannels.current.forEach(channel => {
        if (channel.readyState === 'open') {
          measureLatency(channel);
        }
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [measureLatency]);
  
  // Enhanced quick actions
  const quickActions = [
    { name: 'Start Video Call', action: () => {}, icon: Video, color: 'bg-green-500' },
    { name: 'Voice Call', action: () => {}, icon: Phone, color: 'bg-blue-500' },
    { name: 'Screen Share', action: () => {}, icon: Monitor, color: 'bg-purple-500' },
    { name: 'Schedule Meeting', action: () => {}, icon: Calendar, color: 'bg-orange-500' },
  ];

  // Enhanced mock data with more realistic user information
  const [users] = useState<ChatUser[]>([
    { 
      id: '1', 
      name: 'John Doe', 
      username: 'john.doe',
      avatar: '/api/placeholder/40/40', 
      status: 'online', 
      role: 'Team Lead',
      customStatus: 'Leading the team to success 🚀',
      timezone: 'UTC-5',
      device: 'desktop',
      permissions: ['admin']
    },
    { 
      id: '2', 
      name: 'Jane Smith', 
      username: 'jane.smith',
      avatar: '/api/placeholder/40/40', 
      status: 'focus', 
      role: 'Senior Designer',
      customStatus: 'In deep focus mode 🎨',
      timezone: 'UTC-8',
      device: 'desktop',
      permissions: ['moderator']
    },
    { 
      id: '3', 
      name: 'Mike Johnson', 
      username: 'mike.j',
      avatar: '/api/placeholder/40/40', 
      status: 'busy', 
      role: 'Full Stack Developer',
      customStatus: 'Coding the future 💻',
      timezone: 'UTC-3',
      device: 'desktop',
      permissions: ['member']
    },
    { 
      id: '4', 
      name: 'Sarah Wilson', 
      username: 'sarah.wilson',
      avatar: '/api/placeholder/40/40', 
      status: 'away', 
      role: 'Product Manager',
      lastSeen: new Date(Date.now() - 1800000),
      customStatus: 'In a meeting 📊',
      timezone: 'UTC+1',
      device: 'mobile',
      permissions: ['moderator']
    },
    { 
      id: '5', 
      name: 'Alex Chen', 
      username: 'alex.chen',
      avatar: '/api/placeholder/40/40', 
      status: 'online', 
      role: 'DevOps Engineer',
      customStatus: 'Deploying to production ⚡',
      timezone: 'UTC+8',
      device: 'web',
      permissions: ['member']
    },
    { 
      id: '6', 
      name: 'Lisa Brown', 
      username: 'lisa.brown',
      avatar: '/api/placeholder/40/40', 
      status: 'offline', 
      role: 'QA Engineer',
      lastSeen: new Date(Date.now() - 7200000),
      customStatus: 'Testing new features 🔍',
      timezone: 'UTC-7',
      device: 'mobile',
      permissions: ['member']
    },
  ]);

  const [channels] = useState<Channel[]>([
    { 
      id: 'general', 
      name: 'General', 
      type: 'channel', 
      participants: ['1', '2', '3', '4', '5', '6'],
      admins: ['1'],
      unreadCount: 3, 
      isMuted: false, 
      isPinned: true,
      description: 'General team discussions and announcements',
      createdAt: new Date(Date.now() - 86400000 * 30),
      memberCount: 6,
      tags: ['important', 'announcements']
    },
    { 
      id: 'design', 
      name: 'Design Team', 
      type: 'channel', 
      participants: ['1', '2'],
      admins: ['2'],
      unreadCount: 0, 
      isMuted: false, 
      isPinned: false,
      description: 'UI/UX design discussions and feedback',
      createdAt: new Date(Date.now() - 86400000 * 15),
      memberCount: 2,
      tags: ['design', 'ui-ux']
    },
    { 
      id: 'dev', 
      name: 'Development', 
      type: 'channel', 
      participants: ['1', '3', '5'],
      admins: ['1', '3'],
      unreadCount: 7, 
      isMuted: true, 
      isPinned: true,
      description: 'Technical discussions and code reviews',
      createdAt: new Date(Date.now() - 86400000 * 20),
      memberCount: 3,
      tags: ['development', 'technical']
    },
    { 
      id: 'john', 
      name: 'John Doe', 
      type: 'direct', 
      participants: ['1'],
      admins: ['1'],
      unreadCount: 1, 
      isMuted: false, 
      isPinned: false,
      createdAt: new Date(Date.now() - 86400000 * 5)
    },
    { 
      id: 'jane', 
      name: 'Jane Smith', 
      type: 'direct', 
      participants: ['2'],
      admins: ['2'],
      unreadCount: 0, 
      isMuted: false, 
      isPinned: false,
      createdAt: new Date(Date.now() - 86400000 * 3)
    },
  ]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Welcome to the new enhanced team chat experience! 🎉 This is a completely redesigned interface with modern UI/UX patterns.',
      sender: 'John Doe',
      senderId: '1',
      timestamp: new Date(Date.now() - 3600000),
      type: 'text',
      status: 'read',
      reactions: [{ emoji: '👍', users: ['Jane Smith', 'Mike Johnson'], timestamp: new Date(Date.now() - 3500000) }],
      priority: 'high'
    },
    {
      id: '2',
      content: 'This full-screen interface is amazing! Much better for team collaboration. The new features like message reactions, threads, and advanced formatting make communication so much smoother.',
      sender: 'Jane Smith',
      senderId: '2',
      timestamp: new Date(Date.now() - 3000000),
      type: 'text',
      status: 'read',
      mentions: ['everyone']
    },
    {
      id: '3',
      content: 'I love the improved layout and the attention to detail. The typing indicators, presence awareness, and smart notifications really enhance the user experience.',
      sender: 'Mike Johnson',
      senderId: '3',
      timestamp: new Date(Date.now() - 1800000),
      type: 'text',
      status: 'delivered',
      reactions: [
        { emoji: '❤️', users: ['John Doe'], timestamp: new Date(Date.now() - 1700000) },
        { emoji: '🚀', users: ['Jane Smith', 'Alex Chen'], timestamp: new Date(Date.now() - 1600000) }
      ]
    },
    {
      id: '4',
      content: 'The sidebar with all channels, the main chat area, and the new message composer work perfectly together! This feels like a professional communication platform.',
      sender: 'You',
      senderId: 'current-user',
      timestamp: new Date(Date.now() - 600000),
      type: 'text',
      status: 'sent',
      isPinned: true
    }
  ]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Simulate typing indicator
  useEffect(() => {
    if (isTyping) {
      const timer = setTimeout(() => {
        setIsTyping(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isTyping]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'k':
            e.preventDefault();
            // Focus search
            break;
          case 'f':
            e.preventDefault();
            setMessageFilter(prev => {
              const filters: typeof messageFilter[] = ['all', 'unread', 'mentions', 'starred'];
              const currentIndex = filters.indexOf(prev);
              return filters[(currentIndex + 1) % filters.length];
            });
            break;
          case '/':
            e.preventDefault();
            messageInputRef.current?.focus();
            break;
        }
      }
      if (e.key === 'Escape') {
        setShowEmojiPicker(false);
        setReplyingTo(null);
        setEditingMessage(null);
        setMessageOptions(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    // Handle file upload logic here
    console.log('Files dropped:', files);
  }, []);

  const sendMessage = useCallback(() => {
    if (!messageInput.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: messageInput,
      sender: 'You',
      senderId: 'current-user',
      timestamp: new Date(),
      type: 'text',
      status: 'sending',
      replyTo: replyingTo?.id
    };

    setMessages(prev => [...prev, newMessage]);
    setMessageInput('');
    setReplyingTo(null);
    
    // Set delivery status to sending
    setMessageDeliveryStatus(prev => new Map(prev).set(newMessage.id, 'sending'));

    // Send message via RTC
    sendRTCEvent({
      type: 'message',
      data: newMessage
    });

    // Simulate message delivery progression
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === newMessage.id 
            ? { ...msg, status: 'sent' as const }
            : msg
        )
      );
      setMessageDeliveryStatus(prev => new Map(prev).set(newMessage.id, 'sent'));
    }, 500);

    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === newMessage.id 
            ? { ...msg, status: 'delivered' as const }
            : msg
        )
      );
      setMessageDeliveryStatus(prev => new Map(prev).set(newMessage.id, 'delivered'));
    }, 1000);

    // Simulate read status after a delay
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === newMessage.id 
            ? { ...msg, status: 'read' as const }
            : msg
        )
      );
      setMessageDeliveryStatus(prev => new Map(prev).set(newMessage.id, 'read'));
    }, 2000);

    // Stop typing indicator
    handleTypingChange(false);
  }, [messageInput, replyingTo, sendRTCEvent, handleTypingChange]);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      case 'focus': return 'bg-purple-500';
      default: return 'bg-gray-400';
    }
  }, []);

  const getStatusIcon = useCallback((status: string) => {
    switch (status) {
      case 'online': return Circle;
      case 'away': return Clock;
      case 'busy': return Bell;
      case 'focus': return Headphones;
      default: return Circle;
    }
  }, []);

  const getMessageTime = useCallback((timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    if (days < 7) return timestamp.toLocaleDateString('en-US', { weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: true });
    return timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
  }, []);

  const formatLastSeen = useCallback((lastSeen: Date) => {
    const now = new Date();
    const diff = now.getTime() - lastSeen.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return lastSeen.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }, []);

  const addReaction = useCallback((messageId: string, emoji: string) => {
    const reactionData = {
      messageId,
      reaction: { emoji, users: ['You'], timestamp: new Date() }
    };

    // Send reaction via RTC for real-time sync
    sendRTCEvent({
      type: 'reaction',
      data: reactionData
    });

    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const existingReaction = msg.reactions?.find(r => r.emoji === emoji);
        if (existingReaction) {
          if (existingReaction.users.includes('You')) {
            // Remove reaction
            return {
              ...msg,
              reactions: msg.reactions?.map(r => 
                r.emoji === emoji 
                  ? { ...r, users: r.users.filter(u => u !== 'You') }
                  : r
              ).filter(r => r.users.length > 0)
            };
          } else {
            // Add reaction
            return {
              ...msg,
              reactions: msg.reactions?.map(r => 
                r.emoji === emoji 
                  ? { ...r, users: [...r.users, 'You'] }
                  : r
              )
            };
          }
        } else {
          // New reaction
          return {
            ...msg,
            reactions: [
              ...(msg.reactions || []),
              { emoji, users: ['You'], timestamp: new Date() }
            ]
          };
        }
      }
      return msg;
    }));
  }, [sendRTCEvent]);

  const pinMessage = useCallback((messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, isPinned: !msg.isPinned }
        : msg
    ));
  }, []);

  const deleteMessage = useCallback((messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
  }, []);

  const filteredChannels = channels.filter(channel =>
    channel.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeChannelData = channels.find(c => c.id === activeChannel);
  const onlineUsers = users.filter(u => u.status === 'online');

  return (
    <div 
      className="h-screen flex bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Real-time Connection Status Toast */}
      <AnimatePresence>
        {connectionStatus === 'connecting' && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-yellow-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3"
          >
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="font-medium">Establishing real-time connection...</span>
          </motion.div>
        )}
        
        {connectionStatus === 'connected' && rtcConnections.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-medium">
              Real-time collaboration active ({rtcConnections.size} connections)
            </span>
          </motion.div>
        )}
        
        {connectionStatus === 'disconnected' && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Real-time connection lost - attempting to reconnect...</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Network Quality Toast */}
      <AnimatePresence>
        {networkQuality === 'poor' && connectionStatus === 'connected' && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="absolute top-20 right-4 z-50 bg-orange-500 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3"
          >
            <WifiOff className="w-4 h-4" />
            <div>
              <div className="font-medium">Poor Network Quality</div>
              <div className="text-xs opacity-90">Latency: {bandwidthStats.latency}ms</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Real-time Performance Monitor */}
      {connectionStatus === 'connected' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute bottom-6 right-6 z-40 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl p-4 shadow-2xl border border-gray-200/50 dark:border-gray-700/50 min-w-[200px]"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-green-500" />
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Live Stats
              </span>
            </div>
            <motion.div
              className="w-2 h-2 bg-green-500 rounded-full"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          </div>
          
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Latency</span>
              <span className={`font-medium ${
                performanceMetrics.messageLatency < 50 ? 'text-green-600' :
                performanceMetrics.messageLatency < 100 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {performanceMetrics.messageLatency}ms
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Stability</span>
              <span className={`font-medium ${
                performanceMetrics.connectionStability > 80 ? 'text-green-600' :
                performanceMetrics.connectionStability > 60 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {performanceMetrics.connectionStability.toFixed(0)}%
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Throughput</span>
              <span className="font-medium text-blue-600 dark:text-blue-400">
                {(performanceMetrics.dataChannelThroughput / 1024).toFixed(1)} KB/s
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Connections</span>
              <span className="font-medium text-purple-600 dark:text-purple-400">
                {performanceMetrics.activeConnections}
              </span>
            </div>
          </div>
          
          <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Last update: {performanceMetrics.lastUpdate.toLocaleTimeString()}
            </div>
          </div>
        </motion.div>
      )}

      {/* Drag and Drop Overlay */}
      <AnimatePresence>
        {dragOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-blue-500/20 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl border-2 border-dashed border-blue-500">
              <div className="text-center">
                <Upload className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Drop files here</h3>
                <p className="text-gray-500">Share images, documents, or any files with your team</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Sidebar */}
      <motion.div
        className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-700/50 flex flex-col transition-all duration-300 shadow-xl ${
          sidebarCollapsed ? 'w-16' : 'w-80'
        }`}
        initial={false}
        animate={{ width: sidebarCollapsed ? 64 : 320 }}
      >
        {/* Enhanced Sidebar Header */}
        <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <motion.div 
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                </div>
                <div>
                  <h1 className="font-bold text-lg bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    Team Chat
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Circle className="w-2 h-2 fill-green-500 text-green-500" />
                    {onlineUsers.length} online
                  </p>
                </div>
              </motion.div>
            )}
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-xl hover:bg-white/50 dark:hover:bg-gray-700/50 transition-all duration-200 shadow-sm"
              >
                {sidebarCollapsed ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </motion.button>
              {!sidebarCollapsed && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowChannelInfo(!showChannelInfo)}
                  className="p-2.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-xl hover:bg-white/50 dark:hover:bg-gray-700/50 transition-all duration-200 shadow-sm"
                >
                  <Settings className="w-4 h-4" />
                </motion.button>
              )}
            </div>
          </div>
        </div>

        {!sidebarCollapsed && (
          <>
            {/* Enhanced Search and Filters */}
            <div className="p-4 space-y-3 border-b border-gray-200/50 dark:border-gray-700/50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search channels, users, messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700/50 dark:text-white placeholder-gray-400 transition-all duration-200 bg-white/50"
                />
              </div>
              
              {/* Message Filter Pills */}
              <div className="flex gap-2 overflow-x-auto pb-1">
                {(['all', 'unread', 'mentions', 'starred'] as const).map((filter) => (
                  <motion.button
                    key={filter}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setMessageFilter(filter)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                      messageFilter === filter
                        ? 'bg-blue-500 text-white shadow-lg'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Enhanced Channels List */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <Hash className="w-4 h-4" />
                    Channels
                  </h3>
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
                  >
                    <Plus className="w-4 h-4" />
                  </motion.button>
                </div>
                
                {filteredChannels.map((channel) => {
                  const isActive = activeChannel === channel.id;
                  return (
                    <motion.div
                      key={channel.id}
                      onClick={() => setActiveChannel(channel.id)}
                      className={`group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 mb-2 relative overflow-hidden ${
                        isActive 
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg transform scale-[1.02]' 
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:transform hover:scale-[1.01]'
                      }`}
                      whileHover={{ x: isActive ? 0 : 4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {/* Channel Icon */}
                      <div className="relative flex-shrink-0">
                        {channel.type === 'channel' ? (
                          <div className={`p-2 rounded-lg ${isActive ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-700'}`}>
                            <Hash className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                          </div>
                        ) : channel.type === 'group' ? (
                          <div className={`p-2 rounded-lg ${isActive ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-700'}`}>
                            <Users className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                          </div>
                        ) : (
                          <div className="relative">
                            <img 
                              src="/api/placeholder/32/32" 
                              alt={channel.name}
                              className="w-8 h-8 rounded-lg"
                            />
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                          </div>
                        )}
                        {channel.isPinned && (
                          <Pin className={`absolute -top-1 -right-1 w-3 h-3 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                        )}
                      </div>

                      {/* Channel Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className={`font-semibold truncate ${isActive ? 'text-white' : 'text-gray-900 dark:text-gray-100'}`}>
                            {channel.name}
                          </span>
                          <div className="flex items-center gap-1">
                            {channel.isMuted && (
                              <BellOff className={`w-3 h-3 ${isActive ? 'text-white/70' : 'text-gray-400'}`} />
                            )}
                            {channel.unreadCount > 0 && (
                              <motion.span 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className={`text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center font-bold ${
                                  isActive 
                                    ? 'bg-white text-blue-600' 
                                    : 'bg-red-500 text-white'
                                }`}
                              >
                                {channel.unreadCount > 99 ? '99+' : channel.unreadCount}
                              </motion.span>
                            )}
                          </div>
                        </div>
                        {channel.description && (
                          <p className={`text-xs truncate mt-1 ${isActive ? 'text-white/70' : 'text-gray-500'}`}>
                            {channel.description}
                          </p>
                        )}
                        {channel.lastMessage && (
                          <p className={`text-xs truncate mt-1 ${isActive ? 'text-white/70' : 'text-gray-400'}`}>
                            {channel.lastMessage.sender}: {channel.lastMessage.content}
                          </p>
                        )}
                      </div>

                      {/* Hover Actions */}
                      {!isActive && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-1 text-gray-400 hover:text-gray-600 rounded"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Toggle mute
                            }}
                          >
                            {channel.isMuted ? <Bell className="w-3 h-3" /> : <BellOff className="w-3 h-3" />}
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-1 text-gray-400 hover:text-gray-600 rounded"
                            onClick={(e) => {
                              e.stopPropagation();
                              // More options
                            }}
                          >
                            <MoreVertical className="w-3 h-3" />
                          </motion.button>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* Enhanced Online Users */}
              <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-b from-transparent to-gray-50/50 dark:to-gray-800/50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Online ({onlineUsers.length})
                  </h3>
                  <div className="flex gap-1">
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowUserPanel(!showUserPanel)}
                      className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
                    >
                      {showUserPanel ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
                    >
                      <UserPlus className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
                
                <AnimatePresence>
                  {showUserPanel && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-2"
                    >
                      {users.map((user) => {
                        const StatusIcon = getStatusIcon(user.status);
                        return (
                          <motion.div 
                            key={user.id} 
                            className="group flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-all duration-200"
                            whileHover={{ x: 2, scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                          >
                            <div className="relative">
                              <motion.img
                                src={user.avatar}
                                alt={user.name}
                                className="w-10 h-10 rounded-xl shadow-sm"
                                whileHover={{ scale: 1.05 }}
                              />
                              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 ${getStatusColor(user.status)} flex items-center justify-center`}>
                                <StatusIcon className="w-2 h-2 text-white" />
                              </div>
                              {user.device && (
                                <div className="absolute -top-1 -left-1 w-4 h-4 bg-gray-100 dark:bg-gray-700 rounded-full border border-gray-200 dark:border-gray-600 flex items-center justify-center">
                                  {user.device === 'desktop' && <Monitor className="w-2 h-2 text-gray-500" />}
                                  {user.device === 'mobile' && <Smartphone className="w-2 h-2 text-gray-500" />}
                                  {user.device === 'web' && <Monitor className="w-2 h-2 text-gray-500" />}
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-sm truncate text-gray-900 dark:text-gray-100">
                                  {user.name}
                                </p>
                                {user.permissions?.includes('admin') && (
                                  <Crown className="w-3 h-3 text-yellow-500" />
                                )}
                                {user.permissions?.includes('moderator') && (
                                  <Shield className="w-3 h-3 text-blue-500" />
                                )}
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {user.role}
                              </p>
                              {user.customStatus && (
                                <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5">
                                  {user.customStatus}
                                </p>
                              )}
                              {user.status === 'offline' && user.lastSeen && (
                                <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5">
                                  Last seen {formatLastSeen(user.lastSeen)}
                                </p>
                              )}
                            </div>
                            
                            {/* Quick Actions on Hover */}
                            <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 flex gap-1">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all duration-200"
                                title="Start Chat"
                              >
                                <MessageCircle className="w-3 h-3" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
                                title="Video Call"
                              >
                                <Video className="w-3 h-3" />
                              </motion.button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Quick Actions */}
                <div className="mt-4 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                  <div className="grid grid-cols-2 gap-2">
                    {quickActions.map((action, index) => (
                      <motion.button
                        key={action.name}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`p-3 rounded-xl text-white text-xs font-medium flex items-center gap-2 transition-all duration-200 shadow-sm ${action.color}`}
                        onClick={action.action}
                      >
                        <action.icon className="w-4 h-4" />
                        <span className="truncate">{action.name.split(' ')[0]}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </motion.div>

      {/* Enhanced Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-900 relative">
        {/* Enhanced Chat Header */}
        {activeChannelData && (
          <motion.div 
            className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 p-6 shadow-sm"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Channel Avatar/Icon */}
                <div className="relative">
                  {activeChannelData.type === 'channel' ? (
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Hash className="w-6 h-6 text-white" />
                    </div>
                  ) : activeChannelData.type === 'group' ? (
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                  ) : (
                    <div className="relative">
                      <img 
                        src="/api/placeholder/48/48" 
                        alt={activeChannelData.name}
                        className="w-12 h-12 rounded-xl shadow-lg"
                      />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                    </div>
                  )}
                  {activeChannelData.isEncrypted && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <Shield className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>

                {/* Channel Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h2 className="font-bold text-xl text-gray-900 dark:text-white">
                      {activeChannelData.name}
                    </h2>
                    
                    {/* Real-time Connection Status */}
                    <div className="flex items-center gap-2">
                      <motion.div
                        className={`w-3 h-3 rounded-full ${
                          connectionStatus === 'connected' ? 'bg-green-500' :
                          connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        animate={{
                          scale: connectionStatus === 'connecting' ? [1, 1.2, 1] : 1,
                          opacity: connectionStatus === 'connecting' ? [1, 0.5, 1] : 1
                        }}
                        transition={{
                          duration: 1,
                          repeat: connectionStatus === 'connecting' ? Infinity : 0
                        }}
                      />
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {connectionStatus === 'connected' && 'Live'}
                        {connectionStatus === 'connecting' && 'Connecting...'}
                        {connectionStatus === 'disconnected' && 'Offline'}
                      </span>
                    </div>

                    {/* Network Quality Indicator */}
                    {connectionStatus === 'connected' && (
                      <div className="flex items-center gap-1">
                        <Signal className={`w-4 h-4 ${
                          networkQuality === 'excellent' ? 'text-green-500' :
                          networkQuality === 'good' ? 'text-blue-500' :
                          networkQuality === 'fair' ? 'text-yellow-500' : 'text-red-500'
                        }`} />
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {bandwidthStats.latency}ms
                        </span>
                      </div>
                    )}

                    {activeChannelData.type === 'private' && (
                      <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 text-xs font-medium rounded-lg">
                        Private
                      </span>
                    )}
                    {activeChannelData.isPinned && (
                      <Pin className="w-4 h-4 text-yellow-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-1">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {activeChannelData.memberCount || activeChannelData.participants.length} members
                    </span>
                    {activeChannelData.description && (
                      <>
                        <span>•</span>
                        <span className="hidden md:block truncate max-w-md">
                          {activeChannelData.description}
                        </span>
                      </>
                    )}
                    {typingUsers.length > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                          <div className="flex gap-1">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce"></div>
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                          {typingUsers.length === 1 ? `${typingUsers[0]} is typing` : `${typingUsers.length} people are typing`}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Enhanced Action Buttons */}
              <div className="flex items-center gap-2">
                {/* Network Status Panel */}
                <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div className="flex items-center gap-2">
                    {connectionStatus === 'connected' ? (
                      <Wifi className={`w-4 h-4 ${
                        networkQuality === 'excellent' ? 'text-green-500' :
                        networkQuality === 'good' ? 'text-blue-500' :
                        networkQuality === 'fair' ? 'text-yellow-500' : 'text-red-500'
                      }`} />
                    ) : (
                      <WifiOff className="w-4 h-4 text-red-500" />
                    )}
                    <div className="text-xs">
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {networkQuality.charAt(0).toUpperCase() + networkQuality.slice(1)}
                      </div>
                      <div className="text-gray-500 dark:text-gray-400">
                        {bandwidthStats.latency}ms
                      </div>
                    </div>
                  </div>
                  
                  <div className="w-px h-8 bg-gray-200 dark:bg-gray-600"></div>
                  
                  <div className="text-xs">
                    <div className="flex items-center gap-1">
                      <ArrowRight className="w-3 h-3 text-gray-400 rotate-45" />
                      <span className="text-gray-500 dark:text-gray-400">
                        {(bandwidthStats.upload / 1024).toFixed(1)} KB/s
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ArrowRight className="w-3 h-3 text-gray-400 -rotate-45" />
                      <span className="text-gray-500 dark:text-gray-400">
                        {(bandwidthStats.download / 1024).toFixed(1)} KB/s
                      </span>
                    </div>
                  </div>
                </div>

                <div className="w-px h-8 bg-gray-200 dark:bg-gray-700"></div>

                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-3 text-gray-500 hover:text-green-600 dark:hover:text-green-400 rounded-xl hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-200 group"
                  title="Voice Call"
                >
                  <Phone className="w-5 h-5 group-hover:animate-pulse" />
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-3 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 group"
                  title="Video Call"
                >
                  <Video className="w-5 h-5 group-hover:animate-pulse" />
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-3 text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200"
                  title="Screen Share"
                >
                  <Monitor className="w-5 h-5" />
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-3 text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all duration-200"
                  title="Add Members"
                >
                  <UserPlus className="w-5 h-5" />
                </motion.button>
                <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-2"></div>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowChannelInfo(!showChannelInfo)}
                  className="p-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                  title="Channel Info"
                >
                  <Info className="w-5 h-5" />
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                  title="Settings"
                >
                  <Settings className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Enhanced Messages Area */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-gray-50/30 to-transparent dark:from-gray-800/30 relative"
          onMouseMove={handleMouseMove}
        >
          {/* Real-time Cursor Indicators */}
          <AnimatePresence>
            {Array.from(cursorPositions.entries()).map(([userId, position]) => (
              <motion.div
                key={userId}
                className="absolute pointer-events-none z-50"
                style={{
                  left: `${position.x}%`,
                  top: `${position.y}%`,
                }}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center gap-2">
                  <Mouse 
                    className="w-4 h-4 text-white drop-shadow-lg" 
                    style={{ color: position.color }}
                  />
                  <div 
                    className="px-2 py-1 rounded-lg text-xs text-white font-medium shadow-lg"
                    style={{ backgroundColor: position.color }}
                  >
                    {users.find(u => u.id === userId)?.name || 'User'}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Live Activity Feed */}
          {liveActivities.size > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Live Activity</span>
              </div>
              <div className="space-y-1">
                {Array.from(liveActivities.entries()).map(([userId, activity]) => (
                  <div key={userId} className="text-sm text-blue-700 dark:text-blue-300">
                    <span className="font-medium">{users.find(u => u.id === userId)?.name}</span> {activity}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
          {messages.map((message, index) => {
            const isOwnMessage = message.sender === 'You';
            const showAvatar = index === 0 || messages[index - 1].sender !== message.sender;
            const isLastFromSender = index === messages.length - 1 || messages[index + 1].sender !== message.sender;
            
            return (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`group flex gap-4 ${isOwnMessage ? 'flex-row-reverse' : ''} ${!showAvatar ? 'mt-1' : ''}`}
              >
                {/* Message Avatar */}
                <div className={`flex-shrink-0 w-12 ${showAvatar ? '' : 'invisible'}`}>
                  {!isOwnMessage && (
                    <motion.img
                      src="/api/placeholder/48/48"
                      alt={message.sender}
                      className="w-12 h-12 rounded-xl shadow-lg ring-2 ring-white dark:ring-gray-800"
                      whileHover={{ scale: 1.05 }}
                    />
                  )}
                </div>

                {/* Message Content */}
                <div className={`flex-1 max-w-[70%] ${isOwnMessage ? 'text-right' : ''}`}>
                  {/* Message Header */}
                  {showAvatar && (
                    <div className={`flex items-center gap-3 mb-2 ${isOwnMessage ? 'justify-end' : ''}`}>
                      <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                        {message.sender}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {getMessageTime(message.timestamp)}
                      </span>
                      {message.isEdited && (
                        <span className="text-xs text-gray-400 dark:text-gray-500">(edited)</span>
                      )}
                      {message.isPinned && (
                        <Pin className="w-3 h-3 text-yellow-500" />
                      )}
                      {message.priority === 'urgent' && (
                        <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-medium rounded-full">
                          Urgent
                        </span>
                      )}
                    </div>
                  )}

                  {/* Message Bubble */}
                  <motion.div 
                    className={`relative rounded-2xl p-4 shadow-sm border transition-all duration-200 ${
                      isOwnMessage 
                        ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-blue-500/20' 
                        : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100'
                    } ${showAvatar ? '' : isOwnMessage ? 'rounded-tr-lg' : 'rounded-tl-lg'} ${isLastFromSender ? '' : isOwnMessage ? 'rounded-br-lg' : 'rounded-bl-lg'}`}
                    whileHover={{ scale: 1.01 }}
                    onDoubleClick={() => !isOwnMessage && setReplyingTo(message)}
                  >
                    {/* Reply Reference */}
                    {message.replyTo && (
                      <div className={`mb-3 p-3 rounded-lg text-sm border-l-4 ${
                        isOwnMessage 
                          ? 'bg-white/10 border-white/30 text-white/80' 
                          : 'bg-gray-100 dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-600 dark:text-gray-300'
                      }`}>
                        <p className="font-medium mb-1">Replying to message</p>
                        <p className="opacity-75">...</p>
                      </div>
                    )}

                    {/* Message Text */}
                    <div className="text-sm leading-relaxed">
                      {message.content}
                    </div>

                    {/* Message Attachments */}
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {message.attachments.map((attachment, i) => (
                          <div key={i} className={`flex items-center gap-3 p-3 rounded-xl ${
                            isOwnMessage ? 'bg-white/10' : 'bg-gray-100 dark:bg-gray-600'
                          }`}>
                            <File className="w-6 h-6" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{attachment.name}</p>
                              <p className="text-xs opacity-75">{attachment.size}</p>
                            </div>
                            <motion.button 
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-1 rounded-lg hover:bg-white/10"
                            >
                              <Download className="w-4 h-4" />
                            </motion.button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Message Status */}
                    <div className={`flex items-center justify-between mt-3 pt-2 border-t ${
                      isOwnMessage ? 'border-white/20' : 'border-gray-200 dark:border-gray-600'
                    }`}>
                      <div className="flex items-center gap-2">
                        {message.status === 'sending' && (
                          <div className="flex gap-1">
                            <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce"></div>
                            <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        )}
                        {message.status === 'sent' && <Check className="w-3 h-3 opacity-60" />}
                        {message.status === 'delivered' && <CheckCheck className="w-3 h-3 opacity-60" />}
                        {message.status === 'read' && <CheckCheck className="w-3 h-3 text-blue-400" />}
                        {message.status === 'failed' && <X className="w-3 h-3 text-red-400" />}
                      </div>

                      {/* Quick Actions */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setReplyingTo(message)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            isOwnMessage 
                              ? 'hover:bg-white/20 text-white/70 hover:text-white' 
                              : 'hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                          }`}
                          title="Reply"
                        >
                          <Reply className="w-3 h-3" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            isOwnMessage 
                              ? 'hover:bg-white/20 text-white/70 hover:text-white' 
                              : 'hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                          }`}
                          title="Add Reaction"
                        >
                          <Smile className="w-3 h-3" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setMessageOptions(messageOptions === message.id ? null : message.id)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            isOwnMessage 
                              ? 'hover:bg-white/20 text-white/70 hover:text-white' 
                              : 'hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                          }`}
                          title="More Options"
                        >
                          <MoreVertical className="w-3 h-3" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>

                  {/* Message Reactions */}
                  {message.reactions && message.reactions.length > 0 && (
                    <motion.div 
                      className={`flex gap-2 mt-2 ${isOwnMessage ? 'justify-end' : ''}`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      {message.reactions.map((reaction, index) => (
                        <motion.button
                          key={index}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => addReaction(message.id, reaction.emoji)}
                          className={`flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200 shadow-sm ${
                            reaction.users.includes('You') ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''
                          }`}
                        >
                          <span className="text-base">{reaction.emoji}</span>
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                            {reaction.users.length}
                          </span>
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Reply Indicator */}
        <AnimatePresence>
          {replyingTo && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-t border-blue-200 dark:border-blue-800/50"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Reply className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      Replying to {replyingTo.sender}
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 truncate max-w-md">
                      {replyingTo.content}
                    </p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setReplyingTo(null)}
                  className="p-2 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-800/50 rounded-lg transition-all duration-200"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Message Input */}
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-700/50 p-6">
          {/* Typing Indicator */}
          <AnimatePresence>
            {typingUsers.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2"
              >
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span>
                  {typingUsers.length === 1 
                    ? `${typingUsers[0]} is typing...` 
                    : `${typingUsers.length} people are typing...`
                  }
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input Container */}
          <div className="relative">
            {/* Real-time Collaboration Toolbar */}
            <div className="flex items-center justify-between gap-2 mb-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-600/50 rounded-xl border border-gray-200 dark:border-gray-600">
              <div className="flex items-center gap-2">
                {/* Live Connection Status */}
                <div className="flex items-center gap-2">
                  <motion.div
                    className={`w-2 h-2 rounded-full ${
                      connectionStatus === 'connected' ? 'bg-green-500' :
                      connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    animate={{
                      scale: connectionStatus === 'connecting' ? [1, 1.3, 1] : 1,
                      opacity: connectionStatus === 'connecting' ? [1, 0.3, 1] : 1
                    }}
                    transition={{
                      duration: 0.8,
                      repeat: connectionStatus === 'connecting' ? Infinity : 0
                    }}
                  />
                  <span className="text-xs text-gray-600 dark:text-gray-300">
                    {rtcConnections.size} connected
                  </span>
                </div>

                {/* Active Collaborators */}
                {onlinePresence.size > 0 && (
                  <div className="flex items-center gap-1">
                    <Users2 className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {onlinePresence.size} active
                    </span>
                  </div>
                )}

                {/* Real-time Quality Indicator */}
                <div className="flex items-center gap-1">
                  <Signal className={`w-3 h-3 ${
                    networkQuality === 'excellent' ? 'text-green-500' :
                    networkQuality === 'good' ? 'text-blue-500' :
                    networkQuality === 'fair' ? 'text-yellow-500' : 'text-red-500'
                  }`} />
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {bandwidthStats.latency}ms
                  </span>
                </div>
              </div>

              {/* Live Collaboration Actions */}
              <div className="flex items-center gap-1">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-1.5 text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200"
                  title="Live Whiteboard"
                >
                  <Layers className="w-3 h-3" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-1.5 text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all duration-200"
                  title="Real-time Doc"
                >
                  <Edit3 className="w-3 h-3" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-1.5 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200"
                  title="Live Annotation"
                >
                  <Target className="w-3 h-3" />
                </motion.button>
              </div>
            </div>
            {/* Formatting Toolbar */}
            <div className="flex items-center gap-2 mb-3 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <div className="flex items-center gap-1">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-white dark:hover:bg-gray-600 transition-all duration-200"
                  title="Bold"
                >
                  <Bold className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-white dark:hover:bg-gray-600 transition-all duration-200"
                  title="Italic"
                >
                  <Italic className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-white dark:hover:bg-gray-600 transition-all duration-200"
                  title="Code"
                >
                  <Code className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-white dark:hover:bg-gray-600 transition-all duration-200"
                  title="Quote"
                >
                  <Quote className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-white dark:hover:bg-gray-600 transition-all duration-200"
                  title="Link"
                >
                  <Link className="w-4 h-4" />
                </motion.button>
              </div>
              
              <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
              
              <div className="flex items-center gap-1">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200"
                  title="Attach File"
                >
                  <Paperclip className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 text-gray-500 hover:text-green-600 dark:hover:text-green-400 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-200"
                  title="Upload Image"
                >
                  <Image className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-2 text-gray-500 hover:text-yellow-600 dark:hover:text-yellow-400 rounded-lg hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-all duration-200"
                  title="Emoji"
                >
                  <Smile className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onMouseDown={() => setIsRecording(true)}
                  onMouseUp={() => setIsRecording(false)}
                  onMouseLeave={() => setIsRecording(false)}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    isRecording 
                      ? 'text-red-600 bg-red-50 dark:bg-red-900/20 scale-110' 
                      : 'text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                  }`}
                  title="Voice Message"
                >
                  {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </motion.button>
              </div>

              <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200"
                title="More Options"
              >
                <MoreVertical className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Message Input */}
            <div className="flex items-end gap-3">
              <div className="flex-1 relative">
                <textarea
                  ref={messageInputRef}
                  placeholder={`Message ${activeChannelData?.name || 'channel'}... (Real-time enabled)`}
                  value={messageInput}
                  onChange={(e) => {
                    setMessageInput(e.target.value);
                    
                    // Real-time typing detection
                    const wasTyping = isTyping;
                    const isNowTyping = e.target.value.length > 0;
                    
                    if (!wasTyping && isNowTyping) {
                      setIsTyping(true);
                      handleTypingChange(true);
                    } else if (wasTyping && !isNowTyping) {
                      setIsTyping(false);
                      handleTypingChange(false);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                    
                    // Send activity updates for real-time collaboration
                    if (connectionStatus === 'connected') {
                      sendRTCEvent({
                        type: 'activity',
                        data: { activity: 'typing in message input' }
                      });
                    }
                  }}
                  onFocus={() => {
                    if (connectionStatus === 'connected') {
                      sendRTCEvent({
                        type: 'activity',
                        data: { activity: 'focused on message input' }
                      });
                    }
                  }}
                  onBlur={() => {
                    if (connectionStatus === 'connected') {
                      sendRTCEvent({
                        type: 'activity',
                        data: { activity: 'left message input' }
                      });
                    }
                    handleTypingChange(false);
                  }}
                  rows={1}
                  className={`w-full p-4 border-2 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700/50 dark:text-white placeholder-gray-400 resize-none transition-all duration-200 backdrop-blur-sm ${
                    connectionStatus === 'connected' 
                      ? 'border-green-200 dark:border-green-600 bg-green-50/30 dark:bg-green-900/10' 
                      : 'border-gray-200 dark:border-gray-600'
                  }`}
                  style={{ 
                    minHeight: '56px',
                    maxHeight: '120px',
                    height: messageInput ? Math.min(120, Math.max(56, messageInput.split('\n').length * 24 + 32)) : 56
                  }}
                />
                
                {/* Voice Recording Indicator */}
                <AnimatePresence>
                  {isRecording && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="absolute inset-0 bg-red-50 dark:bg-red-900/20 rounded-2xl border-2 border-red-300 dark:border-red-700 flex items-center justify-center"
                    >
                      <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="font-medium">Recording voice message...</span>
                        <div className="flex gap-1">
                          <div className="w-1 h-4 bg-red-500 rounded-full animate-pulse"></div>
                          <div className="w-1 h-6 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-1 h-5 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                          <div className="w-1 h-7 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Enhanced Send Button with Real-time Status */}
              <motion.button
                onClick={sendMessage}
                disabled={!messageInput.trim() && !isRecording}
                whileHover={{ scale: messageInput.trim() ? 1.05 : 1 }}
                whileTap={{ scale: messageInput.trim() ? 0.95 : 1 }}
                className={`relative p-4 rounded-2xl transition-all duration-200 shadow-lg ${
                  messageInput.trim() || isRecording
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 transform hover:scale-105' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
              >
                {/* Real-time Connection Indicator on Send Button */}
                {connectionStatus === 'connected' && messageInput.trim() && (
                  <motion.div
                    className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                )}
                
                {connectionStatus === 'connecting' && (
                  <Loader2 className="w-5 h-5 animate-spin" />
                )}
                
                {connectionStatus === 'disconnected' && messageInput.trim() && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full border-2 border-white" />
                )}
                
                <Send className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                console.log('Files selected:', files);
                // Handle file upload logic here
              }}
            />
          </div>

          {/* Emoji Picker */}
          <AnimatePresence>
            {showEmojiPicker && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.9 }}
                className="absolute bottom-full left-6 mb-2 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 z-50"
              >
                <div className="grid grid-cols-6 gap-2 max-w-xs">
                  {commonEmojis.map((emoji) => (
                    <motion.button
                      key={emoji}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        setMessageInput(prev => prev + emoji);
                        setShowEmojiPicker(false);
                      }}
                      className="p-2 text-2xl hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors duration-200"
                    >
                      {emoji}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default FullScreenChat;