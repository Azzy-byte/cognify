import { lazy, Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/store/AppContext";
import AnimatedBackground from "@/components/AnimatedBackground";
import Navigation from "@/components/Navigation";
import SOSButton from "@/components/SOSButton";
import ErrorBoundary from "@/components/ErrorBoundary";

const ChatPage = lazy(() => import('@/pages/ChatPage'));
const MemoriesPage = lazy(() => import('@/pages/MemoriesPage'));
const CameraPage = lazy(() => import('@/pages/CameraPage'));
const MedicationsPage = lazy(() => import('@/pages/MedicationsPage'));
const FamilyPage = lazy(() => import('@/pages/FamilyPage'));
const MapPage = lazy(() => import('@/pages/MapPage'));
const AuditLogPage = lazy(() => import('@/pages/AuditLogPage'));
const NotFound = lazy(() => import('@/pages/NotFound'));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="w-8 h-8 border-2 border-lavender border-t-transparent rounded-full animate-spin" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppProvider>
        <BrowserRouter>
          <AnimatedBackground />
          <div className="relative z-10">
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<ChatPage />} />
                  <Route path="/memories" element={<MemoriesPage />} />
                  <Route path="/camera" element={<CameraPage />} />
                  <Route path="/reminders" element={<MedicationsPage />} />
                  <Route path="/family" element={<FamilyPage />} />
                  <Route path="/map" element={<MapPage />} />
                  <Route path="/audit" element={<AuditLogPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </div>
          <SOSButton />
          <Navigation />
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
