'use client';

import CarouselNavigation from '@/components/shared/CarouselNavigation';
import { getTargetRatio } from '@/lib/utils';
import useFileStore from '@/store/fileStore';
import usePostDialog from '@/store/postDialog';
import useEmblaCarousel from 'embla-carousel-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import Cropper, { Area } from 'react-easy-crop';

const MainPreview = ({ editPostId }: { editPostId: string | null }) => {
  const { currentMediaIndex, setCurrentMediaIndex, step } = usePostDialog();
  const { mediaFiles, updateMediaFile } = useFileStore();

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    duration: 20,
    watchDrag: false,
  });

  const [mediaDims, setMediaDims] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isInteracting, setIsInteracting] = useState(false);

  useEffect(() => {
    if (emblaApi) {
      emblaApi.scrollTo(currentMediaIndex);
    }
  }, [currentMediaIndex, emblaApi]);

  useEffect(() => {
    const currentFile = mediaFiles[currentMediaIndex];
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
  }, [currentMediaIndex, mediaFiles]);

  const onCropComplete = useCallback(
    (_: Area, croppedAreaPixels: Area) => {
      const currentFile = mediaFiles[currentMediaIndex];
      if (currentFile && currentFile.type === 'image') {
        updateMediaFile(currentFile.id, {
          cropData: croppedAreaPixels,
          userCrop: crop,
          userZoom: zoom,
        });
      }
    },
    [mediaFiles, currentMediaIndex, updateMediaFile, crop, zoom]
  );

  const isPostStep = step === 'post';

  const scrollPrev = () => {
    const newIndex = Math.max(0, currentMediaIndex - 1);
    setCurrentMediaIndex(newIndex);
  };

  const scrollNext = () => {
    const newIndex = Math.min(mediaFiles.length - 1, currentMediaIndex + 1);
    setCurrentMediaIndex(newIndex);
  };

  if (mediaFiles.length === 0) return null;

  return (
    <div className='relative size-[500px] bg-black/5 overflow-hidden rounded-lg'>
      <div className='overflow-hidden w-full h-full' ref={emblaRef}>
        <div className='flex w-full h-full touch-pan-y'>
          {mediaFiles.map((file, index) => {
            const isActive = index === currentMediaIndex;
            const selectedRatio = file.aspectRatio || 'original';
            let activeAspectRatio: number | undefined = undefined;
            if (selectedRatio !== 'original') {
              activeAspectRatio = getTargetRatio(selectedRatio);
            } else if (isActive && mediaDims) {
              activeAspectRatio = mediaDims.width / mediaDims.height;
            }

            return (
              <div
                key={file.id}
                className='flex-[0_0_100%] min-w-0 relative w-full h-full flex-center'
              >
                {file.type === 'image' ? (
                  <div className='w-full h-full flex-center relative'>
                    {isActive && !isPostStep ? (
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
                    ) : (
                      <img
                        alt='Preview'
                        src={file.preview}
                        className='w-full h-full object-contain object-center'
                      />
                    )}
                  </div>
                ) : (
                  <div
                    className='relative max-w-full max-h-full flex-center overflow-hidden'
                    style={{
                      aspectRatio: activeAspectRatio
                        ? `${activeAspectRatio}`
                        : 'auto',
                      width:
                        activeAspectRatio && activeAspectRatio >= 1
                          ? '100%'
                          : 'auto',
                      height:
                        activeAspectRatio && activeAspectRatio < 1
                          ? '100%'
                          : 'auto',
                    }}
                  >
                    <video
                      ref={isActive ? videoRef : null}
                      src={file.preview}
                      className='w-full h-full object-cover'
                      playsInline
                      loop
                      muted
                      autoPlay={isActive}
                      onLoadedMetadata={(e) => {
                        if (isActive) {
                          setMediaDims({
                            width: e.currentTarget.videoWidth,
                            height: e.currentTarget.videoHeight,
                          });
                        }
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <CarouselNavigation
        selectedIndex={currentMediaIndex}
        totalCount={mediaFiles.length}
        onPrev={scrollPrev}
        onNext={scrollNext}
      />
    </div>
  );
};

export default MainPreview;
