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
import { useToast } from '@/hooks/use-toast';
import { updatePhotoGalleryUrl } from '../services/projectService';
import { Edit, Image } from 'lucide-react';

interface EditPhotoGalleryProps {
  projectId: string;
  currentUrl?: string;
}

export function EditPhotoGallery({ projectId, currentUrl }: EditPhotoGalleryProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [url, setUrl] = useState(currentUrl || '');

  const updateMutation = useMutation({
    mutationFn: () => updatePhotoGalleryUrl(projectId, url),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      toast({
        title: "Photo Gallery Updated",
        description: "Photo gallery URL has been updated successfully.",
      });
      setDialogOpen(false);
    },
  });

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="border-[#96D7FE]/30 text-[#96D7FE] hover:bg-[#96D7FE]/10"
        >
          <Image size={16} className="mr-1" />
          {currentUrl ? 'Edit' : 'Add'} Photo Gallery
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-[#96D7FE]/30 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Photo Gallery URL</DialogTitle>
          <DialogDescription className="text-gray-400">
            Add or update the link to your project photo gallery
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="photoUrl" className="text-gray-300">
              Photo Gallery URL
            </Label>
            <Input
              id="photoUrl"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://photos.google.com/share/..."
              className="bg-black border-[#96D7FE]/30 text-white mt-2"
            />
            <p className="text-xs text-gray-500 mt-2">
              Paste a link to Google Photos, Dropbox, iCloud, or any photo gallery
            </p>
          </div>

          <Button
            onClick={() => updateMutation.mutate()}
            disabled={updateMutation.isPending || !url}
            className="w-full bg-[#96D7FE] hover:bg-[#7bc5ec] text-black font-semibold"
          >
            {updateMutation.isPending ? 'Updating...' : 'Update Photo Gallery'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}