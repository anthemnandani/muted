'use client';

import { Button } from '@/components/ui/button';
import { MediaFile } from '@/lib/types';
import { getImageDimensions } from '@/lib/utils';
import usePostDialog from '@/store/postDialog';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { useRef, useEffect, Fragment } from 'react';

const MainPreview = ({ mediaFiles }: { mediaFiles: MediaFile[] }) => {
  const { currentMediaIndex, setCurrentMediaIndex } = usePostDialog();
  const videoRef = useRef<HTMLVideoElement>(null);
  const currentFile = mediaFiles[currentMediaIndex];

  useEffect(() => {
    if (currentFile?.type === 'video' && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(console.error);
    }
  }, [currentMediaIndex, currentFile?.type]);

  const getContainerDimensions = (aspectRatio: string) => {
    const containerWidth = 500;
    const containerHeight = 500;

    let mediaWidth, mediaHeight;

    switch (aspectRatio) {
      case '1:1':
        mediaWidth = Math.min(containerWidth, containerHeight);
        mediaHeight = mediaWidth;
        break;
      case '4:5':
        if (containerWidth / containerHeight < 4 / 5) {
          mediaWidth = containerWidth;
          mediaHeight = (containerWidth * 5) / 4;
        } else {
          mediaHeight = containerHeight;
          mediaWidth = (containerHeight * 4) / 5;
        }
        break;
      case '16:9':
        if (containerWidth / containerHeight < 16 / 9) {
          mediaWidth = containerWidth;
          mediaHeight = (containerWidth * 9) / 16;
        } else {
          mediaHeight = containerHeight;
          mediaWidth = (containerHeight * 16) / 9;
        }
        break;
      default:
        mediaWidth = Math.min(containerWidth, containerHeight);
        mediaHeight = mediaWidth;
    }

    return {
      containerWidth,
      containerHeight,
      mediaWidth: Math.min(mediaWidth, containerWidth),
      mediaHeight: Math.min(mediaHeight, containerHeight),
    };
  };

  const aspectRatio = currentFile?.aspectRatio || '1:1';
  const dimensions = getContainerDimensions(aspectRatio);

  const getAspectRatio = async () => {
    const dimensions = await getImageDimensions(currentFile.file);
    console.log(dimensions);
    return dimensions.width / dimensions.height;
  };

  return (
    <div
      className='relative flex-center'
      style={{
        width: `${dimensions.containerWidth}px`,
        height: `${dimensions.containerHeight}px`,
      }}
    >
      {currentFile && (
        <div
          className='relative flex-center'
          style={{
            aspectRatio: getAspectRatio(),
          }}
        >
          {currentFile.type === 'image' ? (
            <Image
              fill
              key={currentFile.id}
              src={currentFile.preview}
              className='object-cover'
              alt={`Preview ${currentMediaIndex + 1}`}
              loading='lazy'
            />
          ) : (
            <video
              ref={videoRef}
              src={currentFile.preview}
              className='w-full h-full object-cover rounded-lg'
              playsInline
              loop
              muted
              autoPlay
            />
          )}
        </div>
      )}

      {mediaFiles.length > 1 && (
        <Fragment>
          <Button
            variant='ghost'
            size='icon'
            className='absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-zinc-800 hover:bg-zinc-800/75 z-10'
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
            className='absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-zinc-800 hover:bg-zinc-800/75 z-10'
            onClick={() =>
              setCurrentMediaIndex(
                Math.min(mediaFiles.length - 1, currentMediaIndex + 1)
              )
            }
            disabled={currentMediaIndex === mediaFiles.length - 1}
          >
            <ChevronRight className='size-6' />
          </Button>
        </Fragment>
      )}
    </div>
  );
};

export default MainPreview;
