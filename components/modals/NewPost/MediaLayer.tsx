'use client';

import { MediaLayerProps } from '@/lib/types';
import { getTargetRatio } from '@/lib/utils';
import { useCallback, useEffect, useRef, useState } from 'react';
import Cropper, { Area } from 'react-easy-crop';

const MediaLayer = ({
  file,
  isActive,
  isPostStep,
  updateMediaFile,
}: MediaLayerProps) => {
  const [crop, setCrop] = useState(file.userCrop || { x: 0, y: 0 });
  const [zoom, setZoom] = useState(file.userZoom || 1);
  const [isInteracting, setIsInteracting] = useState(false);
  const [mediaDims, setMediaDims] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (file.userCrop) setCrop(file.userCrop);
    if (file.userZoom) setZoom(file.userZoom);
  }, [file.userCrop, file.userZoom]);

  useEffect(() => {
    if (file.type === 'video' && videoRef.current) {
      if (isActive) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  }, [isActive, file.type]);

  const selectedRatio = file?.aspectRatio || 'original';
  let activeAspectRatio: number | undefined = undefined;

  if (selectedRatio !== 'original') {
    activeAspectRatio = getTargetRatio(selectedRatio);
  } else if (mediaDims) {
    activeAspectRatio = mediaDims.width / mediaDims.height;
  }

  const onCropComplete = useCallback(
    (_: Area, croppedAreaPixels: Area) => {
      if (file.type === 'image') {
        updateMediaFile(file.id, {
          cropData: croppedAreaPixels,
          userCrop: crop,
          userZoom: zoom,
        });
      }
    },
    [file.id, file.type, updateMediaFile, crop, zoom]
  );

  return (
    <div
      className={`absolute inset-0 w-full h-full transition-opacity duration-300 ease-in-out ${
        isActive
          ? 'opacity-100 z-10 pointer-events-auto'
          : 'opacity-0 z-0 pointer-events-none'
      }`}
    >
      <div className='relative w-full h-full flex-center'>
        {file.type === 'image' ? (
          isPostStep ? (
            <img
              alt='Post'
              loading='lazy'
              src={file.preview}
              className='object-cover w-full h-full object-center'
              style={{
                aspectRatio: activeAspectRatio
                  ? `${activeAspectRatio}`
                  : 'auto',
              }}
            />
          ) : (
            <Cropper
              image={file.preview}
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
              restrictPosition={false}
            />
          )
        ) : (
          <div
            className='relative max-h-full max-w-full overflow-hidden'
            style={{
              aspectRatio: activeAspectRatio ? `${activeAspectRatio}` : 'auto',
              width:
                activeAspectRatio && activeAspectRatio >= 1 ? '100%' : 'auto',
              height:
                activeAspectRatio && activeAspectRatio < 1 ? '100%' : 'auto',
            }}
          >
            <video
              ref={videoRef}
              src={file.preview}
              className='w-full h-full object-cover'
              playsInline
              loop
              muted
              onLoadedMetadata={(e) => {
                setMediaDims({
                  width: e.currentTarget.videoWidth,
                  height: e.currentTarget.videoHeight,
                });
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaLayer;
