import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Settings, User, LogOut, Menu, X, 
  Home, FileText, Upload, Users, Calendar, MessageCircle,
  Sun, Moon, Monitor, ChevronDown, Plus, HelpCircle,
  Zap, Shield, Activity, Crown, Palette, Globe, BarChart3
} from "lucide-react";
import { useTheme } from "@/lib/theme";

const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(localStorage.getItem("token")));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const { theme, setTheme, toggle } = useTheme();
  
  const profileRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Listen for auth changes (storage events)
  useEffect(() => {
    const handleStorageChange = () => {
      setIsAuthenticated(Boolean(localStorage.getItem("token")));
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'k':
            event.preventDefault();
            searchRef.current?.focus();
            break;
          case '/':
            event.preventDefault();
            searchRef.current?.focus();
            break;
        }
      }
      if (event.key === 'Escape') {
        setSearchFocused(false);
        setProfileMenuOpen(false);
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    navigate('/login');
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme as any);
  };

  const navigationItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Files', href: '/files', icon: FileText },
    { name: 'Analysis', href: '/analysis', icon: BarChart3 },
    { name: 'Uploads', href: '/uploads', icon: Upload },
    { name: 'Team Spaces', href: '/dashboard?editor=chat', icon: Users },
  ];

  const quickActions = [
    { name: 'New Document', action: () => navigate('/dashboard?editor=document'), icon: FileText },
    { name: 'Start Meeting', action: () => navigate('/dashboard?editor=meetz'), icon: Users },
    { name: 'Open Chat', action: () => navigate('/dashboard?editor=chat'), icon: MessageCircle },
    { name: 'View Calendar', action: () => navigate('/dashboard?editor=calendar'), icon: Calendar },
  ];

  const isActivePath = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <>
  <nav className="sticky top-0 z-50 backdrop-blur-sm bg-background/95 dark:bg-background/95 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo and Brand */}
            <div className="flex items-center gap-4">
              <Link 
                to="/" 
                className="flex items-center gap-3 group"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                  <span className="text-white font-bold text-sm">CX</span>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  CoCreateX
                </span>
              </Link>

              {/* Navigation Items - Desktop */}
              {isAuthenticated && (
                <div className="hidden md:flex items-center space-x-1 ml-8">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`
                          flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                          ${isActivePath(item.href)
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                          }
                        `}
                      >
                        <Icon className="w-4 h-4" />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Center - Search Bar */}
            {isAuthenticated && (
              <div className="hidden md:flex flex-1 max-w-lg mx-8">
                <div className="relative w-full">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <input
                    ref={searchRef}
                    type="text"
                    placeholder="Search files, team members... (Ctrl+K)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                    className={"block w-full pl-10 pr-3 py-2 rounded-lg leading-5 " +
                      "bg-card text-card-foreground border border-input placeholder-muted-foreground " +
                      "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"}
                  />
                  
                  {/* Search Suggestions */}
                  <AnimatePresence>
                    {searchFocused && searchQuery.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full mt-2 w-full bg-card rounded-lg shadow-lg border border-border py-2 z-50"
                      >
                        <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Quick Actions
                        </div>
                        {quickActions.map((action) => {
                          const Icon = action.icon;
                          return (
                            <button
                              key={action.name}
                              onClick={action.action}
                              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-card-foreground hover:bg-accent hover:text-accent-foreground"
                            >
                              <Icon className="w-4 h-4" />
                              {action.name}
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Right Side - User Menu */}
                  <div className="flex items-center gap-2">
              {!isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <Link
                    to="/login"
                    className="text-muted-foreground hover:text-foreground font-medium transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
                  >
                    Sign Up
                  </Link>
                </div>
              ) : (
                <>
                  {/* Profile Menu */}
                  <div className="relative" ref={profileRef}>
                    <button
                      onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                      className="flex items-center gap-2 p-1 rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </button>

                    <AnimatePresence>
                      {profileMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          className="absolute right-0 top-full mt-2 w-64 bg-card rounded-lg shadow-lg border border-border py-2 z-50"
                        >
                          {/* User Info */}
                          <div className="px-4 py-3 border-b border-border">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <p className="font-medium text-card-foreground">John Doe</p>
                                <p className="text-sm text-muted-foreground">john@cocreatex.com</p>
                              </div>
                            </div>
                          </div>

                          {/* Menu Items */}
                          <div className="py-2">
                            <Link
                              to="/profile"
                              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <User className="w-4 h-4" />
                              Profile Settings
                            </Link>
                            <Link
                              to="/team-spaces"
                              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <Users className="w-4 h-4" />
                              Team Spaces
                            </Link>
                            <Link
                              to="/integrations"
                              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <Zap className="w-4 h-4" />
                              Integrations
                            </Link>
                          </div>

                          {/* Theme Selector */}
                          <div className="border-t border-gray-200 dark:border-gray-700 py-2">
                            <div className="px-4 py-2">
                              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                                Theme
                              </p>
                              <div className="flex gap-1">
                                {[
                                  { key: 'light', icon: Sun, label: 'Light' },
                                  { key: 'dark', icon: Moon, label: 'Dark' },
                                  { key: 'system', icon: Monitor, label: 'System' }
                                ].map(({ key, icon: Icon, label }) => (
                                  <button
                                    key={key}
                                    onClick={() => handleThemeChange(key)}
                                    className={`
                                      flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors
                                      ${theme === key 
                                        ? 'bg-primary/10 text-primary' 
                                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                                      }
                                    `}
                                  >
                                    <Icon className="w-3 h-3" />
                                    {label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Bottom Actions */}
                          <div className="border-t border-border py-2">
                            <Link
                              to="/help"
                              className="flex items-center gap-3 px-4 py-2 text-sm text-card-foreground hover:bg-accent hover:text-accent-foreground"
                            >
                              <HelpCircle className="w-4 h-4" />
                              Help & Support
                            </Link>
                            <button
                              onClick={handleLogout}
                              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-destructive hover:bg-destructive/10"
                            >
                              <LogOut className="w-4 h-4" />
                              Sign Out
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Quick Theme Toggle */}
                  <button
                    onClick={() => toggle()}
                    aria-label="Toggle color scheme"
                    aria-pressed={theme === 'dark'}
                    title="Toggle theme"
                    className="hidden md:inline-flex p-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    <span className="sr-only">Toggle color scheme</span>
                  </button>

                  {/* Mobile Menu Button */}
                  <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && isAuthenticated && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-border bg-background"
            >
              <div className="px-4 py-4 space-y-2">
                {/* Search on Mobile */}
                <div className="relative mb-4">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search..."
                    className="block w-full pl-10 pr-3 py-2 border border-input rounded-lg bg-card text-card-foreground"
                  />
                </div>

                {/* Navigation Items */}
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`
                        flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                        ${isActivePath(item.href)
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                        }
                      `}
                    >
                      <Icon className="w-4 h-4" />
                      {item.name}
                    </Link>
                  );
                })}

                {/* Quick Actions */}
                <div className="border-t border-border pt-4 mt-4">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                    Quick Actions
                  </p>
                  {quickActions.map((action) => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={action.name}
                        onClick={action.action}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-card-foreground hover:bg-accent hover:text-accent-foreground rounded-lg"
                      >
                        <Icon className="w-4 h-4" />
                        {action.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
};

export default Navbar;