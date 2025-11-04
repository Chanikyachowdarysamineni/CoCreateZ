import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle, Send, Search, Phone, Video, MoreVertical,
  Paperclip, Smile, Image, File, Users, User, Circle,
  CheckCheck, Check, Pin, Archive, Trash2, Edit3,
  Clock, Star, Hash, AtSign, Bell, BellOff
} from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: Date;
  type: 'text' | 'image' | 'file' | 'system';
  status: 'sent' | 'delivered' | 'read';
  reactions?: { emoji: string; users: string[] }[];
  replyTo?: string;
}

interface ChatUser {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  lastSeen?: Date;
}

interface Channel {
  id: string;
  name: string;
  type: 'direct' | 'group' | 'channel';
  participants: string[];
  unreadCount: number;
  lastMessage?: Message;
  isMuted: boolean;
  isPinned: boolean;
}

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ isOpen, onClose }) => {
  const [activeChannel, setActiveChannel] = useState<string>('general');
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock data
  const [users] = useState<ChatUser[]>([
    { id: '1', name: 'John Doe', avatar: '/api/placeholder/32/32', status: 'online' },
    { id: '2', name: 'Jane Smith', avatar: '/api/placeholder/32/32', status: 'away' },
    { id: '3', name: 'Mike Johnson', avatar: '/api/placeholder/32/32', status: 'busy' },
    { id: '4', name: 'Sarah Wilson', avatar: '/api/placeholder/32/32', status: 'offline', lastSeen: new Date(Date.now() - 3600000) },
  ]);

  const [channels] = useState<Channel[]>([
    { id: 'general', name: 'General', type: 'channel', participants: ['1', '2', '3', '4'], unreadCount: 3, isMuted: false, isPinned: true },
    { id: 'design', name: 'Design Team', type: 'channel', participants: ['1', '2'], unreadCount: 0, isMuted: false, isPinned: false },
    { id: 'dev', name: 'Development', type: 'channel', participants: ['1', '3'], unreadCount: 7, isMuted: true, isPinned: true },
    { id: 'john', name: 'John Doe', type: 'direct', participants: ['1'], unreadCount: 1, isMuted: false, isPinned: false },
    { id: 'jane', name: 'Jane Smith', type: 'direct', participants: ['2'], unreadCount: 0, isMuted: false, isPinned: false },
  ]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hey team! Welcome to the new chat feature 🎉',
      sender: 'John Doe',
      timestamp: new Date(Date.now() - 3600000),
      type: 'text',
      status: 'read',
      reactions: [{ emoji: '👍', users: ['Jane Smith', 'Mike Johnson'] }]
    },
    {
      id: '2',
      content: 'This looks amazing! Great work on the integration.',
      sender: 'Jane Smith',
      timestamp: new Date(Date.now() - 3000000),
      type: 'text',
      status: 'read'
    },
    {
      id: '3',
      content: 'I love the real-time features. Can we add file sharing too?',
      sender: 'Mike Johnson',
      timestamp: new Date(Date.now() - 1800000),
      type: 'text',
      status: 'delivered'
    },
    {
      id: '4',
      content: 'File sharing is already built-in! You can drag and drop files or use the attachment button.',
      sender: 'You',
      timestamp: new Date(Date.now() - 600000),
      type: 'text',
      status: 'sent'
    }
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = () => {
    if (!messageInput.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: messageInput,
      sender: 'You',
      timestamp: new Date(),
      type: 'text',
      status: 'sent',
      replyTo: replyingTo?.id
    };

    setMessages(prev => [...prev, newMessage]);
    setMessageInput('');
    setReplyingTo(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const getMessageTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatLastSeen = (lastSeen: Date) => {
    const now = new Date();
    const diff = now.getTime() - lastSeen.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const filteredChannels = channels.filter(channel =>
    channel.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeChannelData = channels.find(c => c.id === activeChannel);

  return (
    <>
      {/* Chat Toggle Button */}
      <motion.button
        onClick={onClose}
        className={`fixed right-4 top-20 z-50 p-3 rounded-full shadow-lg transition-all duration-300 ${
          isOpen ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{ display: 'none' }} // Hide the original toggle button
      >
        <MessageCircle className="w-6 h-6" />
        {channels.reduce((sum, ch) => sum + ch.unreadCount, 0) > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {channels.reduce((sum, ch) => sum + ch.unreadCount, 0)}
          </span>
        )}
      </motion.button>

      {/* Chat Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 z-40"
              onClick={onClose}
            />

            {/* Chat Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 20 }}
              className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 flex flex-col"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MessageCircle className="w-6 h-6" />
                    <div>
                      <h2 className="font-semibold text-lg">Team Chat</h2>
                      <p className="text-blue-100 text-sm">
                        {users.filter(u => u.status === 'online').length} online
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-white/80 hover:text-white p-1"
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Search */}
              <div className="p-3 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search channels and users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Channels List */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-3">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Channels
                  </h3>
                  {filteredChannels.map((channel) => (
                    <motion.div
                      key={channel.id}
                      onClick={() => setActiveChannel(channel.id)}
                      className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors mb-1 ${
                        activeChannel === channel.id ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                      }`}
                      whileHover={{ x: 2 }}
                    >
                      <div className="relative">
                        {channel.type === 'channel' ? (
                          <Hash className="w-4 h-4" />
                        ) : channel.type === 'group' ? (
                          <Users className="w-4 h-4" />
                        ) : (
                          <User className="w-4 h-4" />
                        )}
                        {channel.isPinned && (
                          <Pin className="absolute -top-1 -right-1 w-3 h-3 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium truncate">{channel.name}</span>
                          <div className="flex items-center gap-1">
                            {channel.isMuted && (
                              <BellOff className="w-3 h-3 text-gray-400" />
                            )}
                            {channel.unreadCount > 0 && (
                              <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                                {channel.unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                        {channel.lastMessage && (
                          <p className="text-xs text-gray-500 truncate">
                            {channel.lastMessage.content}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Online Users */}
                <div className="p-3 border-t">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Online ({users.filter(u => u.status === 'online').length})
                  </h3>
                  {users.filter(u => u.status === 'online').map((user) => (
                    <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <div className="relative">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-8 h-8 rounded-full"
                        />
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(user.status)}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{user.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Active Chat Area */}
              {activeChannelData && (
                <div className="border-t bg-gray-50 h-80 flex flex-col">
                  {/* Chat Header */}
                  <div className="p-3 bg-white border-b flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4 text-gray-500" />
                      <span className="font-semibold">{activeChannelData.name}</span>
                      <span className="text-xs text-gray-500">
                        {activeChannelData.participants.length} members
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-1 text-gray-500 hover:text-gray-700">
                        <Phone className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-500 hover:text-gray-700">
                        <Video className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-500 hover:text-gray-700">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-3 space-y-3">
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex gap-2 ${message.sender === 'You' ? 'flex-row-reverse' : ''}`}
                      >
                        <img
                          src="/api/placeholder/32/32"
                          alt={message.sender}
                          className="w-8 h-8 rounded-full flex-shrink-0"
                        />
                        <div className={`max-w-[70%] ${message.sender === 'You' ? 'text-right' : ''}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium">{message.sender}</span>
                            <span className="text-xs text-gray-500">{getMessageTime(message.timestamp)}</span>
                          </div>
                          <div className={`p-3 rounded-2xl ${
                            message.sender === 'You' 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-white border'
                          }`}>
                            {message.replyTo && (
                              <div className="mb-2 p-2 bg-black/10 rounded-lg text-sm opacity-75">
                                Replying to message...
                              </div>
                            )}
                            <p className="text-sm">{message.content}</p>
                          </div>
                          {message.reactions && (
                            <div className="flex gap-1 mt-1">
                              {message.reactions.map((reaction, index) => (
                                <span key={index} className="text-xs bg-gray-100 rounded-full px-2 py-1">
                                  {reaction.emoji} {reaction.users.length}
                                </span>
                              ))}
                            </div>
                          )}
                          <div className="flex items-center gap-1 mt-1">
                            {message.status === 'sent' && <Check className="w-3 h-3 text-gray-400" />}
                            {message.status === 'delivered' && <CheckCheck className="w-3 h-3 text-gray-400" />}
                            {message.status === 'read' && <CheckCheck className="w-3 h-3 text-blue-500" />}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Reply Indicator */}
                  {replyingTo && (
                    <div className="px-3 py-2 bg-blue-50 border-t flex items-center justify-between">
                      <div className="text-sm">
                        <span className="text-gray-600">Replying to </span>
                        <span className="font-medium">{replyingTo.sender}</span>
                      </div>
                      <button
                        onClick={() => setReplyingTo(null)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        ×
                      </button>
                    </div>
                  )}

                  {/* Message Input */}
                  <div className="p-3 bg-white border-t">
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-gray-500 hover:text-gray-700">
                        <Paperclip className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-500 hover:text-gray-700">
                        <Image className="w-4 h-4" />
                      </button>
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          placeholder={`Message #${activeChannelData.name}`}
                          value={messageInput}
                          onChange={(e) => setMessageInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <button
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="p-2 text-gray-500 hover:text-gray-700"
                      >
                        <Smile className="w-4 h-4" />
                      </button>
                      <button
                        onClick={sendMessage}
                        disabled={!messageInput.trim()}
                        className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatSidebar;