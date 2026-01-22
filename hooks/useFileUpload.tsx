'use client';

import { UPLOAD_CONSTRAINTS } from '@/lib/constants';
import { calculateTotalVideoDuration, getMediaType } from '@/lib/utils';
import useFileStore from '@/store/fileStore';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

interface FileUploadError {
  title: string;
  message: string;
}

const useFileUpload = ({ onSuccess }: { onSuccess?: () => void }) => {
  const { mediaFiles, setMediaFiles, threadMedia, setThreadMedia } =
    useFileStore();
  const [error, setError] = useState<FileUploadError | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [progress, setProgress] = useState(0);

  const validateFiles = useCallback(
    async (files: File[]) => {
      const totalSteps = 3;
      let currentStep = 0;

      setProgress((++currentStep / totalSteps) * 100);

      const totalFiles = files.length + mediaFiles.length;
      if (totalFiles > UPLOAD_CONSTRAINTS.MAX_ITEMS) {
        throw new Error(
          `You can upload up to ${UPLOAD_CONSTRAINTS.MAX_ITEMS} photos and videos.`,
        );
      }

      setProgress((++currentStep / totalSteps) * 100);
      const oversizedImages = files
        .filter((file) => getMediaType(file) === 'image')
        .filter((file) => file.size > UPLOAD_CONSTRAINTS.MAX_IMAGE_SIZE);

      if (oversizedImages.length > 0) {
        throw new Error(
          `One or more photos were too large to be uploaded. Each photo must be less than 10MB.`,
        );
      }

      setProgress((++currentStep / totalSteps) * 100);

      const existingVideos = mediaFiles
        .filter((media) => getMediaType(media.file) === 'video')
        .map((media) => media.file);

      const existingDuration =
        await calculateTotalVideoDuration(existingVideos);
      const newDuration = await calculateTotalVideoDuration(files);
      const totalDuration = existingDuration + newDuration;

      if (totalDuration > UPLOAD_CONSTRAINTS.MAX_VIDEO_DURATION) {
        const minutes = Math.floor(UPLOAD_CONSTRAINTS.MAX_VIDEO_DURATION / 60);
        throw new Error(
          `One or more videos were too long to be uploaded. Videos must be less than ${minutes} minutes long in total.`,
        );
      }
    },
    [mediaFiles],
  );

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!acceptedFiles.length) return;

      setIsValidating(true);
      setProgress(0);
      setError(null);

      try {
        await validateFiles(acceptedFiles);

        const newFiles = acceptedFiles.map((file) => ({
          file,
          preview: URL.createObjectURL(file),
          id: crypto.randomUUID(),
          type: getMediaType(file) as 'image' | 'video',
        }));

        const updatedFiles = [...mediaFiles, ...newFiles].slice(
          0,
          UPLOAD_CONSTRAINTS.MAX_ITEMS,
        );
        setMediaFiles(updatedFiles);
        onSuccess?.();
      } catch (err) {
        setError({
          title: "Media couldn't be uploaded",
          message: err instanceof Error ? err.message : 'An error occurred',
        });
      } finally {
        setIsValidating(false);
        setProgress(0);
      }
    },
    [validateFiles, onSuccess, mediaFiles, setMediaFiles, setThreadMedia],
  );

  const acceptedFileTypes = {
    ...UPLOAD_CONSTRAINTS.ACCEPTED_IMAGE_TYPES,
    ...UPLOAD_CONSTRAINTS.ACCEPTED_VIDEO_TYPES,
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes,
    multiple: true,
    maxFiles: UPLOAD_CONSTRAINTS.MAX_ITEMS,
  });

  const cleanup = useCallback(() => {
    mediaFiles.forEach((media) => {
      URL.revokeObjectURL(media.preview);
    });
    if (!threadMedia) return;
    if ('preview' in threadMedia) {
      URL.revokeObjectURL(threadMedia.preview);
    } else if ('images' in threadMedia) {
      URL.revokeObjectURL(threadMedia.images.original.url);
    }
  }, [mediaFiles, threadMedia]);

  return {
    onDrop,
    error,
    setError,
    isValidating,
    progress,
    getRootProps,
    getInputProps,
    isDragActive,
    cleanup,
  };
};

export default useFileUpload;
