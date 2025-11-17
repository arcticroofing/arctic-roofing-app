import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getProjectById, updateProjectStages, deleteProject } from '../services/projectService';
import { ProjectStages } from '../components/ProjectStages';
import { PhotoLightbox } from '../components/PhotoLightbox';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Trash2, Calendar, DollarSign, User, MapPin, TrendingUp, FileText, Image as ImageIcon, Bell } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const ProjectDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  console.log('🔍 ProjectDetails - Route ID:', id);
  console.log('🔍 ProjectDetails - ID type:', typeof id);

  const { data: project, isLoading, error } = useQuery({
    queryKey: ['project', id],
    queryFn: () => {
      if (!id) {
        throw new Error('No project ID provided');
      }
      console.log('📥 Fetching project with ID:', id);
      return getProjectById(id);
    },
    enabled: !!id,
  });

  const updateStagesMutation = useMutation({
    mutationFn: ({ projectId, stages }: any) => updateProjectStages(projectId, stages),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({
        title: 'Progress Updated',
        description: 'Project stages have been updated successfully.',
      });
    },
    onError: (error) => {
      console.error('Error updating stages:', error);
      toast({
        title: 'Update Failed',
        description: 'Failed to update project stages. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({
        title: 'Project Deleted',
        description: 'Project has been deleted successfully.',
      });
      navigate('/manager');
    },
    onError: (error) => {
      console.error('Error deleting project:', error);
      toast({
        title: 'Delete Failed',
        description: 'Failed to delete project. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleStagesUpdate = (stages: any) => {
    if (!id) return;
    console.log('📝 Updating stages for project:', id);
    updateStagesMutation.mutate({ projectId: id, stages });
  };

  const handleDeleteProject = () => {
    if (!id) return;
    console.log('🗑️ Deleting project:', id);
    deleteProjectMutation.mutate(id);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full w-full bg-black">
        <header className="flex items-center sticky top-0 z-10 gap-4 border-b border-[#96D7FE]/20 bg-black px-6 py-4">
          <h1 className="text-2xl font-semibold text-white">Project Details</h1>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#96D7FE] mx-auto mb-4"></div>
            <p className="text-gray-400">Loading project...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    console.error('❌ Error loading project:', error);
    return (
      <div className="flex flex-col h-full w-full bg-black">
        <header className="flex items-center sticky top-0 z-10 gap-4 border-b border-[#96D7FE]/20 bg-black px-6 py-4">
          <h1 className="text-2xl font-semibold text-white">Project Details</h1>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-400 mb-4">Error loading project</p>
            <p className="text-gray-500 text-sm mb-4">{error instanceof Error ? error.message : 'Unknown error'}</p>
            <Button onClick={() => navigate('/manager')} className="bg-[#96D7FE] hover:bg-[#7bc5ec] text-black">
              Back to Dashboard
            </Button>
          </div>
        </main>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col h-full w-full bg-black">
        <header className="flex items-center sticky top-0 z-10 gap-4 border-b border-[#96D7FE]/20 bg-black px-6 py-4">
          <h1 className="text-2xl font-semibold text-white">Project Details</h1>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-400 mb-4">Project not found</p>
            <Button onClick={() => navigate('/manager')} className="bg-[#96D7FE] hover:bg-[#7bc5ec] text-black">
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
    'On Hold': 'bg-yellow-500',
  };

  return (
    <div className="flex flex-col h-full w-full bg-black">
      <header className="flex items-center justify-between sticky top-0 z-10 gap-4 border-b border-[#96D7FE]/20 bg-black px-6 py-4 shadow-lg shadow-[#96D7FE]/5">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/manager')}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-semibold text-white">Project Details</h1>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Project
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-gray-900 border-[#96D7FE]/30">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">Are you sure?</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-400">
                This will permanently delete this project and all associated data. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-gray-800 text-white hover:bg-gray-700">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteProject}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </header>

      <main className="flex-1 overflow-auto bg-black p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Project Header */}
          <Card className="bg-gray-900 border-[#96D7FE]/30">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">{project.projectType}</h2>
                  <div className="flex items-center gap-2 text-gray-400">
                    <MapPin size={18} />
                    <span>{project.address}</span>
                  </div>
                </div>
                <span className={`${statusColors[project.status]} text-black px-4 py-2 rounded-full text-sm font-semibold`}>
                  {project.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                <div className="flex items-center gap-3">
                  <User className="text-[#96D7FE]" size={20} />
                  <div>
                    <p className="text-sm text-gray-400">Homeowner</p>
                    <p className="font-semibold text-white">{project.homeownerName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="text-[#96D7FE]" size={20} />
                  <div>
                    <p className="text-sm text-gray-400">Start Date</p>
                    <p className="font-semibold text-white">
                      {new Date(project.startDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="text-[#96D7FE]" size={20} />
                  <div>
                    <p className="text-sm text-gray-400">Est. Completion</p>
                    <p className="font-semibold text-white">
                      {new Date(project.estimatedCompletion).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <DollarSign className="text-[#96D7FE]" size={20} />
                  <div>
                    <p className="text-sm text-gray-400">Budget</p>
                    <p className="font-semibold text-white">${project.budget.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400">Overall Progress</span>
                  <span className="text-2xl font-bold text-[#96D7FE]">{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-3">
                  <div
                    className="bg-[#96D7FE] h-3 rounded-full transition-all duration-500"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs - 4 Tabs: Details, Progress, Photos, Updates */}
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-gray-900 border-2 border-[#96D7FE]/40">
              <TabsTrigger value="details" className="data-[state=active]:bg-[#96D7FE] data-[state=active]:text-black">
                <FileText className="mr-2 h-4 w-4" />
                Details
              </TabsTrigger>
              <TabsTrigger value="progress" className="data-[state=active]:bg-[#96D7FE] data-[state=active]:text-black">
                <TrendingUp className="mr-2 h-4 w-4" />
                Progress
              </TabsTrigger>
              <TabsTrigger value="photos" className="data-[state=active]:bg-[#96D7FE] data-[state=active]:text-black">
                <ImageIcon className="mr-2 h-4 w-4" />
                Photos ({project.photos.length})
              </TabsTrigger>
              <TabsTrigger value="updates" className="data-[state=active]:bg-[#96D7FE] data-[state=active]:text-black">
                <Bell className="mr-2 h-4 w-4" />
                Updates ({project.updates.length})
              </TabsTrigger>
            </TabsList>

            {/* Details Tab */}
            <TabsContent value="details" className="mt-6">
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

              {project.shingleSelection && project.shingleSelection !== 'Not Selected' && (
                <Card className="bg-gray-900 border-[#96D7FE]/30 mt-4">
                  <CardHeader>
                    <CardTitle className="text-white">Materials</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-gray-300">
                    <p><strong className="text-[#96D7FE]">Shingles:</strong> {project.shingleSelection}</p>
                    {project.gutterColor && project.gutterColor !== 'Not Selected' && (
                      <p><strong className="text-[#96D7FE]">Gutter:</strong> {project.gutterColor} {project.gutterSize && project.gutterSize !== 'Not Selected' ? `(${project.gutterSize})` : ''}</p>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Progress Tab */}
            <TabsContent value="progress" className="mt-6">
              <ProjectStages 
                project={project} 
                isManager={true}
                onStagesUpdate={handleStagesUpdate}
              />
            </TabsContent>

            {/* Photos Tab */}
            <TabsContent value="photos" className="mt-6">
              <PhotoLightbox project={project} isManager={true} />
            </TabsContent>

            {/* Updates Tab */}
            <TabsContent value="updates" className="mt-6">
              {project.updates.length > 0 ? (
                <Card className="bg-gray-900 border-[#96D7FE]/30">
                  <CardHeader>
                    <CardTitle className="text-white">Project Updates</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {project.updates.map((update) => (
                        <div key={update.id} className="border-l-2 border-[#96D7FE] pl-4">
                          <div className="flex flex-wrap items-center gap-2 mb-2 text-sm">
                            <span className="text-gray-400">
                              {new Date(update.date).toLocaleDateString()}
                            </span>
                            <span className="text-gray-500">•</span>
                            <span className="text-gray-400">{update.author}</span>
                          </div>
                          <h4 className="text-lg font-semibold text-white mb-2">
                            {update.title}
                          </h4>
                          <p className="text-gray-300 mb-3 break-words">
                            {update.description}
                          </p>
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
                    <Bell className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 mb-2">No updates yet</p>
                    <p className="text-sm text-gray-500">Use the "Post Update" button in the dashboard to add updates</p>
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

export default ProjectDetails;