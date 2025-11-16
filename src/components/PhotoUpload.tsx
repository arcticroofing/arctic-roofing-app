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
      console.log('Files selected:', files.length);
      setSelectedFiles(files);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const uploadPhotos = async () => {
    if (selectedFiles.length === 0) {
      toast({
        title: "No Files Selected",
        description: "Please select at least one photo to upload.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    const uploadedUrls: string[] = [];

    try {
      console.log('=== Starting Upload Process ===');
      console.log('Number of files:', selectedFiles.length);
      console.log('Project ID:', projectId);
      console.log('Current photos:', currentPhotos);

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        console.log(`\n--- Uploading file ${i + 1}/${selectedFiles.length} ---`);
        console.log('File name:', file.name);
        console.log('File size:', file.size, 'bytes');
        console.log('File type:', file.type);

        // Validate file type
        if (!file.type.startsWith('image/')) {
          console.error('Invalid file type:', file.type);
          throw new Error(`${file.name} is not an image file`);
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          console.error('File too large:', file.size);
          throw new Error(`${file.name} is too large. Maximum size is 10MB`);
        }

        const fileExt = file.name.split('.').pop()?.toLowerCase();
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(7);
        const fileName = `${projectId}/${timestamp}-${randomStr}.${fileExt}`;

        console.log('Upload path:', fileName);

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from('project-photos')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) {
          console.error('❌ Upload error:', error);
          console.error('Error message:', error.message);
          console.error('Error details:', JSON.stringify(error, null, 2));
          throw new Error(`Failed to upload ${file.name}: ${error.message}`);
        }

        console.log('✅ Upload successful:', data);

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('project-photos')
          .getPublicUrl(fileName);

        console.log('✅ Public URL generated:', publicUrl);
        uploadedUrls.push(publicUrl);
      }

      console.log('\n=== All Files Uploaded Successfully ===');
      console.log('Uploaded URLs:', uploadedUrls);

      // Update database with new photo URLs
      const allPhotos = [...currentPhotos, ...uploadedUrls];
      console.log('Updating database with photos:', allPhotos);

      const { error: updateError } = await supabase
        .from('projects')
        .update({ photos: allPhotos })
        .eq('id', projectId);

      if (updateError) {
        console.error('❌ Database update error:', updateError);
        throw new Error(`Failed to update project: ${updateError.message}`);
      }

      console.log('✅ Database updated successfully!');

      // Refresh queries
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });

      toast({
        title: "Photos Uploaded! ✅",
        description: `Successfully uploaded ${selectedFiles.length} photo(s).`,
      });

      setSelectedFiles([]);
      setDialogOpen(false);
    } catch (error: any) {
      console.error('\n❌ === Upload Failed ===');
      console.error('Error:', error);
      console.error('Error message:', error?.message);
      
      toast({
        title: "Upload Failed",
        description: error?.message || "Failed to upload photos. Please check console for details.",
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
      <DialogContent className="bg-gray-900 border-[#96D7FE]/30 text-white max-w-lg">
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
              className="bg-black border-[#96D7FE]/30 text-white mt-2 cursor-pointer"
            />
            <p className="text-xs text-gray-500 mt-2">
              You can select multiple photos at once (max 10MB each)
            </p>
          </div>

          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <Label className="text-gray-300">
                Selected Files ({selectedFiles.length}):
              </Label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-black p-3 rounded border border-[#96D7FE]/20"
                  >
                    <div className="flex-1 min-w-0">
                      <span className="text-sm text-gray-300 truncate block">
                        {file.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFile(index)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10 ml-2"
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
                Uploading {selectedFiles.length} photo(s)...
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