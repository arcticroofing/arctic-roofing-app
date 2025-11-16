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
import { Calendar, DollarSign, User, MapPin, Eye, FileText, TrendingUp, Image as ImageIcon, Bell } from 'lucide-react';

const HomeownerDashboard = () => {
  const navigate = useNavigate();
  const { currentHomeowner, isHomeownerAuthenticated } = useAuth();

  React.useEffect(() => {
    if (!isHomeownerAuthenticated) {
      navigate('/homeowner/login');
    }
  }, [isHomeownerAuthenticated, navigate]);

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', currentHomeowner?.projectId],
    queryFn: () => getProjectById(currentHomeowner!.projectId),
    enabled: !!currentHomeowner?.projectId,
  });

  const statusColors = {
    'Not Started': 'bg-gray-500',
    'In Progress': 'bg-[#96D7FE]',
    'Completed': 'bg-green-500',
    'On Hold': 'bg-yellow-500'
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
          <p className="text-gray-400">Loading your project...</p>
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
      <header className="flex items-center sticky top-0 z-10 gap-2 sm:gap-4 border-b border-[#96D7FE]/20 bg-black px-3 sm:px-6 py-3 sm:py-4 shadow-lg shadow-[#96D7FE]/5">
        <SidebarTrigger className="text-[#96D7FE]" />
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-2xl font-semibold text-white truncate">
            Welcome, {currentHomeowner?.name}!
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 hidden sm:block">
            Track your roofing project progress
          </p>
        </div>
      </header>

      <main className="flex-1 overflow-auto bg-black p-3 sm:p-6">
        <div className="max-w-6xl mx-auto space-y-4 sm:space-y-8">
          <div className="bg-gray-900 rounded-lg shadow-md p-4 sm:p-6 border border-[#96D7FE]/20">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl sm:text-3xl font-bold text-white mb-2 break-words">
                    {project.projectType}
                  </h2>
                  <div className="flex items-start gap-2 text-gray-400 mb-2 text-sm sm:text-base">
                    <MapPin size={16} className="flex-shrink-0 mt-0.5" />
                    <span className="break-words">{project.address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400 text-sm sm:text-base">
                    <User size={16} className="flex-shrink-0" />
                    <span className="truncate">PM: {project.projectManager}</span>
                  </div>
                </div>
                <span className={`${statusColors[project.status]} text-black px-3 sm:px-6 py-2 sm:py-3 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap flex-shrink-0`}>
                  {project.status}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <Card className="bg-gray-800 border-[#96D7FE]/20">
                  <CardHeader className="pb-2 sm:pb-3">
                    <CardTitle className="text-xs sm:text-sm font-medium text-gray-400 flex items-center gap-2">
                      <Calendar size={14} className="sm:w-4 sm:h-4" />
                      Start Date
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-base sm:text-xl font-bold text-white">
                      {new Date(project.startDate).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-[#96D7FE]/20">
                  <CardHeader className="pb-2 sm:pb-3">
                    <CardTitle className="text-xs sm:text-sm font-medium text-gray-400 flex items-center gap-2">
                      <Calendar size={14} className="sm:w-4 sm:h-4" />
                      Est. Completion
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-base sm:text-xl font-bold text-white">
                      {new Date(project.estimatedCompletion).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-[#96D7FE]/20">
                  <CardHeader className="pb-2 sm:pb-3">
                    <CardTitle className="text-xs sm:text-sm font-medium text-gray-400 flex items-center gap-2">
                      <DollarSign size={14} className="sm:w-4 sm:h-4" />
                      Project Budget
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-base sm:text-xl font-bold text-white">
                      ${project.budget.toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 bg-gray-800 border border-[#96D7FE]/30 h-auto">
              <TabsTrigger 
                value="overview" 
                className="data-[state=active]:bg-[#96D7FE] data-[state=active]:text-black text-gray-300 text-xs sm:text-sm py-2 sm:py-2.5 flex items-center justify-center gap-1"
              >
                <FileText size={14} className="sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Overview</span>
                <span className="sm:hidden">Info</span>
              </TabsTrigger>
              <TabsTrigger 
                value="progress" 
                className="data-[state=active]:bg-[#96D7FE] data-[state=active]:text-black text-gray-300 text-xs sm:text-sm py-2 sm:py-2.5 flex items-center justify-center gap-1"
              >
                <TrendingUp size={14} className="sm:w-4 sm:h-4" />
                <span>Progress</span>
              </TabsTrigger>
              <TabsTrigger 
                value="photos" 
                className="data-[state=active]:bg-[#96D7FE] data-[state=active]:text-black text-gray-300 text-xs sm:text-sm py-2 sm:py-2.5 flex items-center justify-center gap-1"
              >
                <ImageIcon size={14} className="sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Photos ({project.photos.length})</span>
                <span className="sm:hidden">Photos</span>
              </TabsTrigger>
              <TabsTrigger 
                value="updates" 
                className="data-[state=active]:bg-[#96D7FE] data-[state=active]:text-black text-gray-300 text-xs sm:text-sm py-2 sm:py-2.5 flex items-center justify-center gap-1"
              >
                <Bell size={14} className="sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Updates ({project.updates.length})</span>
                <span className="sm:hidden">Updates</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 sm:space-y-8 mt-4 sm:mt-6">
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

            <TabsContent value="progress" className="space-y-4 sm:space-y-8 mt-4 sm:mt-6">
              <ProjectStages project={project} isManager={false} />
            </TabsContent>

            <TabsContent value="photos" className="space-y-4 sm:space-y-8 mt-4 sm:mt-6">
              <PhotoLightbox 
                project={project} 
                isManager={false} 
              />
            </TabsContent>

            <TabsContent value="updates" className="space-y-4 sm:space-y-8 mt-4 sm:mt-6">
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

          <div className="flex justify-center pb-4">
            <Button
              onClick={() => navigate(`/project/${project.id}`)}
              className="bg-[#96D7FE] hover:bg-[#7bc5ec] text-black font-semibold px-6 sm:px-8 py-4 sm:py-6 text-sm sm:text-lg w-full sm:w-auto"
            >
              <Eye className="mr-2" size={18} />
              View Full Details
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomeownerDashboard;