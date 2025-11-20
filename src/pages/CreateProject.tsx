import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '../contexts/AuthContext';
import { createProject } from '../services/projectService';
import { createHomeownerAccount } from '../services/authService';
import { ArrowLeft, Plus, Copy, CheckCircle } from 'lucide-react';

// Create a simple supabase client inline if the service doesn't exist
const getSupabaseClient = () => {
  try {
    // Try to import from service
    return require('../services/supabase').supabase;
  } catch {
    // Fallback: create inline
    const { createClient } = require('@supabase/supabase-js');
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
    return createClient(supabaseUrl, supabaseAnonKey);
  }
};

const CreateProject = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isManagerAuthenticated, currentManager } = useAuth();

  useEffect(() => {
    if (!isManagerAuthenticated) {
      navigate('/manager/login');
    }
  }, [isManagerAuthenticated, navigate]);

  // Fetch managers from Supabase
  const { data: managers = [] } = useQuery({
    queryKey: ['managers'],
    queryFn: async () => {
      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
          .from('managers')
          .select('*')
          .order('name');
        
        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('Error fetching managers:', error);
        return [];
      }
    },
  });

  const [formData, setFormData] = useState({
    homeownerName: '',
    homeownerEmail: '',
    address: '',
    projectType: '',
    startDate: '',
    estimatedCompletion: '',
    projectManager: currentManager?.name || '',
    managerId: currentManager?.id || '',
    budget: '',
    scope: ''
  });

  const [invitationSent, setInvitationSent] = useState(false);
  const [credentials, setCredentials] = useState<{ email: string; password: string } | null>(null);

  const createProjectMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      // Create the project
      const scopeArray = data.scope
        .split('\n')
        .map(item => item.trim())
        .filter(item => item.length > 0);

      const projectData = {
        homeownerName: data.homeownerName,
        homeownerEmail: data.homeownerEmail,
        address: data.address,
        projectType: data.projectType,
        status: 'Not Started' as const,
        startDate: data.startDate,
        estimatedCompletion: data.estimatedCompletion,
        projectManager: data.projectManager,
        budget: parseFloat(data.budget),
        scope: scopeArray
      };

      const project = await createProject(projectData);

      // Create homeowner account and get credentials
      const accountResult = await createHomeownerAccount(
        data.homeownerName,
        data.homeownerEmail,
        project.id
      );

      // Update project with manager_id if available
      if (data.managerId) {
        try {
          const supabase = getSupabaseClient();
          await supabase
            .from('projects')
            .update({ manager_id: data.managerId })
            .eq('id', project.id);
        } catch (error) {
          console.error('Error updating manager_id:', error);
        }
      }

      return { 
        project, 
        email: accountResult.homeowner?.email || data.homeownerEmail, 
        password: accountResult.temporaryPassword 
      };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setCredentials({ email: data.email, password: data.password });
      setInvitationSent(true);
      
      toast({
        title: "Project Created!",
        description: "Homeowner invitation has been generated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create project",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createProjectMutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Copied to clipboard",
    });
  };

  const handleCreateAnother = () => {
    setFormData({
      homeownerName: '',
      homeownerEmail: '',
      address: '',
      projectType: '',
      startDate: '',
      estimatedCompletion: '',
      projectManager: currentManager?.name || '',
      managerId: currentManager?.id || '',
      budget: '',
      scope: ''
    });
    setInvitationSent(false);
    setCredentials(null);
  };

  if (!isManagerAuthenticated) {
    return null;
  }

  return (
    <div className="flex flex-col h-full w-full bg-black">
      <header className="flex items-center sticky top-0 z-10 gap-4 border-b border-[#96D7FE]/20 bg-black px-6 py-4">
        <SidebarTrigger className="text-[#96D7FE]" />
        <div className="flex items-center gap-4 flex-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/manager')}
            className="gap-2 text-[#96D7FE] hover:text-[#96D7FE] hover:bg-[#96D7FE]/10"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-semibold text-white">Create New Project</h1>
        </div>
      </header>

      <main className="flex-1 overflow-auto bg-black p-6">
        <div className="max-w-4xl mx-auto">
          {!invitationSent ? (
            <Card className="bg-gray-900 border-[#96D7FE]/20">
              <CardHeader>
                <CardTitle className="text-white">Project Details</CardTitle>
                <CardDescription className="text-gray-400">
                  Fill in the project information and homeowner details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Homeowner Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-[#96D7FE]">Homeowner Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="homeownerName" className="text-gray-300">Homeowner Name *</Label>
                        <Input
                          id="homeownerName"
                          name="homeownerName"
                          value={formData.homeownerName}
                          onChange={handleChange}
                          required
                          className="bg-black border-gray-700 text-white"
                          placeholder="John Smith"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="homeownerEmail" className="text-gray-300">Homeowner Email *</Label>
                        <Input
                          id="homeownerEmail"
                          name="homeownerEmail"
                          type="email"
                          value={formData.homeownerEmail}
                          onChange={handleChange}
                          required
                          className="bg-black border-gray-700 text-white"
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address" className="text-gray-300">Property Address *</Label>
                      <Input
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        required
                        className="bg-black border-gray-700 text-white"
                        placeholder="123 Main St, City, State 12345"
                      />
                    </div>
                  </div>

                  {/* Project Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-[#96D7FE]">Project Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="projectType" className="text-gray-300">Project Type *</Label>
                        <Input
                          id="projectType"
                          name="projectType"
                          value={formData.projectType}
                          onChange={handleChange}
                          required
                          className="bg-black border-gray-700 text-white"
                          placeholder="Roof Replacement"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="budget" className="text-gray-300">Budget *</Label>
                        <Input
                          id="budget"
                          name="budget"
                          type="number"
                          value={formData.budget}
                          onChange={handleChange}
                          required
                          className="bg-black border-gray-700 text-white"
                          placeholder="15000"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="startDate" className="text-gray-300">Start Date *</Label>
                        <Input
                          id="startDate"
                          name="startDate"
                          type="date"
                          value={formData.startDate}
                          onChange={handleChange}
                          required
                          className="bg-black border-gray-700 text-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="estimatedCompletion" className="text-gray-300">Estimated Completion *</Label>
                        <Input
                          id="estimatedCompletion"
                          name="estimatedCompletion"
                          type="date"
                          value={formData.estimatedCompletion}
                          onChange={handleChange}
                          required
                          className="bg-black border-gray-700 text-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="projectManager" className="text-gray-300">Project Manager *</Label>
                      <Select
                        value={formData.managerId}
                        onValueChange={(value) => {
                          const selectedManager = managers.find((m: any) => m.id === value);
                          setFormData({
                            ...formData,
                            managerId: value,
                            projectManager: selectedManager?.name || ''
                          });
                        }}
                      >
                        <SelectTrigger className="bg-black border-gray-700 text-white">
                          <SelectValue placeholder="Select a project manager" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900 border-gray-700">
                          {managers.map((manager: any) => (
                            <SelectItem 
                              key={manager.id} 
                              value={manager.id}
                              className="text-white hover:bg-gray-800"
                            >
                              {manager.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="scope" className="text-gray-300">Project Scope</Label>
                      <Textarea
                        id="scope"
                        name="scope"
                        value={formData.scope}
                        onChange={handleChange}
                        className="bg-black border-gray-700 text-white min-h-[150px]"
                        placeholder="Enter each scope item on a new line:&#10;Remove old shingles&#10;Install new underlayment&#10;Install new shingles&#10;Clean up and disposal"
                      />
                      <p className="text-sm text-gray-500">Enter each item on a new line</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button
                      type="submit"
                      disabled={createProjectMutation.isPending}
                      className="flex-1 bg-[#96D7FE] text-black hover:bg-[#7bc5ec]"
                    >
                      {createProjectMutation.isPending ? (
                        <>Creating Project...</>
                      ) : (
                        <>
                          <Plus size={20} className="mr-2" />
                          Create Project & Send Invitation
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-gray-900 border-[#96D7FE]/20">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <CheckCircle className="text-green-500" size={32} />
                  <div>
                    <CardTitle className="text-white">Project Created Successfully!</CardTitle>
                    <CardDescription className="text-gray-400">
                      Homeowner account has been created
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-black border border-[#96D7FE]/20 rounded-lg p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-[#96D7FE]">Homeowner Login Credentials</h3>
                  <p className="text-gray-400 text-sm">
                    Share these credentials with the homeowner. They can change their password after first login.
                  </p>
                  
                  {credentials && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-800 rounded">
                        <div>
                          <p className="text-sm text-gray-400">Email</p>
                          <p className="text-white font-mono">{credentials.email}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(credentials.email)}
                          className="text-[#96D7FE] hover:text-[#96D7FE] hover:bg-[#96D7FE]/10"
                        >
                          <Copy size={16} />
                        </Button>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-gray-800 rounded">
                        <div>
                          <p className="text-sm text-gray-400">Temporary Password</p>
                          <p className="text-white font-mono">{credentials.password}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(credentials.password)}
                          className="text-[#96D7FE] hover:text-[#96D7FE] hover:bg-[#96D7FE]/10"
                        >
                          <Copy size={16} />
                        </Button>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-gray-800 rounded">
                        <div>
                          <p className="text-sm text-gray-400">Portal URL</p>
                          <p className="text-white font-mono">https://portal.arcticroofing.org/homeowner/login</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard('https://portal.arcticroofing.org/homeowner/login')}
                          className="text-[#96D7FE] hover:text-[#96D7FE] hover:bg-[#96D7FE]/10"
                        >
                          <Copy size={16} />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  <Button
                    onClick={handleCreateAnother}
                    className="flex-1 bg-[#96D7FE] text-black hover:bg-[#7bc5ec]"
                  >
                    <Plus size={20} className="mr-2" />
                    Create Another Project
                  </Button>
                  <Button
                    onClick={() => navigate('/manager')}
                    variant="outline"
                    className="flex-1 border-[#96D7FE]/30 text-[#96D7FE] hover:bg-[#96D7FE]/10"
                  >
                    Back to Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default CreateProject;
