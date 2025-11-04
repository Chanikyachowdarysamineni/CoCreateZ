import React, { useState, useEffect, useCallback, useMemo } from "react";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import AnimatedNumber from "@/components/AnimatedNumber";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Moon, Sun, FileText, ChevronDown, Upload, Users, Clock, TrendingUp, Activity, ArrowUpRight, CheckCircle, Search, Filter, Plus, Download, Share2, Bell, Settings, Zap, Shield, BarChart3, Trash2, Edit, Video, Mic, Calendar, MessageCircle } from "lucide-react";

// Import dashboard feature image
import dashboardFeatureImage from "@/assets/feature-dashboard.jpg";

function Dashboard() {
  const navigate = useNavigate();
  const [activeEditor, setActiveEditor] = useState<string | null>(null);
  
  // Lazy load editors for better performance
  const DocumentEditor = React.lazy(() => import("./DocumentEditor"));
  const ExcelEditor = React.lazy(() => import("./ExcelEditor"));
  const PowerPointEditor = React.lazy(() => import("./PowerPointEditor"));
  const MeetzMeeting = React.lazy(() => import("@/components/MeetzMeeting"));
  const FullScreenChat = React.lazy(() => import("@/components/FullScreenChat"));
  const FullScreenCalendar = React.lazy(() => import("@/components/FullScreenCalendar"));

  // Theme state with localStorage persistence
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('dashboard-theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Upload and drag state
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");

  // Modal states
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<any>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Real-time updates state
  const [notifications, setNotifications] = useState<any[]>([]);
  const [liveUsers, setLiveUsers] = useState(0);
  const [systemStatus, setSystemStatus] = useState('active');

  // Initialize theme and system preference detection
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('dashboard-theme')) {
        setDarkMode(e.matches);
        document.documentElement.classList.toggle("dark", e.matches);
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    document.documentElement.classList.toggle("dark", darkMode);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [darkMode]);

  // Real-time updates simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveUsers(prev => prev + Math.floor(Math.random() * 3) - 1);
      
      // Simulate random notifications
      if (Math.random() < 0.1) {
        const notifications = [
          'New file uploaded by John Doe',
          'Sarah completed document review',
          'Team meeting in 15 minutes',
          'System backup completed'
        ];
        const randomNotification = notifications[Math.floor(Math.random() * notifications.length)];
        setNotifications(prev => [...prev.slice(-4), {
          id: Date.now(),
          message: randomNotification,
          time: new Date().toLocaleTimeString()
        }]);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Advanced search with debouncing
  useEffect(() => {
    const debounceTimer = setTimeout(async () => {
      if (searchQuery.trim()) {
        setSearchLoading(true);
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 500));
          const mockResults = uploadedFiles.filter(file =>
            file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            file.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
            file.collaborators.some((c: string) => c.toLowerCase().includes(searchQuery.toLowerCase()))
          );
          setSearchResults(mockResults);
        } finally {
          setSearchLoading(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, uploadedFiles]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isCtrl = event.ctrlKey || event.metaKey;
      
      if (isCtrl) {
        switch (event.key.toLowerCase()) {
          case 'k':
            event.preventDefault();
            document.getElementById('search-input')?.focus();
            break;
          case 'n':
            event.preventDefault();
            setActiveEditor('document');
            break;
          case 'm':
            event.preventDefault();
            setActiveEditor('meetz');
            toast('Meetz Meeting opened!', { description: 'Start or join a live meeting' });
            break;
          case 't':
            event.preventDefault();
            setActiveEditor('chat');
            toast('Team Chat opened', { description: 'Full-screen chat interface' });
            break;
          case 'r':
            event.preventDefault();
            setActiveEditor('calendar');
            toast('Calendar opened', { description: 'Full-screen calendar & reminders' });
            break;
          case 'u':
            event.preventDefault();
            document.getElementById('file-upload')?.click();
            break;
          case 'd':
            event.preventDefault();
            handleToggleDarkMode();
            break;
          case ',':
            event.preventDefault();
            setSettingsOpen(true);
            break;
        }
      }

      if (event.key === 'Escape') {
        setPreviewOpen(false);
        setInviteOpen(false);
        setSettingsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Theme toggle with persistence
  const handleToggleDarkMode = useCallback(() => {
    setDarkMode(prev => {
      const next = !prev;
      localStorage.setItem('dashboard-theme', next ? 'dark' : 'light');
      document.documentElement.classList.toggle("dark", next);
      return next;
    });
  }, []);

  // Enhanced file upload with progress tracking
  const handleFileUpload = useCallback(async (files: FileList) => {
    const fileArray = Array.from(files);
    
    for (const file of fileArray) {
      const fileId = `${Date.now()}-${file.name}`;
      setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const currentProgress = prev[fileId] || 0;
          const newProgress = Math.min(currentProgress + Math.random() * 20, 100);
          
          if (newProgress >= 100) {
            clearInterval(progressInterval);
            
            // Add to uploaded files
            const newFile = {
              id: fileId,
              name: file.name,
              type: file.type.includes('spreadsheet') || file.name.endsWith('.xlsx') || file.name.endsWith('.csv') ? 'Excel' :
                    file.type.includes('presentation') || file.name.endsWith('.ppt') || file.name.endsWith('.pptx') ? 'PowerPoint' :
                    file.type.includes('document') || file.name.endsWith('.docx') ? 'Word' : 'Document',
              size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
              lastModified: 'Just now',
              collaborators: ['You'],
              status: 'Ready',
              uploadedAt: new Date()
            };
            
            setUploadedFiles(prev => [newFile, ...prev]);
            
            setTimeout(() => {
              setUploadProgress(prev => {
                const { [fileId]: removed, ...rest } = prev;
                return rest;
              });
            }, 1000);
            
            toast("File uploaded!", { 
              description: `${file.name} was uploaded successfully.` 
            });
          }
          
          return { ...prev, [fileId]: newProgress };
        });
      }, 100);
    }
  }, []);

  // Drag and drop handlers
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileUpload(files);
    }
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files);
    }
  }, [handleFileUpload]);

  // Team invitation
  const handleInvite = useCallback(() => {
    setInviteOpen(false);
    setInviteEmail("");
    toast("Invite sent!", { 
      description: "Your team member will receive an email invitation." 
    });
  }, []);

  // Memoized statistics
  const stats = useMemo(() => [
    { 
      label: "Total Files", 
      value: uploadedFiles.length + 47, 
      icon: FileText, 
      trend: "+12%",
      color: "from-blue-500 to-blue-600"
    },
    { 
      label: "Team Members", 
      value: 8, 
      icon: Users, 
      trend: "+2",
      color: "from-green-500 to-green-600"
    },
    { 
      label: "Live Meetings", 
      value: 3, 
      icon: Video, 
      trend: "+1",
      color: "from-purple-500 to-purple-600"
    },
    { 
      label: "Hours Saved", 
      value: 143, 
      icon: Clock, 
      trend: "+23%",
      color: "from-orange-500 to-orange-600"
    },
  ], [uploadedFiles.length]);

  // Filter files based on active filter
  const filteredFiles = useMemo(() => {
    const files = searchQuery ? searchResults : uploadedFiles;
    if (activeFilter === 'all') return files;
    return files.filter(file => file.type.toLowerCase() === activeFilter.toLowerCase());
  }, [uploadedFiles, searchResults, searchQuery, activeFilter]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 transition-all duration-500">
      <Navbar />
      
      {/* Enhanced Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 lg:p-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <div className="flex items-center gap-2">
            <div className="px-2 sm:px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs sm:text-sm font-medium rounded-full flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              {systemStatus === 'active' ? 'All Systems Active' : 'Maintenance Mode'}
            </div>
            {liveUsers > 0 && (
              <div className="px-2 sm:px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs sm:text-sm font-medium rounded-full flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                {liveUsers} online
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-2 hover:border-blue-300 transition-colors"
            onClick={handleToggleDarkMode}
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            <span className="hidden sm:inline text-xs font-semibold">
              {darkMode ? "Light" : "Dark"}
            </span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-2"
            onClick={() => setInviteOpen(true)}
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Invite</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-2"
            onClick={() => setSettingsOpen(true)}
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Settings</span>
          </Button>
          
          {notifications.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="relative">
                  <Bell className="w-4 h-4" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                    {notifications.length}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                {notifications.slice(-5).map(notification => (
                  <DropdownMenuItem key={notification.id} className="flex-col items-start p-3">
                    <span className="font-medium">{notification.message}</span>
                    <span className="text-xs text-muted-foreground">{notification.time}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Enhanced Editor Selection */}
      <div className="flex flex-wrap gap-3 px-4 lg:px-6 mb-6">
        <Button
          variant={activeEditor === 'document' ? "default" : "outline"}
          className="flex items-center gap-2 px-4 py-2 border-2 transition-all hover:scale-105"
          onClick={() => setActiveEditor('document')}
        >
          <FileText className="w-5 h-5 text-blue-600" />
          <span>Document Editor</span>
          <kbd className="hidden sm:inline px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded">Ctrl+N</kbd>
        </Button>
        <Button
          variant={activeEditor === 'excel' ? "default" : "outline"}
          className="flex items-center gap-2 px-4 py-2 border-2 transition-all hover:scale-105"
          onClick={() => setActiveEditor('excel')}
        >
          <BarChart3 className="w-5 h-5 text-green-600" />
          <span>Excel Editor</span>
        </Button>
        <Button
          variant={activeEditor === 'powerpoint' ? "default" : "outline"}
          className="flex items-center gap-2 px-4 py-2 border-2 transition-all hover:scale-105"
          onClick={() => setActiveEditor('powerpoint')}
        >
          <Upload className="w-5 h-5 text-orange-600" />
          <span>PowerPoint Editor</span>
        </Button>
        
        {/* Chat Button */}
        <Button
          variant={activeEditor === 'chat' ? "default" : "outline"}
          className="flex items-center gap-2 px-4 py-2 border-2 transition-all hover:scale-105"
          onClick={() => setActiveEditor('chat')}
        >
          <MessageCircle className="w-5 h-5 text-blue-600" />
          <span>Team Chat</span>
          <div className="flex items-center gap-1 text-xs bg-blue-100 dark:bg-blue-900 px-2 py-0.5 rounded-full text-blue-800 dark:text-blue-200">
            <Users className="w-3 h-3" />
            3 online
          </div>
        </Button>
        
        {/* Calendar Button */}
        <Button
          variant={activeEditor === 'calendar' ? "default" : "outline"}
          className="flex items-center gap-2 px-4 py-2 border-2 transition-all hover:scale-105"
          onClick={() => setActiveEditor('calendar')}
        >
          <Calendar className="w-5 h-5 text-purple-600" />
          <span>Calendar</span>
          <div className="flex items-center gap-1 text-xs bg-purple-100 dark:bg-purple-900 px-2 py-0.5 rounded-full text-purple-800 dark:text-purple-200">
            <Bell className="w-3 h-3" />
            5 reminders
          </div>
        </Button>
        
        <Button
          variant={activeEditor === 'meetz' ? "default" : "outline"}
          className="flex items-center gap-2 px-4 py-2 border-2 transition-all hover:scale-105 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-purple-500"
          onClick={() => setActiveEditor('meetz')}
        >
          <Video className="w-5 h-5" />
          <span>Meetz </span>
          <div className="flex items-center gap-1 text-xs bg-white/20 px-2 py-0.5 rounded-full">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Live
          </div>
        </Button>
        
        {/* Quick Actions */}
        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Share</span>
          </Button>
        </div>
      </div>

      {/* Editor Section with Enhanced Loading */}
      <div className="px-4 lg:px-6 mb-8">
        <React.Suspense fallback={
          <div className="flex items-center justify-center p-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-lg font-medium text-gray-600 dark:text-gray-300">
                Loading {
                  activeEditor === 'meetz' ? 'Meetz Meeting...' :
                  activeEditor === 'chat' ? 'Team Chat...' :
                  activeEditor === 'calendar' ? 'Calendar...' :
                  'Editor...'
                }
              </p>
            </div>
          </div>
        }>
          {activeEditor === 'document' && <DocumentEditor />}
          {activeEditor === 'excel' && <ExcelEditor />}
          {activeEditor === 'powerpoint' && <PowerPointEditor />}
          {activeEditor === 'chat' && <FullScreenChat />}
          {activeEditor === 'calendar' && <FullScreenCalendar />}
          {activeEditor === 'meetz' && <MeetzMeeting />}
        </React.Suspense>
      </div>

      {/* Enhanced Search and Filters */}
      <div className="px-4 lg:px-6 mb-8">
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
          <div className="relative flex-1 max-w-2xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              id="search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search files by name, type, or collaborator... (Ctrl+K)"
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white transition-all"
            />
            {searchLoading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 border-2 min-w-[120px]">
                  <Filter className="w-4 h-4" />
                  {activeFilter === 'all' ? 'All Files' : activeFilter}
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setActiveFilter('all')}>All Files</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveFilter('excel')}>Excel</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveFilter('word')}>Word</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveFilter('powerpoint')}>PowerPoint</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {searchQuery && (
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            {searchLoading ? 'Searching...' : `Found ${filteredFiles.length} results for "${searchQuery}"`}
          </div>
        )}
      </div>

      {/* Enhanced Drag-and-Drop Upload */}
      <div className="px-4 lg:px-6 mb-8">
        <Card className="border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl shadow-xl">
          <CardContent className="p-0">
            <div
              className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all duration-300 cursor-pointer ${
                dragActive 
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-[1.02]" 
                  : "border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <motion.div
                className="flex flex-col items-center"
                animate={dragActive ? { scale: 1.1 } : { scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                <Upload className={`w-12 h-12 mb-4 transition-colors ${dragActive ? 'text-blue-600' : 'text-gray-400'}`} />
                <span className="font-semibold text-lg mb-2 text-center">
                  {dragActive ? 'Drop files here!' : 'Drag & drop files here to upload'}
                </span>
                <span className="text-sm text-muted-foreground mb-4 text-center">
                  Supports Word, Excel, PowerPoint, and more
                </span>
                <div className="flex flex-col sm:flex-row gap-3 items-center">
                  <label className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg cursor-pointer hover:from-blue-600 hover:to-purple-600 transition-all transform hover:scale-105 shadow-lg">
                    Select Files
                    <input 
                      id="file-upload"
                      type="file" 
                      accept=".docx,.doc,.xlsx,.xls,.csv,.ppt,.pptx,.pdf,.txt" 
                      className="hidden" 
                      onChange={handleFileInput}
                      multiple 
                    />
                  </label>
                  <span className="text-xs text-muted-foreground">
                    or press <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">Ctrl+U</kbd>
                  </span>
                </div>
              </motion.div>
            </div>
            
            {/* Upload Progress */}
            {Object.keys(uploadProgress).length > 0 && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-blue-500" />
                  Uploading Files
                </h4>
                <div className="space-y-3">
                  {Object.entries(uploadProgress).map(([fileId, progress]) => (
                    <div key={fileId} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="truncate">{fileId.split('-').slice(1).join('-')}</span>
                        <span className="text-muted-foreground">{Math.round(progress)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Animated Stats */}
      <div className="px-4 lg:px-6 mb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div 
                key={stat.label} 
                initial={{ opacity: 0, y: 30 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <Card className="group relative overflow-hidden border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500">
                  <CardContent className="relative p-4 lg:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 bg-gradient-to-br ${stat.color} rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                        <ArrowUpRight className="w-4 h-4" />
                        <span className="text-sm font-semibold">{stat.trend}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                        {stat.label}
                      </p>
                      <motion.p 
                        className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent" 
                        initial={{ scale: 0.8 }} 
                        animate={{ scale: 1 }} 
                        transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                      >
                        <AnimatedNumber value={stat.value} />
                      </motion.p>
                      <p className="text-xs text-muted-foreground">vs last month</p>
                    </div>
                    
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Enhanced Recent Files */}
      <div className="px-4 lg:px-6">
        <Card className="border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-xl">
          <CardHeader className="border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Activity className="w-5 h-5 text-blue-500" />
                  Recent Files
                  {filteredFiles.length > 0 && (
                    <span className="text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full">
                      {filteredFiles.length}
                    </span>
                  )}
                </CardTitle>
                <CardDescription className="text-base">
                  Your latest collaborative documents
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2 border-2">
                      <Filter className="w-4 h-4" />
                      {activeFilter === 'all' ? 'All Files' : activeFilter}
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setActiveFilter('all')}>All Files</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setActiveFilter('excel')}>Excel</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setActiveFilter('powerpoint')}>PowerPoint</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setActiveFilter('word')}>Word</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {filteredFiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
                  {uploadedFiles.length === 0 ? 'No files yet' : 'No files match your search'}
                </h3>
                <p className="text-muted-foreground mb-4 max-w-md">
                  {uploadedFiles.length === 0 
                    ? 'Upload your first file using the drag & drop area above to get started with collaborative editing.'
                    : 'Try adjusting your search terms or filters to find the files you\'re looking for.'
                  }
                </p>
                {uploadedFiles.length === 0 && (
                  <Button 
                    onClick={() => document.getElementById('file-upload')?.click()}
                    className="gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Upload First File
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredFiles.map((file) => {
                  const Icon = FileText;
                  const typeColor = 
                    file.type === 'Excel' ? 'text-green-600' :
                    file.type === 'PowerPoint' ? 'text-orange-600' :
                    file.type === 'Word' ? 'text-blue-600' : 'text-gray-600';
                  
                  return (
                    <motion.div
                      key={file.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="group flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-gray-100 dark:border-gray-700 rounded-xl hover:border-blue-200 dark:hover:border-blue-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 transition-all duration-300 cursor-pointer hover:shadow-lg"
                      onClick={() => {
                        setPreviewFile(file);
                        setPreviewOpen(true);
                      }}
                    >
                      <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div className="relative">
                          <div className={`p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                            {file.name}
                          </h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>Modified {file.lastModified}</span>
                            <span>•</span>
                            <span className={typeColor}>{file.type}</span>
                            <span>•</span>
                            <span>{file.size}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 mt-3 sm:mt-0">
                        <div className="flex -space-x-2">
                          {file.collaborators.slice(0, 3).map((collaborator: string, index: number) => (
                            <div
                              key={index}
                              className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 border-2 border-white dark:border-gray-800 flex items-center justify-center text-sm font-bold text-white shadow-lg"
                              title={collaborator}
                            >
                              {collaborator[0]}
                            </div>
                          ))}
                          {file.collaborators.length > 3 && (
                            <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300 shadow-lg">
                              +{file.collaborators.length - 3}
                            </div>
                          )}
                        </div>
                        
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                          file.status === 'Ready' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' :
                          'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800'
                        }`}>
                          {file.status}
                        </span>
                        
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              toast("File shared!", { description: `Share link copied to clipboard` });
                            }}
                          >
                            <Share2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              toast("File downloaded!", { description: `${file.name} download started` });
                            }}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                            onClick={(e) => {
                              e.stopPropagation();
                              setUploadedFiles(prev => prev.filter(f => f.id !== file.id));
                              toast("File deleted!", { description: `${file.name} was removed` });
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Enhanced File Preview Modal */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-blue-500" />
              File Preview
            </DialogTitle>
          </DialogHeader>
          {previewFile && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <h3 className="font-semibold text-lg">{previewFile.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <span>{previewFile.type}</span>
                    <span>•</span>
                    <span>{previewFile.size}</span>
                    <span>•</span>
                    <span>Modified {previewFile.lastModified}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Share2 className="w-4 h-4" />
                    Share
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Edit className="w-4 h-4" />
                    Edit
                  </Button>
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 min-h-[300px] flex items-center justify-center">
                <div className="text-center">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 text-lg font-medium mb-2">File Preview</p>
                  <p className="text-sm text-muted-foreground">
                    Preview functionality will be implemented based on file type
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium">Collaborators:</span>
                </div>
                <div className="flex -space-x-2">
                  {previewFile.collaborators.map((collaborator: string, index: number) => (
                    <div
                      key={index}
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 border-2 border-white dark:border-gray-800 flex items-center justify-center text-sm font-bold text-white shadow-lg"
                      title={collaborator}
                    >
                      {collaborator[0]}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Enhanced Invite Team Member Modal */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Users className="w-5 h-5 text-blue-500" />
              Invite Team Member
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label htmlFor="invite-email" className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                id="invite-email"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="Enter team member's email"
                className="w-full border-2 border-gray-200 dark:border-gray-700 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Permission Level</label>
              <select className="w-full border-2 border-gray-200 dark:border-gray-700 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white">
                <option value="editor">Editor - Can edit and share</option>
                <option value="viewer">Viewer - Can view only</option>
                <option value="admin">Admin - Full access</option>
              </select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setInviteOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleInvite} 
              disabled={!inviteEmail || !inviteEmail.includes('@')}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Send Invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Modal */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-blue-500" />
              Dashboard Settings
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Appearance</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Dark Mode</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleToggleDarkMode}
                    className="gap-2"
                  >
                    {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    {darkMode ? 'Light' : 'Dark'}
                  </Button>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-3">Notifications</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Real-time notifications</span>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
                <div className="flex items-center justify-between">
                  <span>Email notifications</span>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-3">Keyboard Shortcuts</h3>
              <div className="space-y-2 text-sm bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <div className="flex justify-between">
                  <span>Search files</span>
                  <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">Ctrl + K</kbd>
                </div>
                <div className="flex justify-between">
                  <span>New document</span>
                  <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">Ctrl + N</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Start Meetz meeting</span>
                  <kbd className="px-2 py-1 bg-purple-200 dark:bg-purple-700 rounded text-xs">Ctrl + M</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Open team chat</span>
                  <kbd className="px-2 py-1 bg-blue-200 dark:bg-blue-700 rounded text-xs">Ctrl + T</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Open calendar</span>
                  <kbd className="px-2 py-1 bg-purple-200 dark:bg-purple-700 rounded text-xs">Ctrl + R</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Upload file</span>
                  <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">Ctrl + U</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Toggle theme</span>
                  <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">Ctrl + D</kbd>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setSettingsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Dashboard;