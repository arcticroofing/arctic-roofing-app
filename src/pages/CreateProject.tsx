import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { createProject } from '../services/projectService';
import { createHomeownerAccount } from '../services/authService';
import { sendHomeownerCredentials } from '../services/emailService';
import { ArrowLeft, CheckCircle, Copy } from 'lucide-react';

const CreateProject = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdProject, setCreatedProject] = useState<any>(null);
  const [homeownerCredentials, setHomeownerCredentials] = useState<any>(null);
  const [emailSent, setEmailSent] = useState(false);

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
    photoGalleryUrl: '',
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: any) => {
      const project = await createProject(data);
      const { homeowner, temporaryPassword } = await createHomeownerAccount(
        data.homeownerName,
        data.homeownerEmail,
        project.id
      );

      const emailSuccess = await sendHomeownerCredentials({
        homeownerEmail: data.homeownerEmail,
        homeownerName: data.homeownerName,
        temporaryPassword,
        portalUrl: `${window.location.origin}/homeowner/login`,
        projectType: data.projectType,
        address: data.address,
        startDate: data.startDate,
        projectManager: data.projectManager,
      });

      setEmailSent(emailSuccess);

      if (emailSuccess) {
        console.log('✅ Email prepared for:', data.homeownerEmail);
      }

      return { project, homeowner, temporaryPassword };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setCreatedProject(data.project);
      setHomeownerCredentials({
        email: data.homeowner.email,
        password: data.temporaryPassword,
      });
      setShowSuccess(true);
      toast({
        title: "Project Created!",
        description: "Project created successfully. Send credentials to homeowner.",
      });
    },
    onError: (error) => {
      console.error('Error creating project:', error);
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const scopeArray = formData.scope
      .split('\n')
      .map(item => item.trim())
      .filter(item => item.length > 0);

    const projectData = {
      homeownerName: formData.homeownerName,
      homeownerEmail: formData.homeownerEmail,
      address: formData.address,
      projectType: formData.projectType,
      status: 'Not Started',
      startDate: formData.startDate,
      estimatedCompletion: formData.estimatedCompletion,
      projectManager: formData.projectManager,
      budget: parseFloat(formData.budget),
      scope: scopeArray,
      photoGalleryUrl: formData.photoGalleryUrl || null,
    };

    createProjectMutation.mutate(projectData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Copied to clipboard",
    });
  };

  if (showSuccess && createdProject && homeownerCredentials) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-2xl bg-gray-900 border-[#96D7FE]/30 max-h-[90vh] overflow-y-auto">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-green-500/20 p-4 rounded-full border-2 border-green-500">
                <CheckCircle className="text-green-500" size={48} />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-white">
              Project Created & Invitation Ready!
            </CardTitle>
            <CardDescription className="text-gray-400 text-lg mt-2">
              Send these login credentials to your homeowner
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-6 border border-[#96D7FE]/20">
              <h3 className="text-lg font-semibold text-white mb-4">
                Homeowner Email
              </h3>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-black px-4 py-3 rounded text-[#96D7FE] font-mono">
                  {homeownerCredentials.email}
                </code>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => copyToClipboard(homeownerCredentials.email)}
                  className="border-[#96D7FE]/30 text-[#96D7FE] hover:bg-[#96D7FE]/10"
                >
                  <Copy size={18} />
                </Button>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-[#96D7FE]/20">
              <h3 className="text-lg font-semibold text-white mb-4">
                Temporary Password
              </h3>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-black px-4 py-3 rounded text-[#96D7FE] font-mono text-xl">
                  {homeownerCredentials.password}
                </code>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => copyToClipboard(homeownerCredentials.password)}
                  className="border-[#96D7FE]/30 text-[#96D7FE] hover:bg-[#96D7FE]/10"
                >
                  <Copy size={18} />
                </Button>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-[#96D7FE]/20">
              <h3 className="text-lg font-semibold text-white mb-4">
                Portal URL:
              </h3>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-black px-4 py-3 rounded text-[#96D7FE] font-mono text-sm break-all">
                  {window.location.origin}/homeowner/login
                </code>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => copyToClipboard(`${window.location.origin}/homeowner/login`)}
                  className="border-[#96D7FE]/30 text-[#96D7FE] hover:bg-[#96D7FE]/10"
                >
                  <Copy size={18} />
                </Button>
              </div>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 space-y-3">
              <p className="text-yellow-200 text-sm">
                <strong>📧 Next Step:</strong> Send these credentials to your homeowner using one of the options below:
              </p>
              
              <Button
                onClick={() => {
                  const emailBody = `Hi ${formData.homeownerName},

Great news! Your Arctic Roofing project portal is now active. You can track your project progress, view updates, and see photos in real-time.

🔑 YOUR LOGIN CREDENTIALS:

Portal URL: ${window.location.origin}/homeowner/login
Email: ${homeownerCredentials.email}
Password: ${homeownerCredentials.password}

📋 YOUR PROJECT DETAILS:

Project Type: ${formData.projectType}
Address: ${formData.address}
Start Date: ${new Date(formData.startDate).toLocaleDateString()}
Project Manager: ${formData.projectManager}

WHAT YOU CAN DO IN YOUR PORTAL:
✅ Track project progress through 5 stages
📸 View real-time photos of your project
📝 Read updates from your project manager
📊 See completion timeline and budget
📱 Access from any device, anytime

Simply click the portal URL above and login with your credentials.

We're excited to work with you!

Arctic Roofing Team`;

                  navigator.clipboard.writeText(emailBody);
                  toast({
                    title: "Email Template Copied! ✅",
                    description: "Paste this into your email client and send to the homeowner.",
                  });
                }}
                className="w-full bg-[#96D7FE] hover:bg-[#7bc5ec] text-black font-semibold"
              >
                📋 Copy Email Template to Clipboard
              </Button>
              
              <Button
                onClick={() => {
                  const subject = encodeURIComponent('🏠 Your Arctic Roofing Project Portal is Ready!');
                  const body = encodeURIComponent(`Hi ${formData.homeownerName},

Great news! Your Arctic Roofing project portal is now active.

🔑 YOUR LOGIN CREDENTIALS:

Portal URL: ${window.location.origin}/homeowner/login
Email: ${homeownerCredentials.email}
Password: ${homeownerCredentials.password}

📋 YOUR PROJECT:
${formData.projectType}
${formData.address}

Simply click the portal URL and login with your credentials.

Arctic Roofing Team`);

                  window.open(`mailto:${homeownerCredentials.email}?subject=${subject}&body=${body}`);
                }}
                variant="outline"
                className="w-full border-[#96D7FE]/30 text-[#96D7FE] hover:bg-[#96D7FE]/10"
              >
                📧 Open in Email Client (Gmail/Outlook)
              </Button>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => {
                  setShowSuccess(false);
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
                    photoGalleryUrl: '',
                  });
                }}
                variant="outline"
                className="flex-1 border-[#96D7FE]/30 text-[#96D7FE] hover:bg-[#96D7FE]/10"
              >
                Create Another Project
              </Button>
              <Button
                onClick={() => navigate('/manager')}
                className="flex-1 bg-[#96D7FE] hover:bg-[#7bc5ec] text-black font-semibold"
              >
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
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
        <div className="max-w-3xl mx-auto">
          <Card className="bg-gray-900 border-[#96D7FE]/30">
            <CardHeader>
              <CardTitle className="text-white">Project Information</CardTitle>
              <CardDescription className="text-gray-400">
                Fill in the details to create a new roofing project and generate homeowner portal access
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="homeownerName" className="text-gray-300">
                      Homeowner Name *
                    </Label>
                    <Input
                      id="homeownerName"
                      name="homeownerName"
                      value={formData.homeownerName}
                      onChange={handleChange}
                      className="bg-black border-[#96D7FE]/30 text-white"
                      placeholder="John Smith"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="homeownerEmail" className="text-gray-300">
                      Homeowner Email *
                    </Label>
                    <Input
                      id="homeownerEmail"
                      name="homeownerEmail"
                      type="email"
                      value={formData.homeownerEmail}
                      onChange={handleChange}
                      className="bg-black border-[#96D7FE]/30 text-white"
                      placeholder="john@example.com"
                      required
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
                    className="bg-black border-[#96D7FE]/30 text-white"
                    placeholder="123 Main Street, Anchorage, AK 99501"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="projectType" className="text-gray-300">
                    Project Type *
                  </Label>
                  <Input
                    id="projectType"
                    name="projectType"
                    value={formData.projectType}
                    onChange={handleChange}
                    className="bg-black border-[#96D7FE]/30 text-white"
                    placeholder="Complete Roof Replacement"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      className="bg-black border-[#96D7FE]/30 text-white"
                      required
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
                      className="bg-black border-[#96D7FE]/30 text-white"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="projectManager" className="text-gray-300">
                      Project Manager *
                    </Label>
                    <Input
                      id="projectManager"
                      name="projectManager"
                      value={formData.projectManager}
                      onChange={handleChange}
                      className="bg-black border-[#96D7FE]/30 text-white"
                      placeholder="Mike Johnson"
                      required
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
                      className="bg-black border-[#96D7FE]/30 text-white"
                      placeholder="15000"
                      required
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
                    className="bg-black border-[#96D7FE]/30 text-white min-h-32"
                    placeholder="Remove old shingles&#10;Inspect and repair roof deck&#10;Install new underlayment&#10;Install new shingles&#10;Final cleanup and inspection"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter each scope item on a new line
                  </p>
                </div>

                <div>
                  <Label htmlFor="photoGalleryUrl" className="text-gray-300">
                    Photo Gallery URL (Optional)
                  </Label>
                  <Input
                    id="photoGalleryUrl"
                    name="photoGalleryUrl"
                    type="url"
                    value={formData.photoGalleryUrl}
                    onChange={handleChange}
                    className="bg-black border-[#96D7FE]/30 text-white"
                    placeholder="https://photos.google.com/share/..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Paste a link to Google Photos, Dropbox, or any photo gallery
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={createProjectMutation.isPending}
                  className="w-full bg-[#96D7FE] hover:bg-[#7bc5ec] text-black font-semibold py-6 text-lg"
                >
                  {createProjectMutation.isPending
                    ? 'Creating Project...'
                    : 'Create Project & Generate Invitation'}
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