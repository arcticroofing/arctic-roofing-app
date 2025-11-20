import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Calendar, DollarSign, User, MapPin, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Get Supabase client
const getSupabaseClient = () => {
  try {
    return require('../services/supabase').supabase;
  } catch {
    const { createClient } = require('@supabase/supabase-js');
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
    return createClient(supabaseUrl, supabaseAnonKey);
  }
};

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { data: project, isLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      // Parse JSON fields if they're strings
      if (data) {
        if (typeof data.stages === 'string') data.stages = JSON.parse(data.stages);
        if (typeof data.photos === 'string') data.photos = JSON.parse(data.photos);
        if (typeof data.scope === 'string') data.scope = JSON.parse(data.scope);
      }
      
      return data;
    },
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
          <div className="text-center">
            <p className="text-gray-400 mb-4">Project not found.</p>
            <Button onClick={() => navigate('/manager')} className="bg-[#96D7FE] text-black hover:bg-[#7bc5ec]">
              Back to Dashboard
            </Button>
          </div>
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
          onClick={() => navigate('/manager')}
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
                <h2 className="text-3xl font-bold text-white mb-2">{project.project_type}</h2>
                <div className="flex items-center gap-2 text-gray-300 mb-1">
                  <User size={18} className="text-[#96D7FE]" />
                  <span className="font-semibold">{project.homeowner_name}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <MapPin size={18} className="text-[#96D7FE]" />
                  <span>{project.address}</span>
                </div>
              </div>
              <span className={`${statusColors[project.status as keyof typeof statusColors]} text-black px-6 py-3 rounded-full text-sm font-semibold`}>
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
                  <p className="text-gray-400 text-sm">Start Date</p>
                  <p className="text-white font-semibold text-lg">
                    {new Date(project.start_date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="text-[#96D7FE] mt-1" size={24} />
                <div>
                  <p className="text-gray-400 text-sm">Est. Completion</p>
                  <p className="text-white font-semibold text-lg">
                    {new Date(project.estimated_completion).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <DollarSign className="text-[#96D7FE] mt-1" size={24} />
                <div>
                  <p className="text-gray-400 text-sm">Budget</p>
                  <p className="text-white font-semibold text-lg">
                    ${project.budget?.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Project Scope */}
          {project.scope && project.scope.length > 0 && (
            <div className="bg-gray-900 rounded-lg shadow-md p-6 border border-[#96D7FE]/20">
              <h3 className="text-xl font-bold text-white mb-4">Project Scope</h3>
              <ul className="space-y-2">
                {project.scope.map((item: string, index: number) => (
                  <li key={index} className="flex items-start gap-3 text-gray-300">
                    <CheckCircle2 size={20} className="text-[#96D7FE] mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Project Stages */}
          {project.stages && project.stages.length > 0 && (
            <div className="bg-gray-900 rounded-lg shadow-md p-6 border border-[#96D7FE]/20">
              <h3 className="text-xl font-bold text-white mb-4">Project Stages</h3>
              <div className="space-y-3">
                {project.stages.map((stage: any, index: number) => (
                  <div
                    key={index}
                    className={`flex items-center gap-4 p-4 rounded-lg ${
                      stage.completed ? 'bg-green-900/20 border border-green-500/30' : 'bg-gray-800 border border-gray-700'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      stage.completed ? 'bg-green-500' : 'bg-gray-700'
                    }`}>
                      {stage.completed ? (
                        <CheckCircle2 size={20} className="text-white" />
                      ) : (
                        <span className="text-white font-semibold">{index + 1}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`font-semibold ${stage.completed ? 'text-green-400' : 'text-white'}`}>
                        {stage.name}
                      </p>
                      {stage.completed && stage.completedDate && (
                        <p className="text-sm text-gray-400">
                          Completed: {new Date(stage.completedDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Project Photos */}
          {project.photos && project.photos.length > 0 && (
            <div className="bg-gray-900 rounded-lg shadow-md p-6 border border-[#96D7FE]/20">
              <h3 className="text-xl font-bold text-white mb-4">Project Photos ({project.photos.length})</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {project.photos.map((photo: string, index: number) => (
                  <img
                    key={index}
                    src={photo}
                    alt={`Project photo ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg border border-gray-700 hover:border-[#96D7FE] transition-colors cursor-pointer"
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
