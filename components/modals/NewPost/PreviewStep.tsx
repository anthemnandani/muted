'use client';

import { Button } from '@/components/ui/button';
import type { PreviewStepProps } from '@/lib/types';
import useFileStore from '@/store/fileStore';
import usePostDialog from '@/store/postDialog';
import { Plus } from 'lucide-react';
import Gallery from './Gallery';
import MainPreview from './MainPreview';

const PreviewStep = ({
  getRootProps,
  getInputProps,
  isDragActive,
}: PreviewStepProps) => {
  const { mediaFiles, setMediaFiles } = useFileStore();
  const {
    setStep,
    currentMediaIndex,
    setCurrentMediaIndex,
    showGallery,
    setShowGallery,
  } = usePostDialog();

  const handleRemoveMedia = (id: string) => {
    const newFiles = mediaFiles.filter((file) => file.id !== id);
    if (newFiles.length === 0) {
      setStep('upload');
    } else if (currentMediaIndex >= newFiles.length) {
      setCurrentMediaIndex(Math.max(0, newFiles.length - 1));
    }
    setMediaFiles(newFiles);
  };

  return (
    <div className='relative aspect-square bg-black rounded-2xl'>
      <div className='relative h-full overflow-hidden'>
        <MainPreview mediaFiles={mediaFiles} />

        <Button
          variant='ghost'
          size='icon'
          className='absolute bottom-4 right-4 rounded-full bg-zinc-800 hover:bg-zinc-800/75'
          onClick={() => setShowGallery(!showGallery)}
        >
          <Plus className='size-5' />
        </Button>

        {showGallery && (
          <Gallery
            mediaFiles={mediaFiles}
            setMediaFiles={setMediaFiles}
            getRootProps={getRootProps}
            getInputProps={getInputProps}
            isDragActive={isDragActive}
            onRemove={handleRemoveMedia}
          />
        )}
      </div>
    </div>
  );
};

export default PreviewStep;
