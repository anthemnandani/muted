'use client';

import { Button } from '@/components/ui/button';
import { MediaFile } from '@/lib/types';
import usePostDialog from '@/store/postDialog';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { Fragment, useEffect, useRef, useState } from 'react';

const MainPreview = ({ mediaFiles }: { mediaFiles: MediaFile[] }) => {
  const { currentMediaIndex, setCurrentMediaIndex } = usePostDialog();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [imageDimensions, setImageDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [videoDimensions, setVideoDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const currentFile = mediaFiles[currentMediaIndex];

  useEffect(() => {
    if (currentFile?.type === 'video' && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(console.error);

      // Get video dimensions when metadata loads
      const handleLoadedMetadata = () => {
        if (videoRef.current) {
          setVideoDimensions({
            width: videoRef.current.videoWidth,
            height: videoRef.current.videoHeight,
          });
        }
      };

      videoRef.current.addEventListener('loadedmetadata', handleLoadedMetadata);

      return () => {
        if (videoRef.current) {
          videoRef.current.removeEventListener(
            'loadedmetadata',
            handleLoadedMetadata
          );
        }
      };
    }
  }, [currentMediaIndex, currentFile?.type]);

  useEffect(() => {
    if (currentFile?.type === 'image' && currentFile.preview) {
      const img = new window.Image();
      img.onload = () => {
        setImageDimensions({ width: img.width, height: img.height });
      };
      img.src = currentFile.preview;
    }
  }, [currentFile?.preview, currentFile?.type]);

  const getPreviewDimensions = (aspectRatio: string) => {
    const maxWidth = 500;
    const maxHeight = 500;

    // Get original dimensions based on media type
    const originalDimensions =
      currentFile?.type === 'video' ? videoDimensions : imageDimensions;

    if (!originalDimensions && aspectRatio === 'original') {
      return { width: maxWidth, height: maxHeight };
    }

    let targetRatio: number;

    switch (aspectRatio) {
      case 'original':
        if (originalDimensions) {
          targetRatio = originalDimensions.width / originalDimensions.height;
        } else {
          targetRatio = 1;
        }
        break;
      case '1:1':
        targetRatio = 1;
        break;
      case '4:5':
        targetRatio = 4 / 5;
        break;
      case '9:16':
        targetRatio = 9 / 16;
        break;
      case '16:9':
        targetRatio = 16 / 9;
        break;
      default:
        targetRatio = 1;
    }

    // Special handling for videos with mismatched orientations
    if (currentFile?.type === 'video' && originalDimensions) {
      const originalRatio =
        originalDimensions.width / originalDimensions.height;

      // Landscape video with 9:16 ratio - take full width
      if (originalRatio > 1 && aspectRatio === '9:16') {
        return { width: maxWidth, height: maxWidth / targetRatio };
      }

      // Portrait video with 16:9 ratio - take full height
      if (originalRatio < 1 && aspectRatio === '16:9') {
        return { width: maxHeight * targetRatio, height: maxHeight };
      }
    }

    let width, height;

    if (targetRatio > 1) {
      width = Math.min(maxWidth, maxHeight * targetRatio);
      height = width / targetRatio;
    } else {
      height = Math.min(maxHeight, maxWidth / targetRatio);
      width = height * targetRatio;
    }

    return { width: Math.round(width), height: Math.round(height) };
  };

  const aspectRatio = currentFile?.aspectRatio || '1:1';
  const dimensions = getPreviewDimensions(aspectRatio);

  // Determine object-fit for videos based on original aspect ratio
  const getVideoObjectFit = () => {
    if (currentFile?.type !== 'video') return 'object-cover';

    // Get original video aspect ratio
    const originalRatio = videoDimensions
      ? videoDimensions.width / videoDimensions.height
      : null;

    if (originalRatio === null) return 'object-cover';

    if (originalRatio < 1) {
      // Portrait video: object-contain for 'original' and '9:16'
      return aspectRatio === 'original' || aspectRatio === '9:16'
        ? 'object-contain'
        : 'object-cover';
    } else if (originalRatio > 1) {
      // Landscape video: object-contain for all options
      return 'object-contain';
    } else {
      // Square video (ratio = 1): use object-cover
      return 'object-cover';
    }
  };

  return (
    <div className='relative flex-center size-[500px] bg-[#121212]'>
      {currentFile && (
        <Fragment>
          {currentFile.type === 'image' ? (
            <div
              className='relative overflow-hidden'
              style={{
                width: dimensions.width,
                height: dimensions.height,
              }}
            >
              <Image
                src={currentFile.preview}
                alt={`Preview ${currentMediaIndex + 1}`}
                width={dimensions.width}
                height={dimensions.height}
                className='object-cover w-full h-full'
                loading='lazy'
              />
            </div>
          ) : (
            <video
              ref={videoRef}
              src={currentFile.preview}
              className={`rounded-lg ${getVideoObjectFit()}`}
              style={{
                width: dimensions.width,
                height: dimensions.height,
              }}
              playsInline
              loop
              muted
              autoPlay
            />
          )}
        </Fragment>
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
