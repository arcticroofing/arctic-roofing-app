import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getProjectById } from '../services/projectService';
import { useAuth } from '../contexts/AuthContext';
import { ProjectStages } from '../components/ProjectStages';
import { ProjectActions } from '../components/ProjectActions';
import { PhotoGallery } from '../components/PhotoGallery';
import { EditPhotoGallery } from '../components/EditPhotoGallery';
import { ArrowLeft, Calendar, DollarSign, User, MapPin, Briefcase } from 'lucide-react';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isManagerAuthenticated } = useAuth();

  const { data: project, isLoading, error } = useQuery({
    queryKey: ['project', id],
    queryFn: () => getProjectById(id!),
    enabled: !!id,
  });

  const statusColors = {
    'Not Started': 'bg-gray-500',
    'In Progress': 'bg-[#96D7FE]',
    'Completed': 'bg-green-500',
    'On Hold': 'bg-yellow-500'
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full w-full bg-black">
        <header className="flex items-center sticky top-0 z-10 gap-4 border-b border-[#96D7FE]/20 bg-black px-6 py-4">
          <SidebarTrigger className="text-[#96D7FE]" />
          <h1 className="text-2xl font-semibold text-white">Loading...</h1>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <p className="text-gray-400">Loading project details...</p>
        </main>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex flex-col h-full w-full bg-black">
        <header className="flex items-center sticky top-0 z-10 gap-4 border-b border-[#96D7FE]/20 bg-black px-6 py-4">
          <SidebarTrigger className="text-[#96D7FE]" />
          <h1 className="text-2xl font-semibold text-white">Project Not Found</h1>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-400 mb-4">Project not found</p>
            <Button
              onClick={() => navigate(isManagerAuthenticated ? '/manager' : '/homeowner')}
              className="bg-[#96D7FE] hover:bg-[#7bc5ec] text-black"
            >
              Go Back
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-black">
      <header className="flex items-center sticky top-0 z-10 gap-4 border-b border-[#96D7FE]/20 bg-black px-6 py-4 shadow-lg shadow-[#96D7FE]/5">
        <SidebarTrigger className="text-[#96D7FE]" />
        <Button
          variant="ghost"
          onClick={() => navigate(isManagerAuthenticated ? '/manager' : '/homeowner')}
          className="gap-2 text-[#96D7FE] hover:text-[#7bc5ec] hover:bg-[#96D7FE]/10"
        >
          <ArrowLeft size={18} />
          Back
        </Button>
        <h1 className="text-2xl font-semibold text-white">Project Details</h1>
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
                  <span>{project.homeownerName}</span>
                </div>
              </div>
              <div className="flex flex-col gap-2 items-end">
                <span className={`${statusColors[project.status]} text-black px-6 py-3 rounded-full text-sm font-semibold`}>
                  {project.status}
                </span>
                {isManagerAuthenticated && (
                  <div className="flex gap-2 flex-wrap justify-end">
                    <ProjectActions project={project} />
                    <EditPhotoGallery 
                      projectId={project.id} 
                      currentUrl={project.photoGalleryUrl} 
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                    Budget
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xl font-bold text-white">
                    ${project.budget.toLocaleString()}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-[#96D7FE]/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                    <Briefcase size={16} />
                    Project Manager
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xl font-bold text-white">
                    {project.projectManager}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          <ProjectStages 
            project={project} 
            isManager={isManagerAuthenticated} 
          />

          <PhotoGallery photoGalleryUrl={project.photoGalleryUrl} />

          <Card className="bg-gray-900 border-[#96D7FE]/30">
            <CardHeader>
              <CardTitle className="text-white">Project Scope</CardTitle>
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

          {project.updates.length > 0 && (
            <Card className="bg-gray-900 border-[#96D7FE]/30">
              <CardHeader>
                <CardTitle className="text-white">Project Updates</CardTitle>
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
          )}

          {project.photos.length > 0 && (
            <Card className="bg-gray-900 border-[#96D7FE]/30">
              <CardHeader>
                <CardTitle className="text-white">Project Photos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {project.photos.map((photo, index) => (
                    <img
                      key={index}
                      src={photo}
                      alt={`Project photo ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg border border-[#96D7FE]/20 hover:border-[#96D7FE] transition-colors cursor-pointer"
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProjectDetails;