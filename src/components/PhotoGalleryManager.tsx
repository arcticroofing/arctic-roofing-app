import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { supabase } from '@/lib/supabase';
import { Trash2, Image as ImageIcon } from 'lucide-react';
import type { Project } from '../services/projectService';

interface PhotoGalleryManagerProps {
  project: Project;
  isManager: boolean;
}

export function PhotoGalleryManager({ project, isManager }: PhotoGalleryManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [photoToDelete, setPhotoToDelete] = useState<string | null>(null);

  const deletePhotoMutation = useMutation({
    mutationFn: async (photoUrl: string) => {
      const fileName = photoUrl.split('/').pop();
      const filePath = `${project.id}/${fileName}`;

      await supabase.storage
        .from('project-photos')
        .remove([filePath]);

      const updatedPhotos = project.photos.filter(p => p !== photoUrl);

      const { error } = await supabase
        .from('projects')
        .update({ photos: updatedPhotos })
        .eq('id', project.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', project.id] });
      toast({
        title: "Photo Deleted",
        description: "Photo has been removed successfully.",
      });
      setPhotoToDelete(null);
    },
    onError: () => {
      toast({
        title: "Delete Failed",
        description: "Failed to delete photo. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (project.photos.length === 0) {
    return null;
  }

  return (
    <>
      <Card className="bg-gray-900 border-[#96D7FE]/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <ImageIcon size={24} className="text-[#96D7FE]" />
            Project Photos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {project.photos.map((photo, index) => (
              <div key={index} className="relative group">
                <img
                  src={photo}
                  alt={`Project photo ${index + 1}`}
                  className="w-full h-48 object-cover rounded-lg border border-[#96D7FE]/20 hover:border-[#96D7FE] transition-colors cursor-pointer"
                  onClick={() => window.open(photo, '_blank')}
                />
                {isManager && (
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setPhotoToDelete(photo)}
                  >
                    <Trash2 size={16} />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!photoToDelete} onOpenChange={() => setPhotoToDelete(null)}>
        <AlertDialogContent className="bg-gray-900 border-[#96D7FE]/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Photo?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              This will permanently delete this photo. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-800 text-white border-gray-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => photoToDelete && deletePhotoMutation.mutate(photoToDelete)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete Photo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}