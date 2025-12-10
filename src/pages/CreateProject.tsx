import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useManager } from '../contexts/ManagerContext';
import { ArrowLeft, Plus, Loader2 } from 'lucide-react';

export default function CreateProject() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { manager, loading: managerLoading } = useManager();
  
  const [formData, setFormData] = useState({
    homeowner_name: '',
    homeowner_email: '',
    homeowner_phone: '',
    address: '',
    project_type: '',
    budget: '',
    start_date: '',
    end_date: '',
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!manager?.id) {
        throw new Error('Manager not found. Please log in again.');
      }

      // Create homeowner first
      const { data: homeowner, error: homeownerError } = await supabase
        .from('homeowners')
        .insert({
          name: data.homeowner_name,
          email: data.homeowner_email,
          phone: data.homeowner_phone,
          password_hash: 'temp123', // Temporary password
        })
        .select()
        .single();

      if (homeownerError) throw homeownerError;

      // Create project with manager_id
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          homeowner_id: homeowner.id,
          homeowner_name: data.homeowner_name,
          address: data.address,
          project_type: data.project_type,
          budget: parseFloat(data.budget),
          start_date: data.start_date,
          end_date: data.end_date,
          status: 'In Progress',
          progress: 0,
          manager_id: manager.id,  // Assign to current manager
          stages: [
            { id: '1', name: 'Initial Inspection', completed: false, completedDate: null },
            { id: '2', name: 'Material Delivery', completed: false, completedDate: null },
            { id: '3', name: 'Tear Off', completed: false, completedDate: null },
            { id: '4', name: 'Installation', completed: false, completedDate: null },
            { id: '5', name: 'Final Inspection', completed: false, completedDate: null },
          ],
          photos: [],
        })
        .select()
        .single();

      if (projectError) throw projectError;
      return project;
    },
    onSuccess: (data) => {
      toast({
        title: 'Success! 🎉',
        description: `Project created for ${data.homeowner_name}`,
      });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      navigate('/manager-dashboard');
    },
    onError: (error: any) => {
      console.error('Create project error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create project',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.homeowner_name || !formData.address || !formData.project_type) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    createProjectMutation.mutate(formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (managerLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!manager) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>Please log in as a manager to create projects.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/manager-login')} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/manager-dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">Create New Project</h1>
          <p className="text-muted-foreground mt-2">
            Add a new roofing project for a homeowner
          </p>
        </div>

        {/* Form */}
        <Card className="max-w-3xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Project Details
            </CardTitle>
            <CardDescription>
              Fill in the information below to create a new project
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Homeowner Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Homeowner Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="homeowner_name">
                      Full Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="homeowner_name"
                      placeholder="John Doe"
                      value={formData.homeowner_name}
                      onChange={(e) => handleChange('homeowner_name', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="homeowner_email">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="homeowner_email"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.homeowner_email}
                      onChange={(e) => handleChange('homeowner_email', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="homeowner_phone">
                      Phone <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="homeowner_phone"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={formData.homeowner_phone}
                      onChange={(e) => handleChange('homeowner_phone', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">
                      Property Address <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="address"
                      placeholder="123 Main St, City, State ZIP"
                      value={formData.address}
                      onChange={(e) => handleChange('address', e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Project Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Project Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="project_type">
                      Project Type <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.project_type}
                      onValueChange={(value) => handleChange('project_type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select project type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Roof Replacement">Roof Replacement</SelectItem>
                        <SelectItem value="Roof Repair">Roof Repair</SelectItem>
                        <SelectItem value="New Construction">New Construction</SelectItem>
                        <SelectItem value="Roof Inspection">Roof Inspection</SelectItem>
                        <SelectItem value="Emergency Repair">Emergency Repair</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="budget">
                      Budget ($) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="budget"
                      type="number"
                      placeholder="15000"
                      value={formData.budget}
                      onChange={(e) => handleChange('budget', e.target.value)}
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="start_date">
                      Start Date <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => handleChange('start_date', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="end_date">Estimated End Date</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => handleChange('end_date', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/manager-dashboard')}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createProjectMutation.isPending}
                  className="flex-1"
                >
                  {createProjectMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Project
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
