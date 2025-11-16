import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { updateProjectStatus, deleteProject, type Project } from '../services/projectService';
import { MoreVertical, Trash2, Edit } from 'lucide-react';

interface ProjectActionsProps {
  project: Project;
}

export function ProjectActions({ project }: ProjectActionsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const updateStatusMutation = useMutation({
    mutationFn: (status: 'Not Started' | 'In Progress' | 'Completed' | 'On Hold') =>
      updateProjectStatus(project.id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', project.id] });
      toast({
        title: 'Status Updated',
        description: 'Project status has been updated successfully.',
      });
    },
    onError: () => {
      toast({
        title: 'Update Failed',
        description: 'Failed to update project status.',
        variant: 'destructive',
      });
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: () => deleteProject(project.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({
        title: 'Project Deleted',
        description: 'Project has been deleted successfully.',
      });
      setShowDeleteDialog(false);
    },
    onError: () => {
      toast({
        title: 'Delete Failed',
        description: 'Failed to delete project.',
        variant: 'destructive',
      });
    },
  });

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="outline" className="border-[#96D7FE]/30 text-white hover:bg-[#96D7FE]/10">
            <MoreVertical size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-gray-900 border-[#96D7FE]/30 text-white">
          <DropdownMenuItem
            onClick={() => updateStatusMutation.mutate('Not Started')}
            className="hover:bg-[#96D7FE]/10 cursor-pointer"
          >
            Mark as Not Started
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => updateStatusMutation.mutate('In Progress')}
            className="hover:bg-[#96D7FE]/10 cursor-pointer"
          >
            Mark as In Progress
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => updateStatusMutation.mutate('Completed')}
            className="hover:bg-[#96D7FE]/10 cursor-pointer"
          >
            Mark as Completed
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => updateStatusMutation.mutate('On Hold')}
            className="hover:bg-[#96D7FE]/10 cursor-pointer"
          >
            Mark as On Hold
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className="hover:bg-red-500/10 text-red-400 cursor-pointer"
          >
            <Trash2 size={14} className="mr-2" />
            Delete Project
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-gray-900 border-[#96D7FE]/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Project?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              This will permanently delete this project and all associated data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-800 text-white border-gray-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteProjectMutation.mutate()}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete Project
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}