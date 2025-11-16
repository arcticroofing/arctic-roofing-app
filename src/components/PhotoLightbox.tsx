import React, { useState } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2, Image as ImageIcon } from 'lucide-react';
import type { Project } from '../services/projectService';

interface PhotoLightboxProps {
  project: Project;
  isManager: boolean;
}

export function PhotoLightbox({ project, isManager }: PhotoLightboxProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [photoToDelete, setPhotoToDelete] = useState<string | null>(null);

  const deletePhotoMutation = useMutation({
    mutationFn: async (photoUrl: string) => {
      const urlParts = photoUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const folderName = urlParts[urlParts.length - 2];
      const filePath = `${folderName}/${fileName}`;

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

  const slides = project.photos.map(photo => ({ src: photo }));

  return (
    <>
      <Card className="bg-gray-900 border-[#96D7FE]/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2 text-base sm:text-lg">
            <ImageIcon size={20} className="sm:w-6 sm:h-6 text-[#96D7FE]" />
            Project Photos ({project.photos.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
            {project.photos.map((photo, index) => (
              <div key={index} className="relative group">
                <img
                  src={photo}
                  alt={`Project photo ${index + 1}`}
                  className="w-full h-32 sm:h-48 object-cover rounded-lg border border-[#96D7FE]/20 hover:border-[#96D7FE] transition-all cursor-pointer hover:scale-105 active:scale-95"
                  onClick={() => {
                    setCurrentIndex(index);
                    setLightboxOpen(true);
                  }}
                />
                {isManager && (
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPhotoToDelete(photo);
                    }}
                  >
                    <Trash2 size={14} />
                  </Button>
                )}
                <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {index + 1} / {project.photos.length}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={slides}
        index={currentIndex}
        on={{
          view: ({ index }) => setCurrentIndex(index),
        }}
      />

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