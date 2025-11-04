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
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
