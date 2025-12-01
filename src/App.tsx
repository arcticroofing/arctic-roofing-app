import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AuthProvider } from "./contexts/AuthContext";
import { AppSidebar } from "./components/AppSidebar";
import Index from "@/pages/Index";
import HomeownerLogin from "@/pages/HomeownerLogin";
import HomeownerDashboard from "@/pages/HomeownerDashboard";
import ManagerLogin from "@/pages/ManagerLogin";
import ProjectManagerDashboard from "@/pages/ProjectManagerDashboard";
import CreateProject from "@/pages/CreateProject";
import ProjectDetails from "@/pages/ProjectDetails";
import ManagerSettings from "@/pages/ManagerSettings";
import ReferralManagement from "@/pages/ReferralManagement";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

// Layout with Sidebar
const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex-1 w-full min-w-0">
          {children}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

// Layout without Sidebar
const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen w-full">
      {children}
    </div>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <BrowserRouter>
            <Toaster />
            <Sonner />
            <Routes>
              {/* Public routes without sidebar */}
              <Route path="/" element={<AuthLayout><Index /></AuthLayout>} />
              <Route path="/homeowner/login" element={<AuthLayout><HomeownerLogin /></AuthLayout>} />
              <Route path="/manager/login" element={<AuthLayout><ManagerLogin /></AuthLayout>} />
              
              {/* Protected routes with sidebar */}
              <Route path="/homeowner" element={<DashboardLayout><HomeownerDashboard /></DashboardLayout>} />
              <Route path="/manager" element={<DashboardLayout><ProjectManagerDashboard /></DashboardLayout>} />
              <Route path="/manager/create-project" element={<DashboardLayout><CreateProject /></DashboardLayout>} />
              <Route path="/manager/settings" element={<DashboardLayout><ManagerSettings /></DashboardLayout>} />
              <Route path="/manager/referrals" element={<DashboardLayout><ReferralManagement /></DashboardLayout>} />
              <Route path="/manager/project/:id" element={<DashboardLayout><ProjectDetails /></DashboardLayout>} />
              
              {/* 404 */}
              <Route path="*" element={<AuthLayout><NotFound /></AuthLayout>} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
