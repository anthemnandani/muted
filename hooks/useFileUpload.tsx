'use client';

import { UPLOAD_CONSTRAINTS } from '@/lib/constants';
import { calculateTotalVideoDuration, getMediaType } from '@/lib/utils';
import useFileStore from '@/store/fileStore';
import React from 'react';
import { useDropzone } from 'react-dropzone';

interface FileUploadError {
  title: string;
  message: string;
}

interface UseFileUploadProps {
  onSuccess?: () => void;
}

export function useFileUpload({ onSuccess }: UseFileUploadProps = {}) {
  const { mediaFiles, setMediaFiles } = useFileStore();
  const [error, setError] = React.useState<FileUploadError | null>(null);
  const [isValidating, setIsValidating] = React.useState(false);
  const [progress, setProgress] = React.useState(0);

  const validateFiles = React.useCallback(
    async (files: File[]) => {
      const totalSteps = 3;
      let currentStep = 0;

      setProgress((++currentStep / totalSteps) * 100);
      const totalFiles = files.length + mediaFiles.length;
      if (totalFiles > UPLOAD_CONSTRAINTS.MAX_ITEMS) {
        throw new Error(
          `You can upload up to ${UPLOAD_CONSTRAINTS.MAX_ITEMS} photos and videos.`
        );
      }

      setProgress((++currentStep / totalSteps) * 100);
      const oversizedImages = files
        .filter((file) => getMediaType(file) === 'image')
        .filter((file) => file.size > UPLOAD_CONSTRAINTS.MAX_IMAGE_SIZE);

      if (oversizedImages.length > 0) {
        throw new Error(
          `One or more photos were too large to be uploaded. Each photo must be less than 10MB.`
        );
      }

      setProgress((++currentStep / totalSteps) * 100);
      const existingVideos = mediaFiles
        .filter((media) => getMediaType(media.file) === 'video')
        .map((media) => media.file);

      const existingDuration = await calculateTotalVideoDuration(
        existingVideos
      );
      const newDuration = await calculateTotalVideoDuration(files);
      const totalDuration = existingDuration + newDuration;

      if (totalDuration > UPLOAD_CONSTRAINTS.MAX_VIDEO_DURATION) {
        const minutes = Math.floor(UPLOAD_CONSTRAINTS.MAX_VIDEO_DURATION / 60);
        throw new Error(
          `One or more videos were too long to be uploaded. Videos must be less than ${minutes} minutes long in total.`
        );
      }
    },
    [mediaFiles]
  );

  const onDrop = React.useCallback(
    async (acceptedFiles: File[]) => {
      setIsValidating(true);
      setProgress(0);
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
          UPLOAD_CONSTRAINTS.MAX_ITEMS
        );

        setMediaFiles(updatedFiles);

        if (updatedFiles.length > 0) {
          onSuccess?.();
        }

        setError(null);
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
    [validateFiles, onSuccess]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      ...UPLOAD_CONSTRAINTS.ACCEPTED_IMAGE_TYPES,
      ...UPLOAD_CONSTRAINTS.ACCEPTED_VIDEO_TYPES,
    },
    multiple: true,
    maxFiles: UPLOAD_CONSTRAINTS.MAX_ITEMS,
  });

  const cleanup = React.useCallback(() => {
    mediaFiles.forEach((file) => {
      try {
        URL.revokeObjectURL(file.preview);
      } catch (error) {
        console.error('Error revoking blob URL:', error);
      }
    });
  }, []);

  return {
    mediaFiles,
    setMediaFiles,
    error,
    setError,
    isValidating,
    progress,
    getRootProps,
    getInputProps,
    isDragActive,
    cleanup,
  };
}
