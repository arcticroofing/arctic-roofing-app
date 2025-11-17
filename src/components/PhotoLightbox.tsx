import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { X, Plus, Image as ImageIcon, Upload } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadProjectPhoto } from '../services/projectService';
import { useToast } from '@/hooks/use-toast';

interface Project {
  id: string;
  photos: string[];
}

interface PhotoLightboxProps {
  project: Project;
  isManager: boolean;
}

export const PhotoLightbox: React.FC<PhotoLightboxProps> = ({ project, isManager }) => {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addPhotoMutation = useMutation({
    mutationFn: (photoUrl: string) => uploadProjectPhoto(project.id, photoUrl),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', project.id] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({
        title: 'Photo Added',
        description: 'Photo has been added to the project.',
      });
      setSelectedFile(null);
      setPreviewUrl('');
      setDialogOpen(false);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to add photo. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid File',
          description: 'Please select an image file.',
          variant: 'destructive',
        });
        return;
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File Too Large',
          description: 'Please select an image smaller than 5MB.',
          variant: 'destructive',
        });
        return;
      }

      setSelectedFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: 'No File Selected',
        description: 'Please select a photo to upload.',
        variant: 'destructive',
      });
      return;
    }

    // Convert file to base64 data URL
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      addPhotoMutation.mutate(base64String);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl('');
  };

  return (
    <>
      <Card className="bg-gray-900 border-[#96D7FE]/30">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">Project Photos</CardTitle>
          {isManager && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#96D7FE] hover:bg-[#7bc5ec] text-black">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Photo
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-900 border-[#96D7FE]/30 text-white">
                <DialogHeader>
                  <DialogTitle className="text-white">Add Project Photo</DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Upload a photo from your device to add to this project.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="photoFile" className="text-gray-300">
                      Select Photo
                    </Label>
                    <div className="mt-2">
                      <Input
                        id="photoFile"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="photoFile"
                        className="flex items-center justify-center gap-2 w-full px-4 py-8 border-2 border-dashed border-[#96D7FE]/30 rounded-lg cursor-pointer hover:border-[#96D7FE] transition-colors bg-black"
                      >
                        <Upload className="text-[#96D7FE]" size={24} />
                        <span className="text-gray-300">
                          {selectedFile ? selectedFile.name : 'Click to select a photo'}
                        </span>
                      </label>
                    </div>
                  </div>

                  {previewUrl && (
                    <div className="relative">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-64 object-cover rounded-lg border border-[#96D7FE]/20"
                      />
                      <button
                        onClick={handleRemoveFile}
                        className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      onClick={handleUpload}
                      className="flex-1 bg-[#96D7FE] hover:bg-[#7bc5ec] text-black"
                      disabled={!selectedFile || addPhotoMutation.isPending}
                    >
                      {addPhotoMutation.isPending ? 'Uploading...' : 'Upload Photo'}
                    </Button>
                    <Button
                      onClick={() => setDialogOpen(false)}
                      variant="outline"
                      className="border-gray-700 text-gray-300 hover:bg-gray-800"
                    >
                      Cancel
                    </Button>
                  </div>

                  <p className="text-xs text-gray-500 text-center">
                    Supported formats: JPG, PNG, GIF • Max size: 5MB
                  </p>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </CardHeader>
        <CardContent>
          {project.photos.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {project.photos.map((photo, index) => (
                <div
                  key={index}
                  className="relative group cursor-pointer overflow-hidden rounded-lg border border-[#96D7FE]/20 hover:border-[#96D7FE] transition-all"
                  onClick={() => setSelectedPhoto(photo)}
                >
                  <img
                    src={photo}
                    alt={`Project photo ${index + 1}`}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <ImageIcon className="text-white" size={32} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <ImageIcon className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-2">No photos yet</p>
              {isManager && (
                <p className="text-sm text-gray-500">Click "Add Photo" to upload project photos</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lightbox */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-[#96D7FE] transition-colors"
            onClick={() => setSelectedPhoto(null)}
          >
            <X size={32} />
          </button>
          <img
            src={selectedPhoto}
            alt="Full size"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
};