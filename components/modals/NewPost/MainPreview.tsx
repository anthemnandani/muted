'use client';

import { Button } from '@/components/ui/button';
import { getTargetRatio } from '@/lib/utils';
import useFileStore from '@/store/fileStore';
import usePostDialog from '@/store/postDialog';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import Cropper, { Area } from 'react-easy-crop';

const MainPreview = ({ editPostId }: { editPostId: string | null }) => {
  const { currentMediaIndex, setCurrentMediaIndex, step } = usePostDialog();
  const { mediaFiles, updateMediaFile } = useFileStore();
  const [mediaDims, setMediaDims] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isInteracting, setIsInteracting] = useState(false);
  const currentFile = mediaFiles[currentMediaIndex];

  const selectedRatio = currentFile?.aspectRatio || 'original';

  let activeAspectRatio: number | undefined = undefined;

  if (selectedRatio !== 'original') {
    activeAspectRatio = getTargetRatio(selectedRatio);
  } else if (mediaDims) {
    activeAspectRatio = mediaDims.width / mediaDims.height;
  }

  useEffect(() => {
    if (currentFile) {
      if (currentFile.userCrop && currentFile.userZoom) {
        setCrop(currentFile.userCrop);
        setZoom(currentFile.userZoom);
      } else {
        setCrop({ x: 0, y: 0 });
        setZoom(1);
      }
      setMediaDims(null);
      setIsInteracting(false);
    }
  }, [currentFile?.id]);

  const onCropComplete = useCallback(
    (_: Area, croppedAreaPixels: Area) => {
      if (currentFile && currentFile.type === 'image') {
        updateMediaFile(currentFile.id, {
          cropData: croppedAreaPixels,
          userCrop: crop,
          userZoom: zoom,
        });
      }
    },
    [currentFile, updateMediaFile, crop, zoom]
  );

  const isPostStep = step === 'post';

  if (!currentFile) return null;

  return (
    <div className='relative flex-center size-[500px] bg-black/5 overflow-hidden'>
      <Fragment>
        {currentFile.type === 'image' ? (
          <div className='w-full h-full flex-center relative'>
            {isPostStep ? (
              <img
                alt='Post'
                loading='lazy'
                src={currentFile.preview}
                className='object-cover'
                style={{
                  objectPosition: 'center',
                  aspectRatio: activeAspectRatio
                    ? `${activeAspectRatio}`
                    : 'auto',
                }}
              />
            ) : (
              <Cropper
                image={currentFile.preview}
                crop={crop}
                zoom={zoom}
                aspect={activeAspectRatio}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                onInteractionStart={() => setIsInteracting(true)}
                onInteractionEnd={() => setIsInteracting(false)}
                showGrid={isInteracting}
                onMediaLoaded={(mediaSize) => {
                  setMediaDims({
                    width: mediaSize.naturalWidth,
                    height: mediaSize.naturalHeight,
                  });
                }}
                objectFit='contain'
              />
            )}
          </div>
        ) : (
          <div
            className='relative flex-center overflow-hidden'
            style={{
              aspectRatio: activeAspectRatio ? `${activeAspectRatio}` : 'auto',
              width:
                activeAspectRatio && activeAspectRatio >= 1 ? '100%' : 'auto',
              height:
                activeAspectRatio && activeAspectRatio < 1 ? '100%' : 'auto',
              maxWidth: '100%',
              maxHeight: '100%',
            }}
          >
            <video
              ref={videoRef}
              src={currentFile.preview}
              className='w-full h-full object-cover'
              playsInline
              loop
              muted
              autoPlay
              onLoadedMetadata={(e) => {
                setMediaDims({
                  width: e.currentTarget.videoWidth,
                  height: e.currentTarget.videoHeight,
                });
              }}
            />
          </div>
        )}
      </Fragment>

      {mediaFiles.length > 1 && (
        <Fragment>
          <Button
            variant='ghost'
            size='icon'
            className='absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-zinc-800 hover:bg-zinc-800/75 z-10'
            onClick={(e) => {
              e.preventDefault();
              setCurrentMediaIndex(Math.max(0, currentMediaIndex - 1));
            }}
            disabled={currentMediaIndex === 0}
          >
            <ChevronLeft className='size-6' />
          </Button>
          <Button
            variant='ghost'
            size='icon'
            className='absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-zinc-800 hover:bg-zinc-800/75 z-10'
            onClick={(e) => {
              e.preventDefault();
              setCurrentMediaIndex(
                Math.min(mediaFiles.length - 1, currentMediaIndex + 1)
              );
            }}
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
