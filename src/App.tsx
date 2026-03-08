import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/store/AppContext";
import AnimatedBackground from "@/components/AnimatedBackground";
import Navigation from "@/components/Navigation";
import SOSButton from "@/components/SOSButton";
import ChatPage from "@/pages/ChatPage";
import MemoriesPage from "@/pages/MemoriesPage";
import CameraPage from "@/pages/CameraPage";
import MedicationsPage from "@/pages/MedicationsPage";
import FamilyPage from "@/pages/FamilyPage";
import MapPage from "@/pages/MapPage";
import AuditLogPage from "@/pages/AuditLogPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppProvider>
        <BrowserRouter>
          <AnimatedBackground />
          <div className="relative z-10">
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
          </div>
          <SOSButton />
          <Navigation />
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
