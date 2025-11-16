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
import { supabase } from '@/lib/supabase';
import { Upload, X, Loader2 } from 'lucide-react';

interface PhotoUploadProps {
  projectId: string;
  currentPhotos: string[];
}

export function PhotoUpload({ projectId, currentPhotos }: PhotoUploadProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(files);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const uploadPhotos = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of selectedFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${projectId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        console.log('Uploading file:', fileName);

        const { data, error } = await supabase.storage
          .from('project-photos')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) {
          console.error('Upload error:', error);
          throw error;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('project-photos')
          .getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
        console.log('Uploaded:', publicUrl);
      }

      const allPhotos = [...currentPhotos, ...uploadedUrls];

      const { error: updateError } = await supabase
        .from('projects')
        .update({ photos: allPhotos })
        .eq('id', projectId);

      if (updateError) {
        console.error('Update error:', updateError);
        throw updateError;
      }

      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });

      toast({
        title: "Photos Uploaded!",
        description: `Successfully uploaded ${selectedFiles.length} photo(s).`,
      });

      setSelectedFiles([]);
      setDialogOpen(false);
    } catch (error) {
      console.error('Error uploading photos:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload photos. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="bg-[#96D7FE] hover:bg-[#7bc5ec] text-black font-semibold"
        >
          <Upload size={16} className="mr-1" />
          Upload Photos
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-[#96D7FE]/30 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Upload Project Photos</DialogTitle>
          <DialogDescription className="text-gray-400">
            Upload photos that homeowners can view in their portal
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="photos" className="text-gray-300">
              Select Photos
            </Label>
            <Input
              id="photos"
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="bg-black border-[#96D7FE]/30 text-white mt-2"
            />
            <p className="text-xs text-gray-500 mt-2">
              You can select multiple photos at once
            </p>
          </div>

          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <Label className="text-gray-300">Selected Files:</Label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-black p-2 rounded border border-[#96D7FE]/20"
                  >
                    <span className="text-sm text-gray-300 truncate flex-1">
                      {file.name}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFile(index)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <X size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button
            onClick={uploadPhotos}
            disabled={uploading || selectedFiles.length === 0}
            className="w-full bg-[#96D7FE] hover:bg-[#7bc5ec] text-black font-semibold"
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2" size={16} />
                Upload {selectedFiles.length} Photo(s)
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}