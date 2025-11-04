import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, Clock,
  Bell, BellOff, Edit3, Trash2, Users, MapPin, Link2, Tag,
  Search, Filter, MoreVertical, AlertCircle, CheckCircle,
  Star, StarOff, Repeat, Video, Phone, FileText, Settings
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

interface CalendarSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const CalendarSidebar: React.FC<CalendarSidebarProps> = ({ isOpen, onClose }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day' | 'agenda'>('month');
  const [showReminderForm, setShowReminderForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null);

  const [reminders, setReminders] = useState<Reminder[]>([
    {
      id: '1',
      title: 'Team Standup Meeting',
      description: 'Daily standup with the development team',
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
      title: 'Project Deadline',
      description: 'Complete the frontend dashboard implementation',
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
      description: 'Review pull requests and provide feedback',
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
      description: 'Annual health checkup',
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
      case 'personal': return <Star className="w-4 h-4" />;
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
      })
      .slice(0, 5);
  };

  const calendarDays = getCalendarDays();
  const upcomingReminders = getUpcomingReminders();

  return (
    <>
      {/* Calendar Toggle Button */}
      <motion.button
        onClick={onClose}
        className={`fixed right-4 top-32 z-50 p-3 rounded-full shadow-lg transition-all duration-300 ${
          isOpen ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{ display: 'none' }} // Hide the original toggle button
      >
        <CalendarIcon className="w-6 h-6" />
        {upcomingReminders.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {upcomingReminders.length}
          </span>
        )}
      </motion.button>

      {/* Calendar Sidebar */}
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

            {/* Calendar Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 20 }}
              className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 flex flex-col"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CalendarIcon className="w-6 h-6" />
                    <div>
                      <h2 className="font-semibold text-lg">Calendar & Reminders</h2>
                      <p className="text-purple-100 text-sm">
                        {upcomingReminders.length} upcoming reminders
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

              {/* Controls */}
              <div className="p-3 border-b space-y-3">
                {/* Month Navigation */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                    className="p-1 text-gray-500 hover:text-gray-700"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <h3 className="font-semibold text-lg">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </h3>
                  <button
                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                    className="p-1 text-gray-500 hover:text-gray-700"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowReminderForm(true)}
                    className="flex-1 bg-purple-600 text-white px-3 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Reminder
                  </button>
                  <button className="px-3 py-2 border rounded-lg text-gray-600 hover:bg-gray-50">
                    <Search className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Mini Calendar */}
              <div className="p-3 border-b">
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {dayNames.map(day => (
                    <div key={day} className="text-center text-xs font-medium text-gray-500 p-1">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day, index) => (
                    <motion.button
                      key={index}
                      onClick={() => setSelectedDate(day.date)}
                      className={`
                        aspect-square p-1 text-xs rounded-lg relative transition-all
                        ${day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                        ${day.isToday ? 'bg-purple-600 text-white font-bold' : 'hover:bg-gray-100'}
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

              {/* Upcoming Reminders */}
              <div className="flex-1 overflow-y-auto p-3">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800">Upcoming Reminders</h3>
                  <span className="text-sm text-gray-500">{upcomingReminders.length} items</span>
                </div>

                <div className="space-y-2">
                  {upcomingReminders.map((reminder) => (
                    <motion.div
                      key={reminder.id}
                      onClick={() => setSelectedReminder(reminder)}
                      className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      whileHover={{ x: 2 }}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-1 rounded-full text-white ${getPriorityColor(reminder.priority)}`}>
                          {getTypeIcon(reminder.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-sm truncate">{reminder.title}</h4>
                            {reminder.isStarred && <Star className="w-3 h-3 text-yellow-500 fill-current" />}
                          </div>
                          <p className="text-xs text-gray-500 mb-1">{reminder.description}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <CalendarIcon className="w-3 h-3" />
                              {reminder.date.toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {reminder.time}
                            </span>
                          </div>
                          {reminder.tags.length > 0 && (
                            <div className="flex gap-1 mt-2">
                              {reminder.tags.map((tag, index) => (
                                <span key={index} className="px-2 py-1 bg-gray-100 text-xs rounded-full">
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
                                ? 'text-green-600 bg-green-100' 
                                : 'text-gray-500 hover:text-green-600'
                            }`}
                          >
                            <CheckCircle className="w-4 h-4" />
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

                {upcomingReminders.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No upcoming reminders</p>
                    <button
                      onClick={() => setShowReminderForm(true)}
                      className="mt-2 text-purple-600 hover:text-purple-700 font-medium"
                    >
                      Create your first reminder
                    </button>
                  </div>
                )}
              </div>

              {/* Add Reminder Form */}
              <AnimatePresence>
                {showReminderForm && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="absolute inset-0 bg-white z-10 p-4 overflow-y-auto"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-lg">Add New Reminder</h3>
                      <button
                        onClick={() => setShowReminderForm(false)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        ×
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input
                          type="text"
                          value={newReminder.title || ''}
                          onChange={(e) => setNewReminder(prev => ({ ...prev, title: e.target.value }))}
                          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Enter reminder title..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                          value={newReminder.description || ''}
                          onChange={(e) => setNewReminder(prev => ({ ...prev, description: e.target.value }))}
                          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          rows={3}
                          placeholder="Enter description..."
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                          <input
                            type="date"
                            value={newReminder.date?.toISOString().split('T')[0] || ''}
                            onChange={(e) => setNewReminder(prev => ({ ...prev, date: new Date(e.target.value) }))}
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                          <input
                            type="time"
                            value={newReminder.time || ''}
                            onChange={(e) => setNewReminder(prev => ({ ...prev, time: e.target.value }))}
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                          <select
                            value={newReminder.type || ''}
                            onChange={(e) => setNewReminder(prev => ({ ...prev, type: e.target.value as any }))}
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          >
                            <option value="task">Task</option>
                            <option value="meeting">Meeting</option>
                            <option value="deadline">Deadline</option>
                            <option value="personal">Personal</option>
                            <option value="holiday">Holiday</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                          <select
                            value={newReminder.priority || ''}
                            onChange={(e) => setNewReminder(prev => ({ ...prev, priority: e.target.value as any }))}
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Recurring</label>
                        <select
                          value={newReminder.recurring || ''}
                          onChange={(e) => setNewReminder(prev => ({ ...prev, recurring: e.target.value as any }))}
                          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                          className="flex-1 bg-purple-600 text-white py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors"
                        >
                          Add Reminder
                        </button>
                        <button
                          onClick={() => setShowReminderForm(false)}
                          className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default CalendarSidebar;