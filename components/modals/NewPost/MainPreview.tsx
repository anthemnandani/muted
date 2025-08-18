'use client';

import { VideoPlayer } from '@/components/shared/VideoPlayer';
import { Button } from '@/components/ui/button';
import type { AspectRatio, MediaFile } from '@/lib/types';
import { getTargetRatio, getVideoObjectFit } from '@/lib/utils';
import usePostDialog from '@/store/postDialog';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';

const MainPreview = ({
  mediaFiles,
  editPostId,
}: {
  mediaFiles: MediaFile[];
  editPostId: string | null;
}) => {
  const { currentMediaIndex, setCurrentMediaIndex } = usePostDialog();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [imageDimensions, setImageDimensions] = useState<
    | {
        width: number;
        height: number;
      }
    | undefined
  >(undefined);
  const [videoDimensions, setVideoDimensions] = useState<
    | {
        width: number;
        height: number;
      }
    | undefined
  >(undefined);
  const currentFile = mediaFiles[currentMediaIndex];

  useEffect(() => {
    if (currentFile?.type === 'video' && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(console.error);

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
  }, [currentFile?.type]);

  useEffect(() => {
    if (currentFile?.type === 'image' && currentFile.preview) {
      const img = new window.Image();
      img.onload = () => {
        setImageDimensions({ width: img.width, height: img.height });
      };
      img.src = currentFile.preview;
    }
  }, [currentFile?.type]);

  const getPreviewDimensions = (aspectRatio: AspectRatio) => {
    const maxWidth = 500;
    const maxHeight = 500;

    const originalDimensions =
      currentFile?.type === 'video' ? videoDimensions : imageDimensions;

    if (!originalDimensions && aspectRatio === 'original') {
      return { width: maxWidth, height: maxHeight };
    }

    const targetRatio = getTargetRatio(aspectRatio, originalDimensions);

    if (currentFile?.type === 'video' && originalDimensions) {
      const originalRatio =
        originalDimensions.width / originalDimensions.height;

      if (originalRatio > 1 && aspectRatio === '9:16') {
        return { width: maxWidth, height: maxWidth / targetRatio };
      }

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

  const objectFit = getVideoObjectFit(aspectRatio, videoDimensions);

  const isSafari = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  }, []);

  const sourceType = useMemo(() => {
    if (isSafari) {
      return 'application/vnd.apple.mpegurl';
    }
    return 'application/x-mpegURL';
  }, [isSafari]);

  const playerOptions = useMemo(
    () => ({
      controls: true,
      loop: true,
      muted: true,
      playsinline: true,
      preload: 'metadata',
      autoplay: true,
      disablePictureInPicture: true,
      userActions: { hotkeys: true, doubleClick: false },
      controlBar: {
        pictureInPictureToggle: false,
        fullscreenToggle: false,
        volumePanel: false,
        progressControl: {
          seekBar: true,
        },
        children: ['progressControl'],
      },
      sources: [{ src: currentFile.preview, type: sourceType }],
      html5: {
        vhs: {
          overrideNative: !isSafari,
          withCredentials: false,
        },
        nativeTextTracks: isSafari,
        nativeAudioTracks: isSafari,
        nativeVideoTracks: isSafari,
      },
      hls: {
        debug: false,
        enableLowInitialPlaylist: true,
        manifestLoadingTimeOut: 10000,
      },
    }),
    [currentFile.preview]
  );

  return (
    <div className='relative flex-center size-[500px]'>
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
          ) : editPostId ? (
            <VideoPlayer
              poster={currentFile.poster}
              options={playerOptions}
              aspectRatio={aspectRatio}
            />
          ) : (
            <video
              ref={videoRef}
              src={currentFile.preview}
              className={`rounded-lg ${objectFit}`}
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
