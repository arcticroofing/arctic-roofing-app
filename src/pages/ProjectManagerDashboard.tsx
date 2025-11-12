import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { getProjects, addProjectUpdate } from '../services/projectService';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Plus, Eye, FolderPlus, LogOut } from 'lucide-react';

const ProjectManagerDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isManagerAuthenticated, currentManager, logoutManager } = useAuth();

  useEffect(() => {
    if (!isManagerAuthenticated) {
      navigate('/manager/login');
    }
  }, [isManagerAuthenticated, navigate]);

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
    enabled: isManagerAuthenticated,
  });

  const [selectedProject, setSelectedProject] = useState<string>('');
  const [updateTitle, setUpdateTitle] = useState('');
  const [updateDescription, setUpdateDescription] = useState('');
  const [updatePhotos, setUpdatePhotos] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const addUpdateMutation = useMutation({
    mutationFn: ({ projectId, update }: any) => addProjectUpdate(projectId, update),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({
        title: "Update Posted",
        description: "Project update has been successfully posted.",
      });
      setUpdateTitle('');
      setUpdateDescription('');
      setUpdatePhotos('');
      setDialogOpen(false);
    },
  });

  const handlePostUpdate = () => {
    if (!selectedProject || !updateTitle || !updateDescription) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const photos = updatePhotos
      .split('\n')
      .map(url => url.trim())
      .filter(url => url.length > 0);

    addUpdateMutation.mutate({
      projectId: selectedProject,
      update: {
        date: new Date().toISOString().split('T')[0],
        title: updateTitle,
        description: updateDescription,
        author: currentManager?.name || 'Project Manager',
        photos: photos.length > 0 ? photos : undefined,
      },
    });
  };

  const handleLogout = () => {
    logoutManager();
    navigate('/manager/login');
  };

  const statusColors = {
    'Not Started': 'bg-gray-500',
    'In Progress': 'bg-[#96D7FE]',
    'Completed': 'bg-green-500',
    'On Hold': 'bg-yellow-500'
  };

  if (!isManagerAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex flex-col h-full w-full bg-black">
        <header className="flex items-center sticky top-0 z-10 gap-4 border-b border-[#96D7FE]/20 bg-black px-6 py-4">
          <SidebarTrigger className="text-[#96D7FE]" />
          <h1 className="text-2xl font-semibold text-white">Project Manager</h1>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <p className="text-gray-400">Loading projects...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-black">
      <header className="flex items-center sticky top-0 z-10 gap-4 border-b border-[#96D7FE]/20 bg-black px-6 py-4 shadow-lg shadow-[#96D7FE]/5">
        <SidebarTrigger className="text-[#96D7FE]" />
        <h1 className="text-2xl font-semibold text-white">Project Manager Dashboard</h1>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-sm text-gray-400">
            Welcome, <strong className="text-[#96D7FE]">{currentManager?.name}</strong>
          </span>
          <Link to="/manager/create-project">
            <Button className="bg-green-600 hover:bg-green-700 text-white font-semibold">
              <FolderPlus className="mr-2" size={18} />
              New Project
            </Button>
          </Link>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#96D7FE] hover:bg-[#7bc5ec] text-black font-semibold">
                <Plus className="mr-2" size={18} />
                Post Update
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-gray-900 border-[#96D7FE]/30 text-white">
              <DialogHeader>
                <DialogTitle className="text-white">Post Project Update</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="project" className="text-gray-300">Select Project</Label>
                  <select
                    id="project"
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    className="w-full mt-1 px-3 py-2 bg-black border border-[#96D7FE]/30 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#96D7FE]"
                  >
                    <option value="">Choose a project...</option>
                    {projects?.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.homeownerName} - {project.address}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="title" className="text-gray-300">Update Title</Label>
                  <Input
                    id="title"
                    value={updateTitle}
                    onChange={(e) => setUpdateTitle(e.target.value)}
                    placeholder="e.g., Shingles Installation Complete"
                    className="mt-1 bg-black border-[#96D7FE]/30 text-white placeholder:text-gray-500"
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="text-gray-300">Description</Label>
                  <Textarea
                    id="description"
                    value={updateDescription}
                    onChange={(e) => setUpdateDescription(e.target.value)}
                    placeholder="Describe the work completed and any important details..."
                    rows={4}
                    className="mt-1 bg-black border-[#96D7FE]/30 text-white placeholder:text-gray-500"
                  />
                </div>

                <div>
                  <Label htmlFor="photos" className="text-gray-300">Photo URLs (one per line)</Label>
                  <Textarea
                    id="photos"
                    value={updatePhotos}
                    onChange={(e) => setUpdatePhotos(e.target.value)}
                    placeholder="https://example.com/photo1.jpg&#10;https://example.com/photo2.jpg"
                    rows={3}
                    className="mt-1 bg-black border-[#96D7FE]/30 text-white placeholder:text-gray-500"
                  />
                </div>

                <Button
                  onClick={handlePostUpdate}
                  className="w-full bg-[#96D7FE] hover:bg-[#7bc5ec] text-black font-semibold"
                  disabled={addUpdateMutation.isPending}
                >
                  {addUpdateMutation.isPending ? 'Posting...' : 'Post Update'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="gap-2 border-[#96D7FE]/30 text-[#96D7FE] hover:bg-[#96D7FE]/10"
          >
            <LogOut size={16} />
            Logout
          </Button>
        </div>
      </header>
      
      <main className="flex-1 overflow-auto bg-black p-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-6">Active Projects</h2>
          
          <div className="space-y-4">
            {projects?.map((project) => (
              <div key={project.id} className="bg-gray-900 rounded-lg shadow-md p-6 hover:shadow-[#96D7FE]/20 transition-shadow border border-[#96D7FE]/20">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-1">
                      {project.homeownerName}
                    </h3>
                    <p className="text-gray-300 mb-1">{project.projectType}</p>
                    <p className="text-sm text-gray-400">{project.address}</p>
                  </div>
                  <span className={`${statusColors[project.status]} text-black px-4 py-2 rounded-full text-sm font-semibold`}>
                    {project.status}
                  </span>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-400">Progress</span>
                    <span className="text-lg font-bold text-[#96D7FE]">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                  <div>
                    <span className="text-gray-400">Start Date</span>
                    <p className="font-semibold text-white">
                      {new Date(project.startDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-400">Est. Completion</span>
                    <p className="font-semibold text-white">
                      {new Date(project.estimatedCompletion).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-400">Job Value</span>
                    <p className="font-semibold text-white">
                      ${project.budget.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-400">Updates</span>
                    <p className="font-semibold text-white">{project.updates.length}</p>
                  </div>
                </div>

                <Link
                  to={`/project/${project.id}`}
                  className="inline-flex items-center gap-2 text-[#96D7FE] hover:text-[#7bc5ec] font-semibold"
                >
                  <Eye size={18} />
                  View Details
                </Link>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProjectManagerDashboard;