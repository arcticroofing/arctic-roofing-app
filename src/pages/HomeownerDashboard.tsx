import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getProjectById } from '../services/projectService';
import { useAuth } from '../contexts/AuthContext';
import { ProjectStages } from '../components/ProjectStages';
import { PhotoGallery } from '../components/PhotoGallery';
import { PhotoLightbox } from '../components/PhotoLightbox';
import { useToast } from '@/hooks/use-toast';
import { subscribeToPushNotifications } from '../services/notificationService';
import { supabase } from '@/lib/supabase';
import { Calendar, DollarSign, User, MapPin, FileText, TrendingUp, Image as ImageIcon, Bell as BellIcon, BellOff } from 'lucide-react';

const HomeownerDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentHomeowner, isHomeownerAuthenticated } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(false);

  React.useEffect(() => {
    if (!isHomeownerAuthenticated) {
      navigate('/homeowner/login');
    }
  }, [isHomeownerAuthenticated, navigate]);

  React.useEffect(() => {
    if ('Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted');
    }
  }, []);

  const { data: project, isLoading, refetch } = useQuery({
    queryKey: ['project', currentHomeowner?.projectId],
    queryFn: () => getProjectById(currentHomeowner!.projectId),
    enabled: !!currentHomeowner?.projectId,
    refetchInterval: 10000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  // Manual refresh on visibility change
  React.useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('Tab became visible, refreshing project data...');
        refetch();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refetch]);

  // Real-time subscription for project updates
  React.useEffect(() => {
    if (!currentHomeowner?.projectId) return;

    console.log('Setting up real-time subscription for project:', currentHomeowner.projectId);

    const projectChannel = supabase
      .channel(`project-${currentHomeowner.projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
          filter: `id=eq.${currentHomeowner.projectId}`,
        },
        (payload) => {
          console.log('Project updated in real-time:', payload);
          refetch();
          
          if (payload.eventType === 'UPDATE') {
            toast({
              title: "Project Updated! 🔄",
              description: "Your project has been updated. Check the latest changes!",
            });
          }
        }
      )
      .subscribe();

    const updatesChannel = supabase
      .channel(`updates-${currentHomeowner.projectId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'project_updates',
          filter: `project_id=eq.${currentHomeowner.projectId}`,
        },
        (payload) => {
          console.log('New update added in real-time:', payload);
          refetch();
          
          toast({
            title: "New Update! 📢",
            description: "A new project update has been posted.",
          });
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up real-time subscriptions');
      supabase.removeChannel(projectChannel);
      supabase.removeChannel(updatesChannel);
    };
  }, [currentHomeowner?.projectId, refetch, toast]);

  const statusColors = {
    'Not Started': 'bg-gray-500',
    'In Progress': 'bg-[#96D7FE]',
    'Completed': 'bg-green-500',
    'On Hold': 'bg-yellow-500'
  };

  const handleEnableNotifications = async () => {
    if (!currentHomeowner) return;
    
    const success = await subscribeToPushNotifications(currentHomeowner.id);
    if (success) {
      setNotificationsEnabled(true);
      toast({
        title: "Notifications Enabled! 🔔",
        description: "You'll receive updates about your project.",
      });
    } else {
      toast({
        title: "Notifications Blocked",
        description: "Please enable notifications in your browser settings.",
        variant: "destructive",
      });
    }
  };

  if (!isHomeownerAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex flex-col h-full w-full bg-black">
        <header className="flex items-center sticky top-0 z-10 gap-2 sm:gap-4 border-b border-[#96D7FE]/20 bg-black px-3 sm:px-6 py-3 sm:py-4">
          <SidebarTrigger className="text-[#96D7FE]" />
          <h1 className="text-lg sm:text-2xl font-semibold text-white">My Project</h1>
        </header>
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#96D7FE] mx-auto mb-4"></div>
            <p className="text-gray-400">Loading your project...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col h-full w-full bg-black">
        <header className="flex items-center sticky top-0 z-10 gap-2 sm:gap-4 border-b border-[#96D7FE]/20 bg-black px-3 sm:px-6 py-3 sm:py-4">
          <SidebarTrigger className="text-[#96D7FE]" />
          <h1 className="text-lg sm:text-2xl font-semibold text-white">My Project</h1>
        </header>
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <p className="text-gray-400 mb-4">No project found</p>
            <p className="text-sm text-gray-500">Please contact your project manager</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-black">
      <header className="flex items-center justify-between sticky top-0 z-10 gap-2 sm:gap-4 border-b border-[#96D7FE]/20 bg-black px-3 sm:px-6 py-3 sm:py-4 shadow-lg shadow-[#96D7FE]/5">
        <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
          <SidebarTrigger className="text-[#96D7FE]" />
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-2xl font-semibold text-white truncate">
              Welcome, {currentHomeowner?.name}!
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 hidden sm:block">
              Track your roofing project progress
            </p>
          </div>
        </div>
        <Button
          onClick={handleEnableNotifications}
          variant="outline"
          size="sm"
          className={`border-[#96D7FE]/30 flex-shrink-0 ${notificationsEnabled ? 'text-[#96D7FE] border-[#96D7FE]' : 'text-gray-400'}`}
        >
          {notificationsEnabled ? <BellIcon size={18} /> : <BellOff size={18} />}
          <span className="hidden sm:inline ml-2">
            {notificationsEnabled ? 'Notifications On' : 'Enable Alerts'}
          </span>
        </Button>
      </header>

      {/* Rest of the component stays the same... */}
      <main className="flex-1 overflow-auto bg-black p-3 sm:p-6">
        {/* ... existing code ... */}
      </main>
    </div>
  );
};

export default HomeownerDashboard;