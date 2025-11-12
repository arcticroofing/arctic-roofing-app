import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '../contexts/AuthContext';
import { createProject } from '../services/projectService';
import { createHomeownerAccount } from '../services/authService';
import { ArrowLeft, Plus, Copy, CheckCircle } from 'lucide-react';

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

  const [formData, setFormData] = useState({
    homeownerName: '',
    homeownerEmail: '',
    address: '',
    projectType: '',
    startDate: '',
    estimatedCompletion: '',
    projectManager: currentManager?.name || 'Mike Johnson',
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

      const project = await createProject({
        homeownerName: data.homeownerName,
        homeownerEmail: data.homeownerEmail,
        address: data.address,
        projectType: data.projectType,
        status: 'Not Started',
        startDate: data.startDate,
        estimatedCompletion: data.estimatedCompletion,
        projectManager: data.projectManager,
        budget: parseFloat(data.budget),
        scope: scopeArray
      });

      // Create homeowner account and get credentials
      const { homeowner, temporaryPassword } = await createHomeownerAccount(
        data.homeownerName,
        data.homeownerEmail,
        project.id
      );

      return { project, email: homeowner.email, password: temporaryPassword };
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

  if (!isManagerAuthenticated) {
    return null;
  }

  if (invitationSent && credentials) {
    return (
      <div className="flex flex-col h-full w-full bg-black">
        <header className="flex items-center sticky top-0 z-10 gap-4 border-b border-[#96D7FE]/20 bg-black px-6 py-4">
          <SidebarTrigger className="text-[#96D7FE]" />
          <h1 className="text-2xl font-semibold text-white">Project Created Successfully</h1>
        </header>
        
        <main className="flex-1 overflow-auto bg-black p-6 flex items-center justify-center">
          <Card className="w-full max-w-2xl bg-gray-900 border-[#96D7FE]/30">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-green-500/10 p-4 rounded-full border border-green-500/30">
                  <CheckCircle className="text-green-500" size={48} />
                </div>
              </div>
              <CardTitle className="text-2xl text-white">Project Created & Invitation Ready!</CardTitle>
              <CardDescription className="text-gray-400">
                Send these login credentials to your homeowner
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-[#96D7FE]/5 border border-[#96D7FE]/20 rounded-lg p-6 space-y-4">
                <div>
                  <Label className="text-gray-400 text-sm">Homeowner Email</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      value={credentials.email}
                      readOnly
                      className="bg-black border-[#96D7FE]/30 text-white"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(credentials.email)}
                      className="border-[#96D7FE]/30 text-[#96D7FE] hover:bg-[#96D7FE]/10"
                    >
                      <Copy size={16} />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-gray-400 text-sm">Temporary Password</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      value={credentials.password}
                      readOnly
                      className="bg-black border-[#96D7FE]/30 text-white font-mono"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(credentials.password)}
                      className="border-[#96D7FE]/30 text-[#96D7FE] hover:bg-[#96D7FE]/10"
                    >
                      <Copy size={16} />
                    </Button>
                  </div>
                </div>

                <div className="bg-black/50 border border-[#96D7FE]/20 rounded p-4 mt-4">
                  <p className="text-sm text-gray-300 mb-2">
                    <strong className="text-[#96D7FE]">Portal URL:</strong>
                  </p>
                  <div className="flex items-center gap-2">
                    <Input
                      value={window.location.origin + '/homeowner/login'}
                      readOnly
                      className="bg-black border-[#96D7FE]/30 text-white text-sm"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(window.location.origin + '/homeowner/login')}
                      className="border-[#96D7FE]/30 text-[#96D7FE] hover:bg-[#96D7FE]/10"
                    >
                      <Copy size={16} />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <p className="text-sm text-yellow-200">
                  <strong>📧 Next Step:</strong> Send an email to your homeowner with these credentials and the portal URL. 
                  They can log in immediately to track their project in real-time!
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setInvitationSent(false);
                    setCredentials(null);
                    setFormData({
                      homeownerName: '',
                      homeownerEmail: '',
                      address: '',
                      projectType: '',
                      startDate: '',
                      estimatedCompletion: '',
                      projectManager: currentManager?.name || 'Mike Johnson',
                      budget: '',
                      scope: ''
                    });
                  }}
                  variant="outline"
                  className="flex-1 border-[#96D7FE]/30 text-[#96D7FE] hover:bg-[#96D7FE]/10"
                >
                  Create Another Project
                </Button>
                <Button
                  onClick={() => navigate('/manager')}
                  className="flex-1 bg-[#96D7FE] text-black hover:bg-[#7bc5ec]"
                >
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-black">
      <header className="flex items-center sticky top-0 z-10 gap-4 border-b border-[#96D7FE]/20 bg-black px-6 py-4">
        <SidebarTrigger className="text-[#96D7FE]" />
        <Button
          variant="ghost"
          onClick={() => navigate('/manager')}
          className="gap-2 text-[#96D7FE] hover:text-[#7bc5ec] hover:bg-[#96D7FE]/10"
        >
          <ArrowLeft size={18} />
          Back
        </Button>
        <h1 className="text-2xl font-semibold text-white">Create New Project</h1>
      </header>
      
      <main className="flex-1 overflow-auto bg-black p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gray-900 border-[#96D7FE]/30">
            <CardHeader>
              <CardTitle className="text-white">Project Information</CardTitle>
              <CardDescription className="text-gray-400">
                Enter the project details and homeowner information. An invitation will be automatically generated.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Homeowner Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[#96D7FE]">Homeowner Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="homeownerName" className="text-gray-300">Homeowner Name *</Label>
                      <Input
                        id="homeownerName"
                        name="homeownerName"
                        value={formData.homeownerName}
                        onChange={handleChange}
                        placeholder="John & Sarah Smith"
                        className="bg-black border-[#96D7FE]/30 text-white placeholder:text-gray-500"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="homeownerEmail" className="text-gray-300">Email Address *</Label>
                      <Input
                        id="homeownerEmail"
                        name="homeownerEmail"
                        type="email"
                        value={formData.homeownerEmail}
                        onChange={handleChange}
                        placeholder="homeowner@email.com"
                        className="bg-black border-[#96D7FE]/30 text-white placeholder:text-gray-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address" className="text-gray-300">Property Address *</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="123 Main Street, Anchorage, AK 99501"
                      className="bg-black border-[#96D7FE]/30 text-white placeholder:text-gray-500"
                      required
                    />
                  </div>
                </div>

                {/* Project Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[#96D7FE]">Project Details</h3>
                  
                  <div>
                    <Label htmlFor="projectType" className="text-gray-300">Project Type *</Label>
                    <select
                      id="projectType"
                      name="projectType"
                      value={formData.projectType}
                      onChange={handleChange}
                      className="w-full mt-1 px-3 py-2 bg-black border border-[#96D7FE]/30 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#96D7FE]"
                      required
                    >
                      <option value="">Select project type...</option>
                      <option value="Complete Roof Replacement">Complete Roof Replacement</option>
                      <option value="Roof Repair">Roof Repair</option>
                      <option value="Storm Damage Restoration">Storm Damage Restoration</option>
                      <option value="Roof Maintenance">Roof Maintenance</option>
                      <option value="Gutter Installation">Gutter Installation</option>
                      <option value="Emergency Repair">Emergency Repair</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="startDate" className="text-gray-300">Start Date *</Label>
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
                      <Label htmlFor="estimatedCompletion" className="text-gray-300">Est. Completion *</Label>
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

                    <div>
                      <Label htmlFor="budget" className="text-gray-300">Budget ($) *</Label>
                      <Input
                        id="budget"
                        name="budget"
                        type="number"
                        value={formData.budget}
                        onChange={handleChange}
                        placeholder="15000"
                        className="bg-black border-[#96D7FE]/30 text-white placeholder:text-gray-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="projectManager" className="text-gray-300">Project Manager *</Label>
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
                    <Label htmlFor="scope" className="text-gray-300">Project Scope (one item per line) *</Label>
                    <Textarea
                      id="scope"
                      name="scope"
                      value={formData.scope}
                      onChange={handleChange}
                      placeholder="Remove existing shingles&#10;Inspect roof deck&#10;Install new shingles&#10;Final cleanup"
                      rows={6}
                      className="bg-black border-[#96D7FE]/30 text-white placeholder:text-gray-500"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#96D7FE] text-black hover:bg-[#7bc5ec] font-semibold"
                  disabled={createProjectMutation.isPending}
                >
                  {createProjectMutation.isPending ? (
                    'Creating Project...'
                  ) : (
                    <>
                      <Plus className="mr-2" size={18} />
                      Create Project & Generate Invitation
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default CreateProject;