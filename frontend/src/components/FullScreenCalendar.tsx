import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, Clock,
  Bell, BellOff, Edit3, Trash2, Users, MapPin, Link2, Tag,
  Search, Filter, MoreVertical, AlertCircle, CheckCircle,
  Star, StarOff, Repeat, Video, Phone, FileText, Settings,
  Minimize2, Maximize2, Grid3x3, List, User, Hash, Eye,
  EyeOff, Download, Share2, ArrowLeft, ArrowRight
} from 'lucide-react';

interface Reminder {
  id: string;
  title: string;
  description?: string;
  date: Date;
  time: string;
  type: 'meeting' | 'task' | 'deadline' | 'personal' | 'holiday';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'upcoming' | 'completed' | 'missed' | 'in-progress';
  recurring?: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  attendees?: string[];
  location?: string;
  attachments?: string[];
  notifications: number[]; // minutes before event
  isStarred: boolean;
  createdBy: string;
  tags: string[];
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  reminders: Reminder[];
}

const FullScreenCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day' | 'agenda'>('month');
  const [showReminderForm, setShowReminderForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [reminders, setReminders] = useState<Reminder[]>([
    {
      id: '1',
      title: 'Team Standup Meeting',
      description: 'Daily standup with the development team to discuss progress and blockers',
      date: new Date(),
      time: '09:00',
      type: 'meeting',
      priority: 'medium',
      status: 'upcoming',
      recurring: 'daily',
      attendees: ['John Doe', 'Jane Smith', 'Mike Johnson'],
      location: 'Conference Room A',
      notifications: [15, 5],
      isStarred: true,
      createdBy: 'You',
      tags: ['work', 'daily', 'team']
    },
    {
      id: '2',
      title: 'Project Deadline - Dashboard Implementation',
      description: 'Complete the frontend dashboard implementation with all features',
      date: new Date(Date.now() + 86400000 * 3), // 3 days from now
      time: '17:00',
      type: 'deadline',
      priority: 'high',
      status: 'upcoming',
      recurring: 'none',
      notifications: [1440, 60, 15], // 1 day, 1 hour, 15 min before
      isStarred: true,
      createdBy: 'You',
      tags: ['work', 'deadline', 'frontend']
    },
    {
      id: '3',
      title: 'Code Review Session',
      description: 'Review pull requests and provide detailed feedback to team members',
      date: new Date(Date.now() + 86400000), // tomorrow
      time: '14:30',
      type: 'meeting',
      priority: 'medium',
      status: 'upcoming',
      recurring: 'weekly',
      attendees: ['Senior Dev', 'Tech Lead'],
      notifications: [30],
      isStarred: false,
      createdBy: 'You',
      tags: ['work', 'review', 'code']
    },
    {
      id: '4',
      title: 'Doctor Appointment',
      description: 'Annual health checkup and routine examinations',
      date: new Date(Date.now() + 86400000 * 7), // next week
      time: '10:00',
      type: 'personal',
      priority: 'medium',
      status: 'upcoming',
      recurring: 'yearly',
      location: 'Health Center',
      notifications: [1440, 120], // 1 day, 2 hours before
      isStarred: false,
      createdBy: 'You',
      tags: ['personal', 'health']
    },
    {
      id: '5',
      title: 'Client Presentation',
      description: 'Present the new features and roadmap to key stakeholders',
      date: new Date(Date.now() + 86400000 * 5), // 5 days from now
      time: '15:00',
      type: 'meeting',
      priority: 'high',
      status: 'upcoming',
      recurring: 'none',
      attendees: ['Client Team', 'Sales Rep', 'Product Manager'],
      location: 'Client Office',
      notifications: [60, 15],
      isStarred: true,
      createdBy: 'You',
      tags: ['work', 'client', 'presentation']
    }
  ]);

  const [newReminder, setNewReminder] = useState<Partial<Reminder>>({
    title: '',
    description: '',
    date: new Date(),
    time: '09:00',
    type: 'task',
    priority: 'medium',
    recurring: 'none',
    notifications: [15],
    isStarred: false,
    tags: []
  });

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getCalendarDays = (): CalendarDay[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days: CalendarDay[] = [];
    const today = new Date();

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const dayReminders = reminders.filter(reminder => 
        reminder.date.toDateString() === date.toDateString()
      );

      days.push({
        date,
        isCurrentMonth: date.getMonth() === month,
        isToday: date.toDateString() === today.toDateString(),
        reminders: dayReminders
      });
    }

    return days;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'meeting': return <Users className="w-4 h-4" />;
      case 'task': return <CheckCircle className="w-4 h-4" />;
      case 'deadline': return <AlertCircle className="w-4 h-4" />;
      case 'personal': return <User className="w-4 h-4" />;
      case 'holiday': return <CalendarIcon className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const addReminder = () => {
    if (!newReminder.title?.trim()) return;

    const reminder: Reminder = {
      id: Date.now().toString(),
      title: newReminder.title,
      description: newReminder.description || '',
      date: newReminder.date || new Date(),
      time: newReminder.time || '09:00',
      type: newReminder.type || 'task',
      priority: newReminder.priority || 'medium',
      status: 'upcoming',
      recurring: newReminder.recurring || 'none',
      notifications: newReminder.notifications || [15],
      isStarred: newReminder.isStarred || false,
      createdBy: 'You',
      tags: newReminder.tags || []
    };

    setReminders(prev => [...prev, reminder]);
    setNewReminder({
      title: '',
      description: '',
      date: new Date(),
      time: '09:00',
      type: 'task',
      priority: 'medium',
      recurring: 'none',
      notifications: [15],
      isStarred: false,
      tags: []
    });
    setShowReminderForm(false);
  };

  const toggleReminderStatus = (id: string) => {
    setReminders(prev => prev.map(reminder => 
      reminder.id === id 
        ? { ...reminder, status: reminder.status === 'completed' ? 'upcoming' : 'completed' }
        : reminder
    ));
  };

  const deleteReminder = (id: string) => {
    setReminders(prev => prev.filter(reminder => reminder.id !== id));
    setSelectedReminder(null);
  };

  const getUpcomingReminders = () => {
    const now = new Date();
    return reminders
      .filter(reminder => {
        const reminderDateTime = new Date(reminder.date);
        reminderDateTime.setHours(parseInt(reminder.time.split(':')[0]), parseInt(reminder.time.split(':')[1]));
        return reminderDateTime > now && reminder.status !== 'completed';
      })
      .sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        dateA.setHours(parseInt(a.time.split(':')[0]), parseInt(a.time.split(':')[1]));
        dateB.setHours(parseInt(b.time.split(':')[0]), parseInt(b.time.split(':')[1]));
        return dateA.getTime() - dateB.getTime();
      });
  };

  const calendarDays = getCalendarDays();
  const upcomingReminders = getUpcomingReminders();
  const todayReminders = reminders.filter(r => r.date.toDateString() === new Date().toDateString());

  return (
    <div className="h-screen flex bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <motion.div
        className={`bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 ${
          sidebarCollapsed ? 'w-16' : 'w-80'
        }`}
        initial={false}
        animate={{ width: sidebarCollapsed ? 64 : 320 }}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <div className="flex items-center gap-3">
                <CalendarIcon className="w-6 h-6 text-purple-600" />
                <div>
                  <h1 className="font-semibold text-lg">Calendar</h1>
                  <p className="text-sm text-gray-500">{upcomingReminders.length} upcoming</p>
                </div>
              </div>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {sidebarCollapsed ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {!sidebarCollapsed && (
          <>
            {/* Quick Actions */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowReminderForm(true)}
                className="w-full bg-purple-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Event
              </button>
            </div>

            {/* Mini Calendar */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                  className="p-1 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <h3 className="font-semibold">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h3>
                <button
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                  className="p-1 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map(day => (
                  <div key={day} className="text-center text-xs font-medium text-gray-500 p-1">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.slice(0, 35).map((day, index) => (
                  <motion.button
                    key={index}
                    onClick={() => setSelectedDate(day.date)}
                    className={`
                      aspect-square p-1 text-xs rounded relative transition-all
                      ${day.isCurrentMonth ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400'}
                      ${day.isToday ? 'bg-purple-600 text-white font-bold' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}
                      ${selectedDate?.toDateString() === day.date.toDateString() ? 'ring-2 ring-purple-500' : ''}
                    `}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {day.date.getDate()}
                    {day.reminders.length > 0 && (
                      <div className="absolute bottom-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Today's Events */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-3">Today's Events</h3>
              {todayReminders.length > 0 ? (
                <div className="space-y-2">
                  {todayReminders.slice(0, 3).map((reminder) => (
                    <div key={reminder.id} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className={`p-1 rounded-full text-white ${getPriorityColor(reminder.priority)}`}>
                        {getTypeIcon(reminder.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{reminder.title}</p>
                        <p className="text-xs text-gray-500">{reminder.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No events today</p>
              )}
            </div>

            {/* View Mode Selector */}
            <div className="p-4">
              <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-3">View</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'month', label: 'Month', icon: Grid3x3 },
                  { key: 'week', label: 'Week', icon: List },
                  { key: 'day', label: 'Day', icon: Clock },
                  { key: 'agenda', label: 'Agenda', icon: List }
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setViewMode(key as any)}
                    className={`p-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${
                      viewMode === key 
                        ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300' 
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </motion.div>

      {/* Main Calendar Area */}
      <div className="flex-1 flex flex-col">
        {/* Calendar Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                  className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="font-semibold text-xl">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <button
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                  className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-1 text-sm bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800"
              >
                Today
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <Search className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <Filter className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 overflow-auto">
          {viewMode === 'month' && (
            <div className="p-6">
              <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                {/* Header */}
                {dayNames.map(day => (
                  <div key={day} className="bg-gray-50 dark:bg-gray-800 p-4 text-center font-semibold text-sm text-gray-600 dark:text-gray-400">
                    {day}
                  </div>
                ))}
                
                {/* Calendar Days */}
                {calendarDays.map((day, index) => (
                  <motion.div
                    key={index}
                    className={`
                      bg-white dark:bg-gray-800 p-2 min-h-[120px] cursor-pointer transition-colors
                      ${day.isCurrentMonth ? '' : 'opacity-50'}
                      ${day.isToday ? 'bg-purple-50 dark:bg-purple-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}
                    `}
                    onClick={() => setSelectedDate(day.date)}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className={`
                      w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium mb-2
                      ${day.isToday ? 'bg-purple-600 text-white' : 'text-gray-900 dark:text-gray-100'}
                    `}>
                      {day.date.getDate()}
                    </div>
                    <div className="space-y-1">
                      {day.reminders.slice(0, 3).map((reminder) => (
                        <div
                          key={reminder.id}
                          className={`text-xs p-1 rounded truncate ${getPriorityColor(reminder.priority)} text-white`}
                          title={reminder.title}
                        >
                          {reminder.title}
                        </div>
                      ))}
                      {day.reminders.length > 3 && (
                        <div className="text-xs text-gray-500">
                          +{day.reminders.length - 3} more
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {viewMode === 'agenda' && (
            <div className="p-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Upcoming Events</h3>
                {upcomingReminders.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingReminders.map((reminder) => (
                      <motion.div
                        key={reminder.id}
                        className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer"
                        onClick={() => setSelectedReminder(reminder)}
                        whileHover={{ y: -2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`p-2 rounded-full text-white ${getPriorityColor(reminder.priority)}`}>
                            {getTypeIcon(reminder.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold">{reminder.title}</h4>
                              {reminder.isStarred && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{reminder.description}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <CalendarIcon className="w-4 h-4" />
                                {reminder.date.toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {reminder.time}
                              </span>
                              {reminder.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  {reminder.location}
                                </span>
                              )}
                            </div>
                            {reminder.tags.length > 0 && (
                              <div className="flex gap-1 mt-2">
                                {reminder.tags.map((tag, index) => (
                                  <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded-full">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleReminderStatus(reminder.id);
                              }}
                              className={`p-1 rounded ${
                                reminder.status === 'completed' 
                                  ? 'text-green-600 bg-green-100 dark:bg-green-900' 
                                  : 'text-gray-500 hover:text-green-600'
                              }`}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button className="p-1 rounded text-gray-500 hover:text-blue-600">
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteReminder(reminder.id);
                              }}
                              className="p-1 rounded text-gray-500 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <CalendarIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-2">No upcoming events</p>
                    <button
                      onClick={() => setShowReminderForm(true)}
                      className="text-purple-600 hover:text-purple-700 font-medium"
                    >
                      Create your first event
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Reminder Form Modal */}
      <AnimatePresence>
        {showReminderForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowReminderForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-lg">Create New Event</h3>
                <button
                  onClick={() => setShowReminderForm(false)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                  <input
                    type="text"
                    value={newReminder.title || ''}
                    onChange={(e) => setNewReminder(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter event title..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <textarea
                    value={newReminder.description || ''}
                    onChange={(e) => setNewReminder(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    rows={3}
                    placeholder="Enter description..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                    <input
                      type="date"
                      value={newReminder.date?.toISOString().split('T')[0] || ''}
                      onChange={(e) => setNewReminder(prev => ({ ...prev, date: new Date(e.target.value) }))}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time</label>
                    <input
                      type="time"
                      value={newReminder.time || ''}
                      onChange={(e) => setNewReminder(prev => ({ ...prev, time: e.target.value }))}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                    <select
                      value={newReminder.type || ''}
                      onChange={(e) => setNewReminder(prev => ({ ...prev, type: e.target.value as any }))}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="task">Task</option>
                      <option value="meeting">Meeting</option>
                      <option value="deadline">Deadline</option>
                      <option value="personal">Personal</option>
                      <option value="holiday">Holiday</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                    <select
                      value={newReminder.priority || ''}
                      onChange={(e) => setNewReminder(prev => ({ ...prev, priority: e.target.value as any }))}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Recurring</label>
                  <select
                    value={newReminder.recurring || ''}
                    onChange={(e) => setNewReminder(prev => ({ ...prev, recurring: e.target.value as any }))}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="none">No repeat</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={addReminder}
                    className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
                  >
                    Create Event
                  </button>
                  <button
                    onClick={() => setShowReminderForm(false)}
                    className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FullScreenCalendar;