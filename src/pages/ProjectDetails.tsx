import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { getProjectById } from '../services/projectService';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Calendar, DollarSign, User, MapPin, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { data: project, isLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: () => getProjectById(id!),
  });

  if (isLoading) {
    return (
      <div className="flex flex-col h-full w-full bg-black">
        <header className="flex items-center sticky top-0 z-10 gap-4 border-b border-[#96D7FE]/20 bg-black px-6 py-4">
          <SidebarTrigger className="text-[#96D7FE]" />
          <h1 className="text-2xl font-semibold text-white">Project Details</h1>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <p className="text-gray-400">Loading project details...</p>
        </main>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col h-full w-full bg-black">
        <header className="flex items-center sticky top-0 z-10 gap-4 border-b border-[#96D7FE]/20 bg-black px-6 py-4">
          <SidebarTrigger className="text-[#96D7FE]" />
          <h1 className="text-2xl font-semibold text-white">Project Not Found</h1>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <p className="text-gray-400">Project not found.</p>
        </main>
      </div>
    );
  }

  const statusColors = {
    'Not Started': 'bg-gray-500',
    'In Progress': 'bg-[#96D7FE]',
    'Completed': 'bg-green-500',
    'On Hold': 'bg-yellow-500'
  };

  return (
    <div className="flex flex-col h-full w-full bg-black">
      <header className="flex items-center sticky top-0 z-10 gap-4 border-b border-[#96D7FE]/20 bg-black px-6 py-4 shadow-lg shadow-[#96D7FE]/5">
        <SidebarTrigger className="text-[#96D7FE]" />
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="gap-2 text-[#96D7FE] hover:text-[#7bc5ec] hover:bg-[#96D7FE]/10"
        >
          <ArrowLeft size={18} />
          Back
        </Button>
        <h1 className="text-2xl font-semibold text-white">Project Details</h1>
      </header>
      
      <main className="flex-1 overflow-auto bg-black p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Project Header */}
          <div className="bg-gray-900 rounded-lg shadow-md p-8 border border-[#96D7FE]/20">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">{project.projectType}</h2>
                <div className="flex items-center gap-2 text-gray-300 mb-1">
                  <User size={18} className="text-[#96D7FE]" />
                  <span className="font-semibold">{project.homeownerName}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <MapPin size={18} className="text-[#96D7FE]" />
                  <span>{project.address}</span>
                </div>
              </div>
              <span className={`${statusColors[project.status]} text-black px-6 py-3 rounded-full text-sm font-semibold`}>
                {project.status}
              </span>
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-300 font-semibold">Overall Progress</span>
                <span className="text-3xl font-bold text-[#96D7FE]">{project.progress}%</span>
              </div>
              <Progress value={project.progress} className="h-4" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <Calendar className="text-[#96D7FE] mt-1" size={24} />
                <div>
                  <p className="text-sm text-gray-400">Start Date</p>
                  <p className="text-lg font-semibold text-white">
                    {new Date(project.startDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="text-[#96D7FE] mt-1" size={24} />
                <div>
                  <p className="text-sm text-gray-400">Est. Completion</p>
                  <p className="text-lg font-semibold text-white">
                    {new Date(project.estimatedCompletion).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <DollarSign className="text-[#96D7FE] mt-1" size={24} />
                <div>
                  <p className="text-sm text-gray-400">Project Budget</p>
                  <p className="text-lg font-semibold text-white">
                    ${project.budget.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Project Scope */}
          <div className="bg-gray-900 rounded-lg shadow-md p-6 border border-[#96D7FE]/20">
            <h3 className="text-xl font-bold text-white mb-4">Project Scope</h3>
            <ul className="space-y-2">
              {project.scope.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="text-[#96D7FE] mt-0.5 flex-shrink-0" size={20} />
                  <span className="text-gray-300">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Project Updates Timeline */}
          <div className="bg-gray-900 rounded-lg shadow-md p-6 border border-[#96D7FE]/20">
            <h3 className="text-xl font-bold text-white mb-6">Project Timeline</h3>
            {project.updates.length > 0 ? (
              <div className="space-y-6">
                {project.updates.map((update, index) => (
                  <div key={update.id} className="relative pl-8 pb-6 border-l-2 border-[#96D7FE]/30 last:border-l-0 last:pb-0">
                    <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-[#96D7FE] border-4 border-black"></div>
                    <div className="bg-black/50 rounded-lg p-4 border border-[#96D7FE]/20">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-lg font-semibold text-white">{update.title}</h4>
                        <span className="text-sm text-gray-400 whitespace-nowrap ml-4">
                          {new Date(update.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-300 mb-2">{update.description}</p>
                      <p className="text-sm text-[#96D7FE]">Posted by {update.author}</p>
                      
                      {update.photos && update.photos.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
                          {update.photos.map((photo, photoIndex) => (
                            <img
                              key={photoIndex}
                              src={photo}
                              alt={`Update photo ${photoIndex + 1}`}
                              className="w-full h-32 object-cover rounded-lg shadow-sm hover:shadow-[#96D7FE]/30 transition-shadow border border-[#96D7FE]/10"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">No updates posted yet.</p>
            )}
          </div>

          {/* Photo Gallery */}
          {project.photos.length > 0 && (
            <div className="bg-gray-900 rounded-lg shadow-md p-6 border border-[#96D7FE]/20">
              <h3 className="text-xl font-bold text-white mb-4">Photo Gallery</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {project.photos.map((photo, index) => (
                  <img
                    key={index}
                    src={photo}
                    alt={`Project photo ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg shadow-sm hover:shadow-[#96D7FE]/30 transition-shadow cursor-pointer border border-[#96D7FE]/10"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProjectDetails;