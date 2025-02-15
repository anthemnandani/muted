'use client';

import { Button } from '@/components/ui/button';
import { MediaFile } from '@/lib/types';
import usePostDialog from '@/store/postDialog';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import React from 'react';

const MainPreview = ({ mediaFiles }: { mediaFiles: MediaFile[] }) => {
  const { currentMediaIndex, setCurrentMediaIndex } = usePostDialog();
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const currentFile = mediaFiles[currentMediaIndex];

  React.useEffect(() => {
    if (currentFile?.type === 'video' && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(console.error);
    }
  }, [currentMediaIndex, currentFile?.type]);

  return (
    <React.Fragment>
      {currentFile &&
        (currentFile.type === 'image' ? (
          <Image
            fill
            key={currentFile.id}
            src={currentFile.preview}
            className='h-full w-full object-contain'
            alt={`Preview ${currentMediaIndex + 1}`}
            loading='lazy'
          />
        ) : (
          <video
            ref={videoRef}
            src={currentFile.preview}
            className='h-full w-full object-contain'
            playsInline
            loop
            muted
            autoPlay
          />
        ))}

      {mediaFiles.length > 1 && (
        <React.Fragment>
          <Button
            variant='ghost'
            size='icon'
            className='absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-zinc-800 hover:bg-zinc-800/75'
            onClick={() =>
              setCurrentMediaIndex(Math.max(0, currentMediaIndex - 1))
            }
            disabled={currentMediaIndex === 0}
          >
            <ChevronLeft className='size-6' />
          </Button>
          <Button
            variant='ghost'
            size='icon'
            className='absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-zinc-800 hover:bg-zinc-800/75'
            onClick={() =>
              setCurrentMediaIndex(
                Math.min(mediaFiles.length - 1, currentMediaIndex + 1)
              )
            }
            disabled={currentMediaIndex === mediaFiles.length - 1}
          >
            <ChevronRight className='size-6' />
          </Button>
        </React.Fragment>
      )}
    </React.Fragment>
  );
};

export default MainPreview;
