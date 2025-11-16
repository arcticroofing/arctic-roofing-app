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
import { Calendar, DollarSign, User, MapPin, Eye } from 'lucide-react';

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
        <header className="flex items-center sticky top-0 z-10 gap-4 border-b border-[#96D7FE]/20 bg-black px-6 py-4">
          <SidebarTrigger className="text-[#96D7FE]" />
          <h1 className="text-2xl font-semibold text-white">My Project</h1>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <p className="text-gray-400">Loading your project...</p>
        </main>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col h-full w-full bg-black">
        <header className="flex items-center sticky top-0 z-10 gap-4 border-b border-[#96D7FE]/20 bg-black px-6 py-4">
          <SidebarTrigger className="text-[#96D7FE]" />
          <h1 className="text-2xl font-semibold text-white">My Project</h1>
        </header>
        <main className="flex-1 flex items-center justify-center">
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
      <header className="flex items-center sticky top-0 z-10 gap-4 border-b border-[#96D7FE]/20 bg-black px-6 py-4 shadow-lg shadow-[#96D7FE]/5">
        <SidebarTrigger className="text-[#96D7FE]" />
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-white">Welcome, {currentHomeowner?.name}!</h1>
          <p className="text-sm text-gray-400">Track your roofing project progress</p>
        </div>
      </header>

      <main className="flex-1 overflow-auto bg-black p-6">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="bg-gray-900 rounded-lg shadow-md p-6 border border-[#96D7FE]/20">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">{project.projectType}</h2>
                <div className="flex items-center gap-2 text-gray-400 mb-2">
                  <MapPin size={16} />
                  <span>{project.address}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <User size={16} />
                  <span>Project Manager: {project.projectManager}</span>
                </div>
              </div>
              <span className={`${statusColors[project.status]} text-black px-6 py-3 rounded-full text-sm font-semibold`}>
                {project.status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gray-800 border-[#96D7FE]/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                    <Calendar size={16} />
                    Start Date
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xl font-bold text-white">
                    {new Date(project.startDate).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-[#96D7FE]/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                    <Calendar size={16} />
                    Est. Completion
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xl font-bold text-white">
                    {new Date(project.estimatedCompletion).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-[#96D7FE]/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                    <DollarSign size={16} />
                    Project Budget
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xl font-bold text-white">
                    ${project.budget.toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-gray-800 border border-[#96D7FE]/30">
              <TabsTrigger 
                value="overview" 
                className="data-[state=active]:bg-[#96D7FE] data-[state=active]:text-black text-gray-300"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="progress" 
                className="data-[state=active]:bg-[#96D7FE] data-[state=active]:text-black text-gray-300"
              >
                Progress
              </TabsTrigger>
              <TabsTrigger 
                value="photos" 
                className="data-[state=active]:bg-[#96D7FE] data-[state=active]:text-black text-gray-300"
              >
                Photos ({project.photos.length})
              </TabsTrigger>
              <TabsTrigger 
                value="updates" 
                className="data-[state=active]:bg-[#96D7FE] data-[state=active]:text-black text-gray-300"
              >
                Updates ({project.updates.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-8 mt-6">
              <Card className="bg-gray-900 border-[#96D7FE]/30">
                <CardHeader>
                  <CardTitle className="text-white">What We're Doing</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {project.scope.map((item, index) => (
                      <li key={index} className="flex items-start gap-3 text-gray-300">
                        <span className="text-[#96D7FE] mt-1">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <PhotoGallery photoGalleryUrl={project.photoGalleryUrl} />
            </TabsContent>

            <TabsContent value="progress" className="space-y-8 mt-6">
              <ProjectStages project={project} isManager={false} />
            </TabsContent>

            <TabsContent value="photos" className="space-y-8 mt-6">
              <PhotoLightbox 
                project={project} 
                isManager={false} 
              />
            </TabsContent>

            <TabsContent value="updates" className="space-y-8 mt-6">
              {project.updates.length > 0 ? (
                <Card className="bg-gray-900 border-[#96D7FE]/30">
                  <CardHeader>
                    <CardTitle className="text-white">Recent Updates</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {project.updates.map((update) => (
                        <div key={update.id} className="border-l-2 border-[#96D7FE] pl-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm text-gray-400">
                              {new Date(update.date).toLocaleDateString()}
                            </span>
                            <span className="text-sm text-gray-500">•</span>
                            <span className="text-sm text-gray-400">{update.author}</span>
                          </div>
                          <h4 className="text-lg font-semibold text-white mb-2">
                            {update.title}
                          </h4>
                          <p className="text-gray-300 mb-3">{update.description}</p>
                          {update.photos && update.photos.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {update.photos.map((photo, index) => (
                                <img
                                  key={index}
                                  src={photo}
                                  alt={`Update ${index + 1}`}
                                  className="w-full h-48 object-cover rounded-lg border border-[#96D7FE]/20"
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
                  <CardContent className="py-12 text-center">
                    <p className="text-gray-400">No updates yet</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          <div className="flex justify-center">
            <Button
              onClick={() => navigate(`/project/${project.id}`)}
              className="bg-[#96D7FE] hover:bg-[#7bc5ec] text-black font-semibold px-8 py-6 text-lg"
            >
              <Eye className="mr-2" size={20} />
              View Full Project Details
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomeownerDashboard;