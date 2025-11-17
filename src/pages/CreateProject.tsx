import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createProject } from '../services/projectService';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const CreateProject = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  const [showCredentials, setShowCredentials] = useState(false);
  const [credentials, setCredentials] = useState({ email: '', password: '' });

  const createProjectMutation = useMutation({
    mutationFn: createProject,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      
      setCredentials({
        email: data.homeowner.email,
        password: data.temporaryPassword,
      });
      setShowCredentials(true);

      toast({
        title: 'Project Created! 🎉',
        description: 'Homeowner account has been created with temporary credentials.',
      });
    },
    onError: (error) => {
      console.error('Error creating project:', error);
      toast({
        title: 'Error',
        description: 'Failed to create project. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const scopeArray = formData.scope
      .split('\n')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    createProjectMutation.mutate({
      homeownerName: formData.homeownerName,
      homeownerEmail: formData.homeownerEmail,
      address: formData.address,
      projectType: formData.projectType,
      startDate: formData.startDate,
      estimatedCompletion: formData.estimatedCompletion,
      projectManager: formData.projectManager,
      budget: parseFloat(formData.budget),
      scope: scopeArray,
      shingleSelection: formData.shingleSelection,
      gutterColor: formData.gutterColor || undefined,
      gutterSize: formData.gutterSize || undefined,
    });
  };

  const handleCloseDialog = () => {
    setShowCredentials(false);
    navigate('/manager');
  };

  return (
    <div className="flex flex-col h-full w-full bg-black">
      <header className="flex items-center sticky top-0 z-10 gap-4 border-b border-[#96D7FE]/20 bg-black px-6 py-4 shadow-lg shadow-[#96D7FE]/5">
        <SidebarTrigger className="text-[#96D7FE]" />
        <Button
          variant="ghost"
          onClick={() => navigate('/manager')}
          className="text-gray-400 hover:text-white"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-semibold text-white">Create New Project</h1>
      </header>

      <main className="flex-1 overflow-auto bg-black p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gray-900 border-[#96D7FE]/30">
            <CardHeader>
              <CardTitle className="text-white text-2xl">Project Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Homeowner Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[#96D7FE]">Homeowner Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="homeownerName" className="text-gray-300">
                        Homeowner Name *
                      </Label>
                      <Input
                        id="homeownerName"
                        name="homeownerName"
                        value={formData.homeownerName}
                        onChange={handleChange}
                        placeholder="John & Sarah Smith"
                        required
                        className="mt-1 bg-black border-[#96D7FE]/30 text-white placeholder:text-gray-500"
                      />
                    </div>

                    <div>
                      <Label htmlFor="homeownerEmail" className="text-gray-300">
                        Email Address *
                      </Label>
                      <Input
                        id="homeownerEmail"
                        name="homeownerEmail"
                        type="email"
                        value={formData.homeownerEmail}
                        onChange={handleChange}
                        placeholder="homeowner@email.com"
                        required
                        className="mt-1 bg-black border-[#96D7FE]/30 text-white placeholder:text-gray-500"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address" className="text-gray-300">
                      Property Address *
                    </Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="123 Main Street, City, State ZIP"
                      required
                      className="mt-1 bg-black border-[#96D7FE]/30 text-white placeholder:text-gray-500"
                    />
                  </div>
                </div>

                {/* Project Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[#96D7FE]">Project Details</h3>

                  <div>
                    <Label htmlFor="projectType" className="text-gray-300">
                      Project Type *
                    </Label>
                    <Input
                      id="projectType"
                      name="projectType"
                      value={formData.projectType}
                      onChange={handleChange}
                      placeholder="e.g., Complete Roof Replacement"
                      required
                      className="mt-1 bg-black border-[#96D7FE]/30 text-white placeholder:text-gray-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startDate" className="text-gray-300">
                        Start Date *
                      </Label>
                      <Input
                        id="startDate"
                        name="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={handleChange}
                        required
                        className="mt-1 bg-black border-[#96D7FE]/30 text-white"
                      />
                    </div>

                    <div>
                      <Label htmlFor="estimatedCompletion" className="text-gray-300">
                        Estimated Completion *
                      </Label>
                      <Input
                        id="estimatedCompletion"
                        name="estimatedCompletion"
                        type="date"
                        value={formData.estimatedCompletion}
                        onChange={handleChange}
                        required
                        className="mt-1 bg-black border-[#96D7FE]/30 text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="projectManager" className="text-gray-300">
                        Project Manager *
                      </Label>
                      <Input
                        id="projectManager"
                        name="projectManager"
                        value={formData.projectManager}
                        onChange={handleChange}
                        placeholder="Manager Name"
                        required
                        className="mt-1 bg-black border-[#96D7FE]/30 text-white placeholder:text-gray-500"
                      />
                    </div>

                    <div>
                      <Label htmlFor="budget" className="text-gray-300">
                        Budget ($) *
                      </Label>
                      <Input
                        id="budget"
                        name="budget"
                        type="number"
                        value={formData.budget}
                        onChange={handleChange}
                        placeholder="15000"
                        required
                        className="mt-1 bg-black border-[#96D7FE]/30 text-white placeholder:text-gray-500"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="scope" className="text-gray-300">
                      Project Scope (one item per line) *
                    </Label>
                    <Textarea
                      id="scope"
                      name="scope"
                      value={formData.scope}
                      onChange={handleChange}
                      placeholder="Remove existing shingles&#10;Install new underlayment&#10;Install new shingles&#10;Clean up and inspection"
                      rows={6}
                      required
                      className="mt-1 bg-black border-[#96D7FE]/30 text-white placeholder:text-gray-500"
                    />
                  </div>
                </div>

                {/* Materials */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[#96D7FE]">Materials</h3>

                  <div>
                    <Label htmlFor="shingleSelection" className="text-gray-300">
                      Shingle Selection *
                    </Label>
                    <Input
                      id="shingleSelection"
                      name="shingleSelection"
                      value={formData.shingleSelection}
                      onChange={handleChange}
                      placeholder="e.g., GAF Timberline HDZ - Charcoal"
                      required
                      className="mt-1 bg-black border-[#96D7FE]/30 text-white placeholder:text-gray-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="gutterColor" className="text-gray-300">
                        Gutter Color (Optional)
                      </Label>
                      <Input
                        id="gutterColor"
                        name="gutterColor"
                        value={formData.gutterColor}
                        onChange={handleChange}
                        placeholder="e.g., White"
                        className="mt-1 bg-black border-[#96D7FE]/30 text-white placeholder:text-gray-500"
                      />
                    </div>

                    <div>
                      <Label htmlFor="gutterSize" className="text-gray-300">
                        Gutter Size (Optional)
                      </Label>
                      <Input
                        id="gutterSize"
                        name="gutterSize"
                        value={formData.gutterSize}
                        onChange={handleChange}
                        placeholder="e.g., 5 inch"
                        className="mt-1 bg-black border-[#96D7FE]/30 text-white placeholder:text-gray-500"
                      />
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#96D7FE] hover:bg-[#7bc5ec] text-black font-semibold text-lg py-6"
                  disabled={createProjectMutation.isPending}
                >
                  {createProjectMutation.isPending ? (
                    'Creating Project...'
                  ) : (
                    <>
                      <Plus className="mr-2" size={20} />
                      Create Project
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Credentials Dialog */}
      <Dialog open={showCredentials} onOpenChange={setShowCredentials}>
        <DialogContent className="bg-gray-900 border-[#96D7FE]/30 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl text-[#96D7FE]">Project Created Successfully! 🎉</DialogTitle>
            <DialogDescription className="text-gray-300">
              Homeowner account has been created. Share these credentials with the homeowner:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-black p-4 rounded-lg border border-[#96D7FE]/30">
              <p className="text-sm text-gray-400 mb-1">Email:</p>
              <p className="text-lg font-semibold text-white">{credentials.email}</p>
            </div>
            <div className="bg-black p-4 rounded-lg border border-[#96D7FE]/30">
              <p className="text-sm text-gray-400 mb-1">Temporary Password:</p>
              <p className="text-lg font-semibold text-[#96D7FE]">{credentials.password}</p>
            </div>
            <p className="text-sm text-yellow-500">
              ⚠️ Make sure to save these credentials! The homeowner will need them to log in.
            </p>
          </div>
          <Button
            onClick={handleCloseDialog}
            className="w-full bg-[#96D7FE] hover:bg-[#7bc5ec] text-black font-semibold"
          >
            Done
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateProject;