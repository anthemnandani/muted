import { MediaFile } from '@/lib/types';
import { getVideoDimensions } from '@/lib/utils';
import useFileStore from '@/store/fileStore';
import { useThreadStore } from '@/store/threadStore';
import { api } from '@/trpc/react';
import type { IGif } from '@giphy/js-types';
import { createId } from '@paralleldrive/cuid2';
import { EncodingStatus, FileType, PostStatus } from '@prisma/client';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { useMuxUpload } from './useMuxUpload';

const useCreateThread = () => {
  const {
    text,
    privacy,
    linkPreview,
    quoteInfo,
    validMentions,
    reset,
    setOpenDialog,
  } = useThreadStore();
  const { threadMedia, setThreadMedia } = useFileStore();
  const { uploadToStorage, prepareMuxUpload, startMuxUpload } = useMuxUpload();

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const abortControllerRef = useRef<AbortController | null>(null);
  const createdThreadIdRef = useRef<string | null>(null);

  const { mutateAsync: createThread, isPending: isCreatingDB } =
    api.thread.createThread.useMutation();

  const { mutate: deleteThread } = api.thread.deleteThread.useMutation();

  const isGiphy = (media: any): media is IGif =>
    media && 'images' in media && 'original' in media.images;

  const isMediaFile = (media: any): media is MediaFile =>
    media && 'file' in media && media.file instanceof File;

  const resetState = () => {
    setOpenDialog(false);

    setTimeout(() => {
      setThreadMedia(null);
      setIsUploading(false);
      setUploadProgress(0);
      createdThreadIdRef.current = null;
      reset();
    }, 300);
  };

  const cancelUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    if (createdThreadIdRef.current) {
      deleteThread({ id: createdThreadIdRef.current });
    }

    resetState();
    toast.info('Thread creation cancelled');
  };

  const handleMutation = async () => {
    try {
      abortControllerRef.current = new AbortController();
      setIsUploading(true);
      setUploadProgress(0);

      const generatedId = createId();

      let fileType: FileType = FileType.IMAGE;
      let fileToUpload: File | null = null;

      if (threadMedia) {
        if (isGiphy(threadMedia)) {
          fileType = FileType.GIF;
          const res = await fetch(threadMedia.images.original.url);
          const blob = await res.blob();
          fileToUpload = new File([blob], `${threadMedia.id}.gif`, {
            type: 'image/gif',
          });
        } else if (isMediaFile(threadMedia)) {
          fileToUpload = threadMedia.file;
          fileType = fileToUpload.type.startsWith('video')
            ? FileType.VIDEO
            : FileType.IMAGE;
        }
      }

      if (fileType === FileType.VIDEO && fileToUpload) {
        const passthrough = `thread|${generatedId}`;
        const { url, uploadId } = await prepareMuxUpload(passthrough);
        const finalDimensions = await getVideoDimensions(fileToUpload);

        await createThread({
          id: generatedId,
          text: text.trim(),
          privacy,
          status: PostStatus.HIDDEN,
          quoteId: quoteInfo?.id,
          linkPreview: linkPreview ?? undefined,
          mentions: validMentions.map((m) => ({
            mentionedUserId: m.mentionedUserId,
            index: m.startIndex,
          })),
          media: {
            fileType: FileType.VIDEO,
            encodingStatus: EncodingStatus.PROCESSING,
            videoId: uploadId,
            aspectRatio: (threadMedia as MediaFile)?.aspectRatio,
            originalDimensions: finalDimensions,
          },
        });

        createdThreadIdRef.current = generatedId;

        await startMuxUpload(fileToUpload, url, (pct) =>
          setUploadProgress(pct),
        );
      } else {
        let finalUrl = null;

        if (fileToUpload) {
          finalUrl = await uploadToStorage(fileToUpload);
          setUploadProgress(100);
        }

        await createThread({
          id: generatedId,
          text: text.trim(),
          privacy,
          status: PostStatus.VISIBLE,
          quoteId: quoteInfo?.id,
          linkPreview: linkPreview ?? undefined,
          mentions: validMentions.map((m) => ({
            mentionedUserId: m.mentionedUserId,
            index: m.startIndex,
          })),
          media: finalUrl
            ? {
                fileType,
                fileUrl: finalUrl,
              }
            : null,
        });
      }
      toast.success('Thread posted!');

      resetState();
    } catch (error) {
      toast.error('Failed to create thread');

      if (createdThreadIdRef.current) {
        deleteThread({ id: createdThreadIdRef.current });
      }
    } finally {
      setIsUploading(false);
    }
  };

  return {
    handleMutation,
    cancelUpload,
    isCreating: isCreatingDB || isUploading,
    isUploading,
    uploadProgress,
  };
};

export default useCreateThread;
