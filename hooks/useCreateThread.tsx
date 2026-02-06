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
import { useRouter } from 'next/navigation';

const useCreateThread = ({ rootThreadId }: { rootThreadId?: string }) => {
  const {
    text,
    privacy,
    linkPreview,
    quoteInfo,
    validMentions,
    reset,
    replyThreadInfo,
    editThreadInfo,
  } = useThreadStore();
  const { threadMedia, setThreadMedia } = useFileStore();
  const { uploadToStorage, prepareMuxUpload, startMuxUpload } = useMuxUpload();

  const router = useRouter();

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const abortControllerRef = useRef<AbortController | null>(null);
  const createdThreadIdRef = useRef<string | null>(null);

  const utils = api.useUtils();

  const resetState = () => {
    reset();
    setTimeout(() => {
      setThreadMedia(null);
      setIsUploading(false);
      setUploadProgress(0);
      createdThreadIdRef.current = null;
    }, 300);
  };

  const { mutateAsync: createThread, isPending: isCreatingDB } =
    api.thread.createThread.useMutation({
      onSuccess: () => {
        toast.success('Thread posted!');
        resetState();
      },

      onSettled: () => {
        utils.thread.invalidate();
      },
    });

  const { mutateAsync: editThread, isPending: isEditing } =
    api.thread.editThread.useMutation({
      onSuccess: () => {
        toast.success('Thread updated!');
        reset();
      },
      onError: () => {
        toast.error('Failed to update thread');
      },
      onSettled: () => {
        utils.thread.invalidate();
      },
    });

  const { mutateAsync: commentToThread, isPending: isCommenting } =
    api.thread.commentToThread.useMutation({
      onSuccess: () => {
        toast.success('Commented!');
        reset();
      },

      onSettled: () => {
        utils.thread.invalidate();
      },
    });

  const { mutateAsync: addReply, isPending: isReplying } =
    api.thread.replyToComment.useMutation({
      onError: (err) => {
        if (err.data?.code === 'UNAUTHORIZED') {
          return router.push('/sign-in');
        }
        if (err.data?.code === 'FORBIDDEN') {
          return toast.error('You are not allowed to reply to this comment');
        }
        toast.error('ReplyingError: Something went wrong!');
      },
      onSettled: () => {
        utils.thread.invalidate();
      },
      retry: false,
    });

  const { mutate: deleteThread } = api.thread.deleteThread.useMutation();

  const isGiphy = (media: any): media is IGif =>
    media && 'images' in media && 'original' in media.images;

  const isMediaFile = (media: any): media is MediaFile =>
    media && 'file' in media && media.file instanceof File;

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

  const handleEdit = async () => {
    try {
      await editThread({
        id: editThreadInfo!.id,
        text: text.trim(),
        privacy,
        linkPreview: linkPreview ?? null,
        mentions: validMentions.map((m) => ({
          mentionedUserId: m.mentionedUserId,
          index: m.startIndex,
        })),
      });
    } catch (error) {
      toast.error('Failed to update thread');
    }
  };

  const handleComment = async () => {
    try {
      await commentToThread({
        id: replyThreadInfo!.id,
        threadAuthor: replyThreadInfo!.author.id,
        text: text.trim(),
        privacy,
        mentions: validMentions.map((m) => ({
          mentionedUserId: m.mentionedUserId,
          index: m.startIndex,
        })),
      });
    } catch (error) {
      toast.error('Failed to reply');
    }
  };

  const handleReply = async () => {
    await addReply({
      parentCommentId: replyThreadInfo!.id,
      originalThreadId: rootThreadId!,
      text: text.trim(),
      privacy,
      mentions: validMentions.map((m) => ({
        mentionedUserId: m.mentionedUserId,
        index: m.startIndex,
      })),
    });
  };

  const handleCreate = async () => {
    try {
      setIsUploading(true);

      abortControllerRef.current = new AbortController();
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
          linkPreview: linkPreview ?? null,
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
          linkPreview: linkPreview ?? null,
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
    } catch (error) {
      toast.error('Failed to create thread');

      if (createdThreadIdRef.current) {
        deleteThread({ id: createdThreadIdRef.current });
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = () => {
    if (replyThreadInfo && replyThreadInfo.isComment) {
      handleComment();
    } else if (replyThreadInfo) {
      handleReply();
    } else if (editThreadInfo) {
      handleEdit();
    } else {
      handleCreate();
    }
  };

  const isCreating = isCreatingDB || isUploading;

  return {
    handleSubmit,
    cancelUpload,
    isCreating,
    isDisabled:
      text === '' || isCreating || isEditing || isCommenting || isReplying,
    isEditing,
    isCommenting,
    isReplying,
    isUploading,
    uploadProgress,
  };
};

export default useCreateThread;
