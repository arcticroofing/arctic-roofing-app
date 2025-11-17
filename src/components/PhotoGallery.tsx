import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';

interface PhotoGalleryProps {
  photoGalleryUrl?: string;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({ photoGalleryUrl }) => {
  if (!photoGalleryUrl) return null;

  return (
    <Card className="bg-gray-900 border-[#96D7FE]/30">
      <CardHeader>
        <CardTitle className="text-white">Photo Gallery</CardTitle>
      </CardHeader>
      <CardContent>
        <a
          href={photoGalleryUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-[#96D7FE] hover:text-[#7bc5ec] font-semibold"
        >
          <ExternalLink size={18} />
          View Full Photo Gallery
        </a>
      </CardContent>
    </Card>
  );
};