'use client';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { PreviewStepProps } from '@/lib/types';
import useFileStore from '@/store/fileStore';
import usePostDialog from '@/store/postDialog';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import AspectRatioSelector from './AspectRatioSelector';
import Gallery from './Gallery';
import MainPreview from './MainPreview';

const PreviewStep = ({
  getRootProps,
  getInputProps,
  isDragActive,
}: PreviewStepProps) => {
  const { mediaFiles, setMediaFiles, updateMediaFile } = useFileStore();
  const [showRatioSelector, setShowRatioSelector] = useState(false);
  const {
    setStep,
    currentMediaIndex,
    setCurrentMediaIndex,
    showGallery,
    setShowGallery,
  } = usePostDialog();

  const currentFile = mediaFiles[currentMediaIndex];

  const selectedRatio = currentFile?.aspectRatio || '1:1';

  const handleRemoveMedia = (id: string) => {
    const newFiles = mediaFiles.filter((file) => file.id !== id);
    if (newFiles.length === 0) {
      setStep('upload');
    } else if (currentMediaIndex >= newFiles.length) {
      setCurrentMediaIndex(Math.max(0, newFiles.length - 1));
    }
    setMediaFiles(newFiles);
  };

  const handleAspectRatioChange = (ratio: string) => {
    updateMediaFile(currentFile.id, { aspectRatio: ratio });
  };

  return (
    <div className='relative bg-[#121212] rounded-2xl overflow-hidden'>
      <div className='relative h-full'>
        <MainPreview mediaFiles={mediaFiles} />

        <div className='absolute bottom-5 left-4 right-4 flex-between'>
          <Button
            variant='ghost'
            size='icon'
            className='rounded-full opacity-100 bg-[#1A1A1ACC] hover:opacity-70 transition-all duration-200 size-8'
            onClick={() => setShowRatioSelector(!showRatioSelector)}
          >
            <Icons.crop className='size-4' />
          </Button>

          <Button
            variant='ghost'
            size='icon'
            className='rounded-full opacity-100 bg-[#1A1A1ACC] hover:opacity-70 transition-all duration-200 size-8'
            onClick={() => setShowGallery(!showGallery)}
            title='Add more media'
          >
            <Plus className='size-4' />
          </Button>
        </div>

        {showRatioSelector && (
          <AspectRatioSelector
            selectedRatio={selectedRatio}
            onChange={handleAspectRatioChange}
          />
        )}

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
