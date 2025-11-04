import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import AnimatedNumber from "@/components/AnimatedNumber";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Clock, TrendingUp, Activity, Shield, Plus, Video, FileText, BarChart3, ArrowUpRight, CheckCircle } from "lucide-react";

function Analysis() {
  // Analytics state with loading and error handling
  const [analytics, setAnalytics] = useState({
    teamUsage: null,
    storage: null,
    timelines: null,
    loading: true,
    error: null
  });

  // Real-time updates state
  const [liveUsers, setLiveUsers] = useState(6);
  const [systemStatus, setSystemStatus] = useState('active');

  // Fetch analytics data with error handling
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setAnalytics(prev => ({ ...prev, loading: true, error: null }));
        
        const [teamUsageData, storageData, timelinesData] = await Promise.all([
          fetch("/api/analytics/team-usage").then(res => {
            if (!res.ok) throw new Error('Failed to fetch team usage');
            return res.json();
          }).catch(() => ({
            userStats: [
              { name: 'John', hours: 45 },
              { name: 'Sarah', hours: 38 },
              { name: 'Mike', hours: 32 },
              { name: 'Emma', hours: 28 }
            ],
            mostActiveUser: 'John Doe',
            topFile: 'Project Proposal.docx',
            teamHours: 143,
            avgTimePerUser: '35.8 hrs'
          })),
          
          fetch("/api/analytics/storage").then(res => {
            if (!res.ok) throw new Error('Failed to fetch storage');
            return res.json();
          }).catch(() => ({
            breakdown: [
              { name: 'Excel', value: 45 },
              { name: 'Word', value: 35 },
              { name: 'PowerPoint', value: 20 }
            ],
            largestUser: 'Sarah Connor',
            largestUserStorage: '2.4',
            mostCommonType: 'Excel Files',
            totalStorage: '12.7'
          })),
          
          fetch("/api/analytics/timelines").then(res => {
            if (!res.ok) throw new Error('Failed to fetch timelines');
            return res.json();
          }).catch(() => ({
            timeline: [
              { date: 'Jan', events: 12 },
              { date: 'Feb', events: 19 },
              { date: 'Mar', events: 15 },
              { date: 'Apr', events: 22 },
              { date: 'May', events: 18 }
            ],
            nextDeadline: 'Project Alpha - Oct 15',
            upcomingMilestone: 'Beta Release - Oct 20',
            calendarSync: 'Google Calendar',
            eventsThisMonth: 8
          }))
        ]);

        setAnalytics({
          teamUsage: teamUsageData,
          storage: storageData,
          timelines: timelinesData,
          loading: false,
          error: null
        });
      } catch (error) {
        setAnalytics(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to load analytics data'
        }));
      }
    };

    fetchAnalytics();
  }, []);

  // Real-time updates simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveUsers(prev => Math.max(1, prev + Math.floor(Math.random() * 3) - 1));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Enhanced statistics for analysis page
  const stats = [
    { 
      label: "Total Files", 
      value: 47, 
      icon: FileText, 
      trend: "+12%",
      color: "from-blue-500 to-blue-600",
      description: "Documents processed this month"
    },
    { 
      label: "Team Members", 
      value: analytics.teamUsage?.userStats?.length || 8, 
      icon: Users, 
      trend: "+2",
      color: "from-green-500 to-green-600",
      description: "Active collaborators"
    },
    { 
      label: "Live Meetings", 
      value: 3, 
      icon: Video, 
      trend: "+1",
      color: "from-purple-500 to-purple-600",
      description: "Ongoing video conferences"
    },
    { 
      label: "Hours Saved", 
      value: analytics.teamUsage?.teamHours || 143, 
      icon: Clock, 
      trend: "+23%",
      color: "from-orange-500 to-orange-600",
      description: "Through collaborative features"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 transition-all duration-500">
      <Navbar />
      
      {/* Enhanced Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 lg:p-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Team Analytics
          </h1>
          <div className="flex items-center gap-2">
            <div className="px-2 sm:px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs sm:text-sm font-medium rounded-full flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              {systemStatus === 'active' ? 'Data Live' : 'Offline Mode'}
            </div>
            {liveUsers > 0 && (
              <div className="px-2 sm:px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs sm:text-sm font-medium rounded-full flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                {liveUsers} users analyzing
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3">
          <Button variant="outline" size="sm" className="gap-2 border-2">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Export Report</span>
          </Button>
          
          <Button variant="outline" size="sm" className="gap-2 border-2">
            <Activity className="w-4 h-4" />
            <span className="hidden sm:inline">Real-time</span>
          </Button>
        </div>
      </div>

      {/* Overview Statistics */}
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
                      <p className="text-xs text-muted-foreground">{stat.description}</p>
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

      {/* Enhanced Analytics Dashboard */}
      <div className="px-4 lg:px-6 mb-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Live Meetings Widget */}
          <Card className="border-0 bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-xl lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Video className="w-5 h-5" />
                Live Meetings
              </CardTitle>
              <CardDescription className="text-purple-100">
                Active video conferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold">3</span>
                  <div className="flex items-center gap-1 text-sm bg-white/20 px-2 py-1 rounded-full">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    Live
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center p-2 bg-white/10 rounded">
                    <span>Team Standup</span>
                    <span className="text-xs">5 people</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white/10 rounded">
                    <span>Project Review</span>
                    <span className="text-xs">8 people</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white/10 rounded">
                    <span>Client Call</span>
                    <span className="text-xs">3 people</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-white/20">
                  <div className="text-xs text-purple-100 mb-2">Meeting Stats</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="text-center p-2 bg-white/10 rounded">
                      <div className="font-bold">2h 45m</div>
                      <div className="text-purple-200">Avg Duration</div>
                    </div>
                    <div className="text-center p-2 bg-white/10 rounded">
                      <div className="font-bold">12</div>
                      <div className="text-purple-200">Today</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Team Usage Analytics */}
          <Card className="border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="w-5 h-5 text-blue-500" />
                Team Usage Analytics
              </CardTitle>
              <CardDescription>Time spent, most active users, top files</CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.loading ? (
                <div className="flex items-center justify-center h-48">
                  <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : analytics.error ? (
                <div className="flex flex-col items-center justify-center h-48 text-center">
                  <Shield className="w-8 h-8 text-red-500 mb-2" />
                  <p className="text-sm text-red-600 dark:text-red-400">Failed to load data</p>
                  <Button variant="outline" size="sm" className="mt-2" onClick={() => window.location.reload()}>
                    Retry
                  </Button>
                </div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={analytics.teamUsage?.userStats || []}> 
                      <XAxis dataKey="name" />
                      <YAxis />
                      <ChartTooltip />
                      <Bar dataKey="hours" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                      <span className="text-muted-foreground">Most active user:</span>
                      <span className="font-semibold">{analytics.teamUsage?.mostActiveUser || '-'}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                      <span className="text-muted-foreground">Top file:</span>
                      <span className="font-semibold truncate ml-2">{analytics.teamUsage?.topFile || '-'}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                      <span className="text-muted-foreground">Team hours this week:</span>
                      <span className="font-semibold">{analytics.teamUsage?.teamHours || '-'}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                      <span className="text-muted-foreground">Average time per user:</span>
                      <span className="font-semibold">{analytics.teamUsage?.avgTimePerUser || '-'}</span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Storage Insights */}
          <Card className="border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="w-5 h-5 text-green-500" />
                Storage Insights
              </CardTitle>
              <CardDescription>Who's using the most storage, breakdown by type</CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.loading ? (
                <div className="flex items-center justify-center h-48">
                  <div className="w-6 h-6 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : analytics.error ? (
                <div className="flex flex-col items-center justify-center h-48 text-center">
                  <Shield className="w-8 h-8 text-red-500 mb-2" />
                  <p className="text-sm text-red-600 dark:text-red-400">Failed to load data</p>
                  <Button variant="outline" size="sm" className="mt-2" onClick={() => window.location.reload()}>
                    Retry
                  </Button>
                </div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie 
                        dataKey="value" 
                        data={analytics.storage?.breakdown || []} 
                        cx="50%" 
                        cy="50%" 
                        outerRadius={60} 
                        label
                      >
                        <Cell key="excel" fill="#34d399" />
                        <Cell key="word" fill="#6366f1" />
                        <Cell key="ppt" fill="#f59e42" />
                      </Pie>
                      <ChartTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                      <span className="text-muted-foreground">Largest user:</span>
                      <span className="font-semibold">{analytics.storage?.largestUser || '-'} ({analytics.storage?.largestUserStorage || '-'} GB)</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                      <span className="text-muted-foreground">Most common type:</span>
                      <span className="font-semibold">{analytics.storage?.mostCommonType || '-'}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                      <span className="text-muted-foreground">Total storage:</span>
                      <span className="font-semibold">{analytics.storage?.totalStorage || '-'} GB</span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Project Timelines */}
          <Card className="border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="w-5 h-5 text-purple-500" />
                Project Timelines
              </CardTitle>
              <CardDescription>Calendar integration for deadlines & milestones</CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.loading ? (
                <div className="flex items-center justify-center h-48">
                  <div className="w-6 h-6 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : analytics.error ? (
                <div className="flex flex-col items-center justify-center h-48 text-center">
                  <Shield className="w-8 h-8 text-red-500 mb-2" />
                  <p className="text-sm text-red-600 dark:text-red-400">Failed to load data</p>
                  <Button variant="outline" size="sm" className="mt-2" onClick={() => window.location.reload()}>
                    Retry
                  </Button>
                </div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={analytics.timelines?.timeline || []}> 
                      <XAxis dataKey="date" />
                      <YAxis />
                      <ChartTooltip />
                      <Line type="monotone" dataKey="events" stroke="#a78bfa" strokeWidth={3} dot={{ fill: '#a78bfa', strokeWidth: 2, r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                      <span className="text-muted-foreground">Next deadline:</span>
                      <span className="font-semibold">{analytics.timelines?.nextDeadline || '-'}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                      <span className="text-muted-foreground">Upcoming milestone:</span>
                      <span className="font-semibold">{analytics.timelines?.upcomingMilestone || '-'}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                      <span className="text-muted-foreground">Calendar sync:</span>
                      <span className="font-semibold">{analytics.timelines?.calendarSync || '-'}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                      <span className="text-muted-foreground">Events this month:</span>
                      <span className="font-semibold">{analytics.timelines?.eventsThisMonth || '-'}</span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Additional Analytics Sections */}
      <div className="px-4 lg:px-6 mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance Metrics */}
          <Card className="border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="w-5 h-5 text-blue-500" />
                Performance Metrics
              </CardTitle>
              <CardDescription>System performance and usage patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">98.5%</div>
                    <div className="text-sm text-blue-700 dark:text-blue-300">Uptime</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">1.2s</div>
                    <div className="text-sm text-green-700 dark:text-green-300">Avg Response</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">256</div>
                    <div className="text-sm text-purple-700 dark:text-purple-300">Daily Sessions</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl">
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">4.7</div>
                    <div className="text-sm text-orange-700 dark:text-orange-300">User Rating</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Timeline */}
          <Card className="border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="w-5 h-5 text-green-500" />
                Recent Activity
              </CardTitle>
              <CardDescription>Latest team actions and events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <div className="font-medium">Document uploaded</div>
                    <div className="text-sm text-muted-foreground">John Doe uploaded "Project Report.docx"</div>
                    <div className="text-xs text-muted-foreground">2 minutes ago</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <div className="font-medium">Meeting completed</div>
                    <div className="text-sm text-muted-foreground">Team standup meeting finished</div>
                    <div className="text-xs text-muted-foreground">15 minutes ago</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div>
                    <div className="font-medium">Collaboration started</div>
                    <div className="text-sm text-muted-foreground">Sarah and Mike are editing "Budget.xlsx"</div>
                    <div className="text-xs text-muted-foreground">1 hour ago</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Analysis;