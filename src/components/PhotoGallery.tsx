import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Image } from 'lucide-react';

interface PhotoGalleryProps {
  photoGalleryUrl?: string;
}

export function PhotoGallery({ photoGalleryUrl }: PhotoGalleryProps) {
  if (!photoGalleryUrl) {
    return null;
  }

  let displayDomain = 'Photo Gallery';
  try {
    const url = new URL(photoGalleryUrl);
    if (url.hostname.includes('google')) {
      displayDomain = 'Google Photos';
    } else if (url.hostname.includes('dropbox')) {
      displayDomain = 'Dropbox';
    } else if (url.hostname.includes('icloud')) {
      displayDomain = 'iCloud Photos';
    } else {
      displayDomain = url.hostname;
    }
  } catch (e) {
    // Invalid URL, use default
  }

  return (
    <Card className="bg-gray-900 border-[#96D7FE]/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2 text-base sm:text-lg">
          <Image size={20} className="sm:w-6 sm:h-6 text-[#96D7FE]" />
          Photo Gallery
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-gradient-to-br from-[#96D7FE]/10 to-[#7bc5ec]/10 border border-[#96D7FE]/30 rounded-lg p-6 sm:p-8 text-center">
          <div className="mb-4">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-[#96D7FE]/20 rounded-full mb-4">
              <Image size={24} className="sm:w-8 sm:h-8 text-[#96D7FE]" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
              View Project Photos
            </h3>
            <p className="text-gray-400 mb-6 text-sm sm:text-base">
              Click below to view all photos from your roofing project on {displayDomain}
            </p>
          </div>
          
          <Button
            onClick={() => window.open(photoGalleryUrl, '_blank')}
            className="bg-[#96D7FE] hover:bg-[#7bc5ec] text-black font-semibold px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg w-full sm:w-auto"
          >
            <ExternalLink className="mr-2" size={18} />
            Open Photo Gallery
          </Button>
          
          <p className="text-xs text-gray-500 mt-4">
            Opens in a new tab
          </p>
        </div>
      </CardContent>
    </Card>
  );
}