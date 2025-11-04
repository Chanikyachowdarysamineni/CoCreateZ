import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import React, { useEffect, useRef } from "react";

import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Files from "./pages/Files";
import Analysis from "./pages/Analysis";
import Uploads from "./pages/Uploads";
import UserProfile from "./pages/UserProfile";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import ExcelEditor from "./pages/ExcelEditor";
import DocumentEditor from "./pages/DocumentEditor";
import PowerPointEditor from "./pages/PowerPointEditor";
import AdminDashboard from "./pages/AdminDashboard";
import RoleManagement from "./pages/RoleManagement";
import TeamSpaces from "./pages/TeamSpaces";
import Backups from "./pages/Backups";
import ApiAccess from "./pages/ApiAccess";
import Integrations from "./pages/Integrations";
import Features from "./pages/Features";
import Pricing from "./pages/Pricing";
import Security from "./pages/Security";
import About from "./pages/About";
import Blog from "./pages/Blog";
import Careers from "./pages/Careers";
import Contact from "./pages/Contact";
import Documentation from "./pages/Documentation";
import Help from "./pages/Help";
import Community from "./pages/Community";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Cookies from "./pages/Cookies";
import GDPR from "./pages/GDPR";
import Status from "./pages/Status";
import Changelog from "./pages/Changelog";

const queryClient = new QueryClient();

const INACTIVITY_LIMIT = 5 * 60 * 1000; // 5 minutes in ms

function InactivityHandler() {
  const navigate = useNavigate();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      // Clear user session here if needed
      // For example: localStorage.removeItem('token');
      navigate("/login");
    }, INACTIVITY_LIMIT);
  };

  useEffect(() => {
    const events = ["mousemove", "keydown", "mousedown", "touchstart"];
    events.forEach((event) => window.addEventListener(event, resetTimer));
    resetTimer();
    return () => {
      events.forEach((event) => window.removeEventListener(event, resetTimer));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <InactivityHandler />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/files" element={<Files />} />
            <Route path="/analysis" element={<Analysis />} />
            <Route path="/uploads" element={<Uploads />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/excel-editor" element={<ExcelEditor />} />
            <Route path="/document-editor" element={<DocumentEditor />} />
            <Route path="/powerpoint-editor" element={<PowerPointEditor />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/role-management" element={<RoleManagement />} />
            <Route path="/team-spaces" element={<TeamSpaces />} />
            <Route path="/backups" element={<Backups />} />
            <Route path="/api-access" element={<ApiAccess />} />
            <Route path="/integrations" element={<Integrations />} />
            <Route path="/features" element={<Features />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/security" element={<Security />} />
            <Route path="/about" element={<About />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/docs" element={<Documentation />} />
            <Route path="/help" element={<Help />} />
            <Route path="/community" element={<Community />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/cookies" element={<Cookies />} />
            <Route path="/gdpr" element={<GDPR />} />
            <Route path="/status" element={<Status />} />
            <Route path="/changelog" element={<Changelog />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
