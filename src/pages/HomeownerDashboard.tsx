import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '../contexts/AuthContext';
import { ProjectStages } from '../components/ProjectStages';
import { PhotoGallery } from '../components/PhotoGallery';
import { PhotoLightbox } from '../components/PhotoLightbox';
import { useToast } from '@/hooks/use-toast';
import { subscribeToPushNotifications } from '../services/notificationService';
import { supabase } from '@/lib/supabase';
import { Calendar, DollarSign, User, MapPin, FileText, TrendingUp, Image as ImageIcon, Bell as BellIcon, BellOff, RefreshCw } from 'lucide-react';

const HomeownerDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentHomeowner, isHomeownerAuthenticated } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState(() => {
    return localStorage.getItem('homeowner-active-tab') || 'overview';
  });

  React.useEffect(() => {
    localStorage.setItem('homeowner-active-tab', activeTab);
  }, [activeTab]);

  React.useEffect(() => {
    if (!isHomeownerAuthenticated) {
      console.log('❌ Not authenticated, redirecting to login');
      navigate('/homeowner/login');
    }
  }, [isHomeownerAuthenticated, navigate]);

  React.useEffect(() => {
    if ('Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted');
    }
  }, []);

  const { data: project, isLoading, refetch, error } = useQuery({
    queryKey: ['homeowner-project', currentHomeowner?.projectId],
    queryFn: async () => {
      console.log('🔍 Fetching project for homeowner:', currentHomeowner?.projectId);
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', currentHomeowner!.projectId)
        .single();

      if (error) {
        console.error('❌ Error fetching project:', error);
        throw error;
      }

      const { data: updatesData } = await supabase
        .from('project_updates')
        .select('*')
        .eq('project_id', currentHomeowner!.projectId)
        .order('date', { ascending: false });

      const project = {
        id: data.id,
        homeownerName: data.homeowner_name,
        homeownerEmail: data.homeowner_email,
        address: data.address,
        projectType: data.project_type,
        status: data.status,
        startDate: data.start_date,
        estimatedCompletion: data.estimated_completion,
        projectManager: data.project_manager,
        budget: data.budget,
        scope: data.scope,
        progress: data.progress,
        photos: data.photos || [],
        stages: data.stages || [],
        updates: (updatesData || []).map((update) => ({
          id: update.id,
          date: update.date,
          title: update.title,
          description: update.description,
          author: update.author,
          photos: update.photos || [],
        })),
        photoGalleryUrl: data.photo_gallery_url,
        shingleSelection: data.shingle_selection,
        gutterColor: data.gutter_color,
        gutterSize: data.gutter_size,
      };

      console.log('📦 Fetched project:', project);
      console.log('📊 Stages from database:', project.stages);
      
      return project;
    },
    enabled: !!currentHomeowner?.projectId,
    refetchInterval: 2000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 0,
    gcTime: 0,
  });

  React.useEffect(() => {
    if (error) {
      console.error('❌ Error loading project:', error);
    }
    if (project) {
      console.log('✅ Project loaded successfully');
    }
  }, [error, project]);

  React.useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('👁️ Tab became visible, refreshing project data...');
        queryClient.removeQueries({ queryKey: ['homeowner-project'] });
        refetch();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refetch, queryClient]);

  React.useEffect(() => {
    if (!currentHomeowner?.projectId) return;

    console.log('🔔 Setting up real-time subscription for:', currentHomeowner.projectId);

    const previousProjectRef = React.useRef(project);

    const channel = supabase
      .channel('project-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'projects' },
        (payload) => {
          console.log('🔄 REALTIME EVENT RECEIVED:', payload);
          const changed = payload.new as any;
          
          if (changed?.id === currentHomeowner.projectId) {
            console.log('✅ OUR PROJECT WAS UPDATED!');
            
            const oldProject = previousProjectRef.current;
            let notificationTitle = "Project Updated! 🔄";
            let notificationBody = "Your project has been updated.";
            
            // Check for stage changes
            const oldStages = oldProject?.stages || [];
            const newStages = changed.stages || [];
            
            const changedStages = newStages.filter((newStage: any, index: number) => {
              const oldStage = oldStages[index];
              return oldStage && newStage.completed !== oldStage.completed;
            });

            if (changedStages.length > 0) {
              const stage = changedStages[0];
              if (stage.completed) {
                notificationTitle = "Stage Completed! ✅";
                notificationBody = `${stage.name} has been completed`;
              } else {
                notificationTitle = "Stage Updated 🔄";
                notificationBody = `${stage.name} has been marked as incomplete`;
              }
              
              if (changedStages.length > 1) {
                notificationBody += ` and ${changedStages.length - 1} other stage(s)`;
              }
            }
            
            // Check for photo changes
            const oldPhotos = oldProject?.photos || [];
            const newPhotos = changed.photos || [];
            
            if (newPhotos.length > oldPhotos.length) {
              const photosAdded = newPhotos.length - oldPhotos.length;
              notificationTitle = "New Photo Added! 📷";
              notificationBody = photosAdded === 1 
                ? "A new photo has been added to your project"
                : `${photosAdded} new photos have been added to your project`;
            }
            
            // Check if project completed
            const completedCount = newStages.filter((s: any) => s.completed).length;
            if (completedCount === newStages.length && newStages.length > 0) {
              notificationTitle = "Project Completed! 🎉";
              notificationBody = "All stages have been completed!";
            }
            
            console.log('🔄 Clearing cache and forcing refetch...');
            
            queryClient.removeQueries({ queryKey: ['homeowner-project'] });
            
            setTimeout(() => {
              refetch().then(() => {
                console.log('✅ Refetch completed');
              });
            }, 100);
            
            toast({ 
              title: notificationTitle, 
              description: notificationBody,
              duration: 5000,
            });
            
            if (Notification.permission === 'granted') {
              new Notification(notificationTitle, { 
                body: notificationBody,
                icon: '/arctic-roofing-logo.png',
                tag: 'project-update',
              });
            }
          }
        }
      )
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'project_updates' },
        (payload) => {
          console.log('📢 NEW UPDATE RECEIVED:', payload);
          const newUpdate = payload.new as any;
          
          if (newUpdate.project_id === currentHomeowner.projectId) {
            console.log('✅ New update for our project!');
            
            const notificationTitle = `New Update: ${newUpdate.title}`;
            const notificationBody = newUpdate.description;
            
            queryClient.removeQueries({ queryKey: ['homeowner-project'] });
            
            setTimeout(() => {
              refetch().then(() => {
                console.log('✅ Refetch completed');
              });
            }, 100);
            
            toast({ 
              title: notificationTitle, 
              description: notificationBody,
              duration: 5000,
            });
            
            if (Notification.permission === 'granted') {
              new Notification(notificationTitle, { 
                body: notificationBody,
                icon: '/arctic-roofing-logo.png',
                tag: 'project-update',
              });
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Subscription status:', status);
      });

    return () => {
      console.log('🧹 Unsubscribing from realtime');
      channel.unsubscribe();
    };
  }, [currentHomeowner?.projectId, project, refetch, toast, queryClient]);

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

  const handleManualRefresh = async () => {
    console.log('🔄 Manual refresh clicked');
    
    queryClient.removeQueries({ queryKey: ['homeowner-project'] });
    
    const result = await refetch();
    console.log('✅ Refetch result:', result);
    
    toast({
      title: "Refreshed!",
      description: "Latest project data loaded",
    });
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
      <header className="flex items-center justify-between sticky top-0 z-10 gap-2 border-b border-[#96D7FE]/20 bg-black px-3 sm:px-6 py-3 sm:py-4 shadow-lg shadow-[#96D7FE]/5">
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
          onClick={handleManualRefresh}
          variant="outline"
          size="sm"
          className="border-green-500/30 text-green-500 hover:bg-green-500/10 flex-shrink-0"
        >
          <RefreshCw size={18} />
          <span className="hidden sm:inline ml-2">Refresh</span>
        </Button>
        
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

      <main className="flex-1 overflow-auto bg-black p-3 sm:p-6">
        <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
          <div className="bg-gray-900 rounded-lg shadow-md p-4 border border-[#96D7FE]/20">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1 min-w-0">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-1 break-words">
                  {project.projectType}
                </h2>
                <div className="flex items-start gap-2 text-gray-400 text-xs sm:text-sm">
                  <MapPin size={14} className="flex-shrink-0 mt-0.5" />
                  <span className="break-words">{project.address}</span>
                </div>
              </div>
              <span className={`${statusColors[project.status]} text-black px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0`}>
                {project.status}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm text-gray-400 pt-3 border-t border-gray-800">
              <div className="flex items-center gap-1.5">
                <Calendar size={14} className="text-[#96D7FE] flex-shrink-0" />
                <span className="font-medium text-gray-300">Start:</span>
                <span>{new Date(project.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar size={14} className="text-[#96D7FE] flex-shrink-0" />
                <span className="font-medium text-gray-300">Est. Done:</span>
                <span>{new Date(project.estimatedCompletion).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <DollarSign size={14} className="text-[#96D7FE] flex-shrink-0" />
                <span className="font-medium text-gray-300">Budget:</span>
                <span>${project.budget.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <User size={14} className="text-[#96D7FE] flex-shrink-0" />
                <span className="font-medium text-gray-300">PM:</span>
                <span className="truncate">{project.projectManager}</span>
              </div>
              {project.shingleSelection && project.shingleSelection !== 'Not Selected' && (
                <div className="flex items-start gap-1.5 sm:col-span-2">
                  <span className="text-[#96D7FE] flex-shrink-0">🏠</span>
                  <span className="font-medium text-gray-300">Shingles:</span>
                  <span className="break-words">{project.shingleSelection}</span>
                </div>
              )}
              {project.gutterColor && project.gutterColor !== 'Not Selected' && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[#96D7FE] flex-shrink-0">🌊</span>
                  <span className="font-medium text-gray-300">Gutter:</span>
                  <span>{project.gutterColor} {project.gutterSize && project.gutterSize !== 'Not Selected' ? `(${project.gutterSize})` : ''}</span>
                </div>
              )}
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 bg-gray-900 border-2 border-[#96D7FE]/40 h-auto p-1 rounded-xl shadow-lg shadow-[#96D7FE]/10">
              <TabsTrigger 
                value="overview" 
                className="data-[state=active]:bg-[#96D7FE] data-[state=active]:text-black data-[state=active]:shadow-lg text-gray-300 text-sm sm:text-base py-3 sm:py-4 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 rounded-lg font-semibold transition-all"
              >
                <FileText size={18} className="sm:w-5 sm:h-5" />
                <span className="text-xs sm:text-base">Overview</span>
              </TabsTrigger>
              <TabsTrigger 
                value="progress" 
                className="data-[state=active]:bg-[#96D7FE] data-[state=active]:text-black data-[state=active]:shadow-lg text-gray-300 text-sm sm:text-base py-3 sm:py-4 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 rounded-lg font-semibold transition-all"
              >
                <TrendingUp size={18} className="sm:w-5 sm:h-5" />
                <span className="text-xs sm:text-base">Progress</span>
              </TabsTrigger>
              <TabsTrigger 
                value="photos" 
                className="data-[state=active]:bg-[#96D7FE] data-[state=active]:text-black data-[state=active]:shadow-lg text-gray-300 text-sm sm:text-base py-3 sm:py-4 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 rounded-lg font-semibold transition-all"
              >
                <ImageIcon size={18} className="sm:w-5 sm:h-5" />
                <div className="flex flex-col sm:flex-row items-center gap-0.5 sm:gap-1">
                  <span className="text-xs sm:text-base">Photos</span>
                  <span className="text-xs bg-[#96D7FE]/20 px-1.5 py-0.5 rounded">
                    {project.photos.length}
                  </span>
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="updates" 
                className="data-[state=active]:bg-[#96D7FE] data-[state=active]:text-black data-[state=active]:shadow-lg text-gray-300 text-sm sm:text-base py-3 sm:py-4 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 rounded-lg font-semibold transition-all"
              >
                <BellIcon size={18} className="sm:w-5 sm:h-5" />
                <div className="flex flex-col sm:flex-row items-center gap-0.5 sm:gap-1">
                  <span className="text-xs sm:text-base">Updates</span>
                  <span className="text-xs bg-[#96D7FE]/20 px-1.5 py-0.5 rounded">
                    {project.updates.length}
                  </span>
                </div>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 sm:space-y-6 mt-6">
              <Card className="bg-gray-900 border-[#96D7FE]/30">
                <CardHeader>
                  <CardTitle className="text-white text-base sm:text-lg">What We're Doing</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {project.scope.map((item, index) => (
                      <li key={index} className="flex items-start gap-2 sm:gap-3 text-gray-300 text-sm sm:text-base">
                        <span className="text-[#96D7FE] mt-1 flex-shrink-0">•</span>
                        <span className="break-words">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <PhotoGallery photoGalleryUrl={project.photoGalleryUrl} />
            </TabsContent>

            <TabsContent value="progress" className="space-y-4 sm:space-y-6 mt-6">
              <ProjectStages project={project} isManager={false} />
            </TabsContent>

            <TabsContent value="photos" className="space-y-4 sm:space-y-6 mt-6">
              <PhotoLightbox 
                project={project} 
                isManager={false} 
              />
            </TabsContent>

            <TabsContent value="updates" className="space-y-4 sm:space-y-6 mt-6">
              {project.updates.length > 0 ? (
                <Card className="bg-gray-900 border-[#96D7FE]/30">
                  <CardHeader>
                    <CardTitle className="text-white text-base sm:text-lg">Recent Updates</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 sm:space-y-6">
                      {project.updates.map((update) => (
                        <div key={update.id} className="border-l-2 border-[#96D7FE] pl-3 sm:pl-4">
                          <div className="flex flex-wrap items-center gap-2 mb-2 text-xs sm:text-sm">
                            <span className="text-gray-400">
                              {new Date(update.date).toLocaleDateString()}
                            </span>
                            <span className="text-gray-500">•</span>
                            <span className="text-gray-400">{update.author}</span>
                          </div>
                          <h4 className="text-base sm:text-lg font-semibold text-white mb-2">
                            {update.title}
                          </h4>
                          <p className="text-gray-300 mb-3 text-sm sm:text-base break-words">
                            {update.description}
                          </p>
                          {update.photos && update.photos.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                              {update.photos.map((photo, index) => (
                                <img
                                  key={index}
                                  src={photo}
                                  alt={`Update ${index + 1}`}
                                  className="w-full h-32 sm:h-48 object-cover rounded-lg border border-[#96D7FE]/20"
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-gray-900 border-[#96D7FE]/30">
                  <CardContent className="py-8 sm:py-12 text-center">
                    <p className="text-gray-400 text-sm sm:text-base">No updates yet</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default HomeownerDashboard;