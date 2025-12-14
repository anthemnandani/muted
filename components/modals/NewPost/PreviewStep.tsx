'use client';

import { PreviewStepProps } from '@/lib/types';
import { cn } from '@/lib/utils';
import useFileStore from '@/store/fileStore';
import usePostDialog from '@/store/postDialog';
import { useEffect, useMemo } from 'react';
import AspectRatioSelector from './AspectRatioSelector';
import Gallery from './Gallery';
import MainPreview from './MainPreview';

const PreviewStep = ({
  getRootProps,
  getInputProps,
  isDragActive,
}: PreviewStepProps) => {
  const { mediaFiles, setMediaFiles } = useFileStore();
  const { setStep, currentMediaIndex, setCurrentMediaIndex, step, editPostId } =
    usePostDialog();

  const currentFile = mediaFiles[currentMediaIndex];

  const selectedRatio = currentFile?.aspectRatio || 'original';

  const handleRemoveMedia = (id: string) => {
    const newFiles = mediaFiles.filter((file) => file.id !== id);
    if (newFiles.length === 0) {
      setStep('compose');
    } else if (currentMediaIndex >= newFiles.length) {
      setCurrentMediaIndex(Math.max(0, newFiles.length - 1));
    }
    setMediaFiles(newFiles);
  };

  const handleAspectRatioChange = (ratio: string) => {
    const updatedFiles = mediaFiles.map((file) => ({
      ...file,
      aspectRatio: ratio,
      userCrop: { x: 0, y: 0 },
      userZoom: 1,
    }));
    setMediaFiles(updatedFiles);
  };

  const isVideoOnly = useMemo(() => {
    return mediaFiles.length > 0 && mediaFiles.every((f) => f.type === 'video');
  }, [mediaFiles]);

  const isMixedMedia = useMemo(() => {
    const hasImage = mediaFiles.some((f) => f.type === 'image');
    const hasVideo = mediaFiles.some((f) => f.type === 'video');
    return hasImage && hasVideo;
  }, [mediaFiles]);

  useEffect(() => {
    if (mediaFiles.length > 0) {
      let nextFiles = [...mediaFiles];
      let hasChanges = false;

      if (isMixedMedia) {
        const hasInvalidRatio = nextFiles.some((f) => f.aspectRatio === '9:16');

        if (hasInvalidRatio) {
          nextFiles = nextFiles.map((file) => {
            if (file.aspectRatio === '9:16') {
              return {
                ...file,
                aspectRatio: 'original',
                userCrop: { x: 0, y: 0 },
                userZoom: 1,
              };
            }
            return file;
          });
          hasChanges = true;
        }
      }

      nextFiles.sort((a, b) => {
        if (a.type === 'image' && b.type === 'video') return -1;
        if (a.type === 'video' && b.type === 'image') return 1;
        return 0;
      });

      if (hasChanges) {
        setMediaFiles(nextFiles);
      }
    }
  }, [mediaFiles, setMediaFiles]);

  return (
    <div
      className={cn(
        'relative w-full bg-[#121212] overflow-hidden rounded-lg',
        step === 'post' && 'rounded-r-none'
      )}
    >
      <div className='relative h-full'>
        <MainPreview editPostId={editPostId} />
      </div>

      {step !== 'post' && (
        <div className='absolute z-[999] bottom-5 left-4 right-4 flex-between'>
          <AspectRatioSelector
            selectedRatio={selectedRatio}
            onChange={handleAspectRatioChange}
            isVideoOnly={isVideoOnly}
          />

          <Gallery
            mediaFiles={mediaFiles}
            setMediaFiles={setMediaFiles}
            getRootProps={getRootProps}
            getInputProps={getInputProps}
            isDragActive={isDragActive}
            onRemove={handleRemoveMedia}
            isMixedMedia={isMixedMedia}
          />
        </div>
      )}
    </div>
  );
};

export default PreviewStep;
