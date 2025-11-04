import { useState, useEffect } from "react";
import { io, Socket } from 'socket.io-client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  Mail, 
  Building, 
  MapPin, 
  Phone, 
  Camera, 
  Settings,
  Shield,
  Bell,
  Eye,
  Download,
  Share2,
  Users,
  Calendar
} from "lucide-react";
import Navbar from "@/components/Navbar";

const UserProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    department: "",
    location: "",
    bio: "",
    avatar: ""
  });
  const { toast } = useToast();
  // reusable profile loader so both initial load and realtime/poller can call it
  const loadProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch("/api/user/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setProfileData({
          firstName: data.user.name?.split(" ")[0] || "",
          lastName: data.user.name?.split(" ")[1] || "",
          email: data.user.email || "",
          phone: data.user.phone || "",
          company: data.user.company || "",
          department: data.user.department || "",
          location: data.user.location || "",
          bio: data.user.bio || "",
          avatar: data.user.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
        });
      }
    } catch (err) {
      // Optionally show error toast
    }
  };

  useEffect(() => {
    // initial load
    loadProfile();
  }, []);

  // Real-time updates: try WebSocket and fall back to polling every 15s
  useEffect(() => {
    let socket: Socket | null = null;
    let pollId: number | null = null;
    const token = localStorage.getItem("token");
    if (!token) return;

    const startPolling = () => {
      if (pollId) return;
      pollId = window.setInterval(() => {
        loadProfile();
      }, 15000);
    };

    try {
      const backendUrl = process.env.VITE_BACKEND_URL || `${window.location.protocol}//${window.location.host}`;
      socket = io(backendUrl, {
        transports: ['websocket'],
        auth: {
          token
        }
      });

      socket.on('connect', () => {
        (async () => {
          // Try to read cached user, otherwise fetch profile to get id
          let user = null;
          try { user = JSON.parse(localStorage.getItem('user') || 'null'); } catch {}
          if (!user) {
            try {
              const token = localStorage.getItem('token');
              if (token) {
                const res = await fetch('/api/user/profile', { headers: { Authorization: `Bearer ${token}` } });
                if (res.ok) user = await res.json();
              }
            } catch (err) {
              // ignore
            }
          }
          if (user && user.id) {
            socket?.emit('authenticate', { userId: user.id, username: user.name || user.email, channel: 'global' });
          }
          loadProfile();
        })();
      });

      socket.on('profile:update', (payload: any) => {
        if (payload && payload.user) {
          const u = payload.user;
          setProfileData(prev => ({
            ...prev,
            firstName: u.name?.split(' ')[0] || prev.firstName,
            lastName: u.name?.split(' ')[1] || prev.lastName,
            email: u.email || prev.email,
            phone: u.phone || prev.phone,
            company: u.company || prev.company,
            department: u.department || prev.department,
            location: u.location || prev.location,
            bio: u.bio || prev.bio,
            avatar: u.avatar || prev.avatar
          }));
          toast({ title: 'Profile updated', description: 'Profile updated in real-time.' });
        }
      });

      socket.on('connect_error', () => {
        startPolling();
      });

      socket.on('disconnect', () => {
        startPolling();
      });
    } catch (err) {
      startPolling();
    }

    return () => {
      try { socket?.disconnect(); } catch {}
      if (pollId) window.clearInterval(pollId);
    };
  }, [toast]);

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: false,
    weeklyDigest: true,
    collaborationAlerts: true,
    publicProfile: false,
    showActivity: true
  });


  const handleSave = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: profileData.firstName + " " + profileData.lastName,
          email: profileData.email,
          phone: profileData.phone,
          company: profileData.company,
          department: profileData.department,
          location: profileData.location,
          bio: profileData.bio,
          avatar: profileData.avatar
        })
      });
      const data = await res.json();
      if (res.ok) {
        setIsEditing(false);
        toast({
          title: "Profile updated",
          description: "Your profile has been successfully updated."
        });
      } else {
        toast({
          title: "Update failed",
          description: data.message || "Could not update profile.",
          variant: "destructive"
        });
      }
    } catch (err) {
      toast({
        title: "Update failed",
        description: "Server error. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handlePreferenceChange = (key: string, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const stats = [
    { label: "Files Uploaded", value: "24", icon: Eye },
    { label: "Collaborations", value: "8", icon: Users },
    { label: "Total Views", value: "156", icon: Eye },
    { label: "Shares", value: "12", icon: Share2 }
  ];

  const recentActivity = [
    { action: "Uploaded", file: "Q4 Budget Analysis.xlsx", time: "2 hours ago" },
    { action: "Shared", file: "Project Proposal.pptx", time: "5 hours ago" },
    { action: "Collaborated on", file: "Team Meeting Notes.docx", time: "1 day ago" },
    { action: "Downloaded", file: "Sales Dashboard.pptx", time: "2 days ago" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">User Profile</h1>
              <p className="text-muted-foreground">Manage your account settings and preferences</p>
            </div>
            
            <Button 
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              variant={isEditing ? "default" : "outline"}
              className="gap-2"
            >
              {isEditing ? (
                <>
                  <Settings className="w-4 h-4" />
                  Save Changes
                </>
              ) : (
                <>
                  <User className="w-4 h-4" />
                  Edit Profile
                </>
              )}
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Information */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Personal Information
                  </CardTitle>
                  <CardDescription>
                    Update your personal details and contact information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Avatar Section */}
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <img
                        src={profileData.avatar}
                        alt="Profile"
                        className="w-20 h-20 rounded-full object-cover border-4 border-background shadow-lg"
                      />
                      {isEditing && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="absolute -bottom-2 -right-2 rounded-full p-2 h-8 w-8"
                        >
                          <Camera className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{profileData.firstName} {profileData.lastName}</h3>
                      <p className="text-muted-foreground">{profileData.department} at {profileData.company}</p>
                    </div>
                  </div>

                  <Separator />

                  {/* Form Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          id="firstName"
                          value={profileData.firstName}
                          onChange={(e) => setProfileData(prev => ({...prev, firstName: e.target.value}))}
                          disabled={!isEditing}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          id="lastName"
                          value={profileData.lastName}
                          onChange={(e) => setProfileData(prev => ({...prev, lastName: e.target.value}))}
                          disabled={!isEditing}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          id="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData(prev => ({...prev, email: e.target.value}))}
                          disabled={!isEditing}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          id="phone"
                          value={profileData.phone}
                          onChange={(e) => setProfileData(prev => ({...prev, phone: e.target.value}))}
                          disabled={!isEditing}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="company">Company</Label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          id="company"
                          value={profileData.company}
                          onChange={(e) => setProfileData(prev => ({...prev, company: e.target.value}))}
                          disabled={!isEditing}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          id="location"
                          value={profileData.location}
                          onChange={(e) => setProfileData(prev => ({...prev, location: e.target.value}))}
                          disabled={!isEditing}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={profileData.bio}
                      onChange={(e) => setProfileData(prev => ({...prev, bio: e.target.value}))}
                      disabled={!isEditing}
                      placeholder="Tell us about yourself..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Privacy & Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Privacy & Notifications
                  </CardTitle>
                  <CardDescription>
                    Control your privacy settings and notification preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive updates about file changes and collaborations
                        </p>
                      </div>
                      <Switch
                        checked={preferences.emailNotifications}
                        onCheckedChange={(checked) => handlePreferenceChange('emailNotifications', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Push Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Get instant notifications on your device
                        </p>
                      </div>
                      <Switch
                        checked={preferences.pushNotifications}
                        onCheckedChange={(checked) => handlePreferenceChange('pushNotifications', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Weekly Digest</Label>
                        <p className="text-sm text-muted-foreground">
                          Weekly summary of your activity and team updates
                        </p>
                      </div>
                      <Switch
                        checked={preferences.weeklyDigest}
                        onCheckedChange={(checked) => handlePreferenceChange('weeklyDigest', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Public Profile</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow others to find and view your profile
                        </p>
                      </div>
                      <Switch
                        checked={preferences.publicProfile}
                        onCheckedChange={(checked) => handlePreferenceChange('publicProfile', checked)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Activity Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {stats.map((stat, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1 bg-primary/10 rounded">
                          <stat.icon className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-sm text-muted-foreground">{stat.label}</span>
                      </div>
                      <span className="font-semibold">{stat.value}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="space-y-1">
                      <p className="text-sm">
                        <span className="font-medium">{activity.action}</span> {activity.file}
                      </p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                      {index < recentActivity.length - 1 && <Separator className="mt-3" />}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Download className="w-4 h-4" />
                    Export Data
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Shield className="w-4 h-4" />
                    Security Settings
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2 text-red-600 hover:text-red-700">
                    <User className="w-4 h-4" />
                    Delete Account
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;