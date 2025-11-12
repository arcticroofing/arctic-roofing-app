import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { useToast } from '@/hooks/use-toast';
import { updateProjectStatus, deleteProject } from '../services/projectService';
import { Play, CheckCircle, Trash2, Edit } from 'lucide-react';
import type { Project } from '../services/projectService';

interface ProjectActionsProps {
  project: Project;
}

export function ProjectActions({ project }: ProjectActionsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [progress, setProgress] = useState(project.progress.toString());
  const [status, setStatus] = useState(project.status);

  const updateMutation = useMutation({
    mutationFn: () => updateProjectStatus(project.id, status, parseInt(progress)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', project.id] });
      toast({
        title: "Project Updated",
        description: "Project status and progress updated successfully.",
      });
      setDialogOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteProject(project.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({
        title: "Project Deleted",
        description: "Project has been permanently deleted.",
      });
    },
  });

  const startProjectMutation = useMutation({
    mutationFn: () => updateProjectStatus(project.id, 'In Progress', 10),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', project.id] });
      toast({
        title: "Project Started",
        description: "Project status changed to In Progress.",
      });
    },
  });

  const completeProjectMutation = useMutation({
    mutationFn: () => updateProjectStatus(project.id, 'Completed', 100),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', project.id] });
      toast({
        title: "Project Completed",
        description: "Project marked as completed!",
      });
    },
  });

  return (
    <div className="flex gap-2 flex-wrap">
      {/* Quick Actions */}
      {project.status === 'Not Started' && (
        <Button
          size="sm"
          onClick={() => startProjectMutation.mutate()}
          disabled={startProjectMutation.isPending}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Play size={16} className="mr-1" />
          Start Project
        </Button>
      )}

      {project.status === 'In Progress' && project.progress < 100 && (
        <Button
          size="sm"
          onClick={() => completeProjectMutation.mutate()}
          disabled={completeProjectMutation.isPending}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <CheckCircle size={16} className="mr-1" />
          Mark Complete
        </Button>
      )}

      {/* Update Progress Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline" className="border-[#96D7FE]/30 text-[#96D7FE] hover:bg-[#96D7FE]/10">
            <Edit size={16} className="mr-1" />
            Update Progress
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-gray-900 border-[#96D7FE]/30 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Update Project</DialogTitle>
            <DialogDescription className="text-gray-400">
              Update the status and progress for {project.homeownerName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="status" className="text-gray-300">Status</Label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as Project['status'])}
                className="w-full mt-1 px-3 py-2 bg-black border border-[#96D7FE]/30 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#96D7FE]"
              >
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="On Hold">On Hold</option>
              </select>
            </div>

            <div>
              <Label htmlFor="progress" className="text-gray-300">
                Progress: {progress}%
              </Label>
              <Input
                id="progress"
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={(e) => setProgress(e.target.value)}
                className="mt-1"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>

            <Button
              onClick={() => updateMutation.mutate()}
              disabled={updateMutation.isPending}
              className="w-full bg-[#96D7FE] hover:bg-[#7bc5ec] text-black font-semibold"
            >
              {updateMutation.isPending ? 'Updating...' : 'Update Project'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Project */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button size="sm" variant="destructive">
            <Trash2 size={16} className="mr-1" />
            Delete
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="bg-gray-900 border-[#96D7FE]/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Project?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              This will permanently delete the project for {project.homeownerName}. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-800 text-white border-gray-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate()}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete Project'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}