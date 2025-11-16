import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { createProject } from '../services/projectService';
import { Plus } from 'lucide-react';

export function CreateProject() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  const [credentials, setCredentials] = useState({ email: '', password: '' });

  const [formData, setFormData] = useState({
    homeownerName: '',
    homeownerEmail: '',
    address: '',
    projectType: '',
    startDate: '',
    estimatedCompletion: '',
    projectManager: '',
    budget: '',
    scope: '',
    shingleSelection: '',
    gutterColor: '',
    gutterSize: '',
  });

  const createProjectMutation = useMutation({
    mutationFn: createProject,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setCredentials({
        email: data.homeowner.email,
        password: data.temporaryPassword,
      });
      setShowCredentials(true);
      setFormData({
        homeownerName: '',
        homeownerEmail: '',
        address: '',
        projectType: '',
        startDate: '',
        estimatedCompletion: '',
        projectManager: '',
        budget: '',
        scope: '',
        shingleSelection: '',
        gutterColor: '',
        gutterSize: '',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create project. Please try again.',
        variant: 'destructive',
      });
      console.error('Error creating project:', error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createProjectMutation.mutate({
      homeownerName: formData.homeownerName,
      homeownerEmail: formData.homeownerEmail,
      address: formData.address,
      projectType: formData.projectType,
      startDate: formData.startDate,
      estimatedCompletion: formData.estimatedCompletion,
      projectManager: formData.projectManager,
      budget: parseFloat(formData.budget),
      scope: formData.scope.split('\n').filter((item) => item.trim()),
      shingleSelection: formData.shingleSelection,
      gutterColor: formData.gutterColor || 'Not Selected',
      gutterSize: formData.gutterSize || 'Not Selected',
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCloseCredentials = () => {
    setShowCredentials(false);
    setDialogOpen(false);
  };

  if (showCredentials) {
    return (
      <Dialog open={showCredentials} onOpenChange={setShowCredentials}>
        <DialogContent className="bg-gray-900 border-[#96D7FE]/30 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">
              Project Created Successfully!
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Save these credentials for the homeowner
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-black/50 p-4 rounded-lg border border-[#96D7FE]/30">
              <p className="text-sm text-gray-400 mb-2">Homeowner Login Credentials:</p>
              <div className="space-y-2">
                <div>
                  <span className="text-xs text-gray-500">Email:</span>
                  <p className="text-[#96D7FE] font-mono break-all">{credentials.email}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Temporary Password:</span>
                  <p className="text-[#96D7FE] font-mono text-lg font-bold">
                    {credentials.password}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/30 p-3 rounded-lg">
              <p className="text-yellow-500 text-sm">
                ⚠️ Make sure to save this password! It won't be shown again.
              </p>
            </div>
            <Button
              onClick={handleCloseCredentials}
              className="w-full bg-[#96D7FE] hover:bg-[#7bc5ec] text-black font-semibold"
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#96D7FE] hover:bg-[#7bc5ec] text-black font-semibold">
          <Plus className="mr-2" size={18} />
          Create New Project
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-[#96D7FE]/30 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">Create New Project</DialogTitle>
          <DialogDescription className="text-gray-400">
            Add a new roofing project and create homeowner access
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="homeownerName" className="text-gray-300">
                Homeowner Name
              </Label>
              <Input
                id="homeownerName"
                name="homeownerName"
                value={formData.homeownerName}
                onChange={handleChange}
                className="bg-black border-[#96D7FE]/30 text-white"
                required
              />
            </div>

            <div>
              <Label htmlFor="homeownerEmail" className="text-gray-300">
                Homeowner Email
              </Label>
              <Input
                id="homeownerEmail"
                name="homeownerEmail"
                type="email"
                value={formData.homeownerEmail}
                onChange={handleChange}
                className="bg-black border-[#96D7FE]/30 text-white"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address" className="text-gray-300">
              Project Address
            </Label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="bg-black border-[#96D7FE]/30 text-white"
              required
            />
          </div>

          <div>
            <Label htmlFor="projectType" className="text-gray-300">
              Project Type
            </Label>
            <Input
              id="projectType"
              name="projectType"
              value={formData.projectType}
              onChange={handleChange}
              className="bg-black border-[#96D7FE]/30 text-white"
              placeholder="e.g., Complete Roof Replacement"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate" className="text-gray-300">
                Start Date
              </Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
                className="bg-black border-[#96D7FE]/30 text-white"
                required
              />
            </div>

            <div>
              <Label htmlFor="estimatedCompletion" className="text-gray-300">
                Estimated Completion
              </Label>
              <Input
                id="estimatedCompletion"
                name="estimatedCompletion"
                type="date"
                value={formData.estimatedCompletion}
                onChange={handleChange}
                className="bg-black border-[#96D7FE]/30 text-white"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="projectManager" className="text-gray-300">
                Project Manager
              </Label>
              <Input
                id="projectManager"
                name="projectManager"
                value={formData.projectManager}
                onChange={handleChange}
                className="bg-black border-[#96D7FE]/30 text-white"
                required
              />
            </div>

            <div>
              <Label htmlFor="budget" className="text-gray-300">
                Budget ($)
              </Label>
              <Input
                id="budget"
                name="budget"
                type="number"
                value={formData.budget}
                onChange={handleChange}
                className="bg-black border-[#96D7FE]/30 text-white"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="shingleSelection" className="text-gray-300">
              Shingle Selection <span className="text-red-400">*</span>
            </Label>
            <Input
              id="shingleSelection"
              name="shingleSelection"
              value={formData.shingleSelection}
              onChange={handleChange}
              className="bg-black border-[#96D7FE]/30 text-white"
              placeholder="e.g., Owens Corning Duration - Estate Gray"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="gutterColor" className="text-gray-300">
                Gutter Color <span className="text-gray-500 text-xs">(Optional)</span>
              </Label>
              <Input
                id="gutterColor"
                name="gutterColor"
                value={formData.gutterColor}
                onChange={handleChange}
                className="bg-black border-[#96D7FE]/30 text-white"
                placeholder="e.g., White, Brown, Black"
              />
            </div>

            <div>
              <Label htmlFor="gutterSize" className="text-gray-300">
                Gutter Size <span className="text-gray-500 text-xs">(Optional)</span>
              </Label>
              <Input
                id="gutterSize"
                name="gutterSize"
                value={formData.gutterSize}
                onChange={handleChange}
                className="bg-black border-[#96D7FE]/30 text-white"
                placeholder="e.g., 5 inch, 6 inch"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="scope" className="text-gray-300">
              Project Scope (one item per line)
            </Label>
            <Textarea
              id="scope"
              name="scope"
              value={formData.scope}
              onChange={handleChange}
              className="bg-black border-[#96D7FE]/30 text-white min-h-[100px]"
              placeholder="Remove old shingles&#10;Install new underlayment&#10;Install new shingles"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={createProjectMutation.isPending}
            className="w-full bg-[#96D7FE] hover:bg-[#7bc5ec] text-black font-semibold"
          >
            {createProjectMutation.isPending ? 'Creating...' : 'Create Project'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}