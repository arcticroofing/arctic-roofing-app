import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import ManagerLogin from "@/pages/ManagerLogin";
import HomeownerLogin from "@/pages/HomeownerLogin";
import ProjectManagerDashboard from "@/pages/ProjectManagerDashboard";
import HomeownerDashboard from "@/pages/HomeownerDashboard";
import ProjectDetails from "@/pages/ProjectDetails";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/manager/login" element={<ManagerLogin />} />
              <Route path="/homeowner/login" element={<HomeownerLogin />} />
              <Route
                path="/manager"
                element={
                  <SidebarProvider>
                    <ProjectManagerDashboard />
                  </SidebarProvider>
                }
              />
              <Route
                path="/homeowner"
                element={
                  <SidebarProvider>
                    <HomeownerDashboard />
                  </SidebarProvider>
                }
              />
              <Route
                path="/project/:id"
                element={
                  <SidebarProvider>
                    <ProjectDetails />
                  </SidebarProvider>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;