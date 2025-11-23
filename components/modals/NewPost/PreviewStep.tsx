'use client';

import { type AspectRatio, PreviewStepProps } from '@/lib/types';
import { cn } from '@/lib/utils';
import useFileStore from '@/store/fileStore';
import usePostDialog from '@/store/postDialog';
import AspectRatioSelector from './AspectRatioSelector';
import Gallery from './Gallery';
import MainPreview from './MainPreview';

const PreviewStep = ({
  getRootProps,
  getInputProps,
  isDragActive,
}: PreviewStepProps) => {
  const { mediaFiles, setMediaFiles, updateMediaFile } = useFileStore();
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

  const handleAspectRatioChange = (ratio: AspectRatio) => {
    updateMediaFile(currentFile.id, { aspectRatio: ratio });
  };

  return (
    <div
      className={cn(
        'relative w-full bg-[#121212] overflow-hidden rounded-lg',
        step === 'post' && 'rounded-r-none'
      )}
    >
      <div className='relative h-full'>
        <MainPreview mediaFiles={mediaFiles} editPostId={editPostId} />
      </div>

      {step !== 'post' && (
        <div className='absolute bottom-5 left-4 right-4 flex-between'>
          <AspectRatioSelector
            selectedRatio={selectedRatio}
            onChange={handleAspectRatioChange}
          />

          <Gallery
            mediaFiles={mediaFiles}
            setMediaFiles={setMediaFiles}
            getRootProps={getRootProps}
            getInputProps={getInputProps}
            isDragActive={isDragActive}
            onRemove={handleRemoveMedia}
          />
        </div>
      )}
    </div>
  );
};

export default PreviewStep;
