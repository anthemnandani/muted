import { MediaFile, UploadResult } from '@/lib/types';
import useFileStore from '@/store/fileStore';
import { useThreadStore } from '@/store/threadStore';
import { api } from '@/trpc/react';
import type { IGif } from '@giphy/js-types';
import { FileType } from '@prisma/client';
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
  const { uploadToStorage } = useMuxUpload();

  const trpcUtils = api.useUtils();

  //   useEffect(() => {
  //     if (editPostInfo) {
  //       setThreadData((prev) => ({
  //         ...prev,
  //         text: editPostInfo.text,
  //       }));
  //     }
  //   }, [editPostInfo]);

  const { mutateAsync: createThread, isPending: isCreating } =
    api.thread.createThread.useMutation({
      onMutate: () => {
        setTimeout(() => {
          setThreadMedia(null);
          reset();
        }, 300);
      },
      onError: () => {
        toast.error('PostingError: Something went wrong!');
      },
      onSettled: async () => {
        await trpcUtils.thread.getAllThreads.invalidate();
      },
      retry: false,
    });

  //   const { isLoading: isEditing, mutateAsync: editPost } =
  //     api.post.editPost.useMutation({
  //       onError: (err) => {
  //         if (err.message === 'Edit window has expired') {
  //           toast.error('Edit time window has expired');
  //         } else {
  //           toast.error('Error editing post');
  //         }
  //       },
  //       onSettled: async () => {
  //         await trpcUtils.invalidate();
  //       },
  //     });

  //   const { isLoading: isReplying, mutateAsync: replyToPost } =
  //     api.post.replyToPost.useMutation({
  //       onError: (err) => {
  //         toast.error('ReplyingError: Something went wrong!');
  //         if (err.data?.code === 'UNAUTHORIZED') {
  //           router.push('/sign-in');
  //         }
  //       },
  //       onSettled: async () => {
  //         await trpcUtils.post.getInfinitePosts.invalidate();
  //         await trpcUtils.invalidate();
  //       },
  //       retry: false,
  //     });

  const isGiphy = (media: any): media is IGif => {
    return media && 'images' in media && 'original' in media.images;
  };

  const isMediaFile = (media: any): media is MediaFile => {
    return media && 'file' in media && media.file instanceof File;
  };

  const handleMediaUpload = async (): Promise<UploadResult> => {
    if (!threadMedia) return null;

    try {
      let fileToUpload: File | null = null;
      let type: FileType = FileType.IMAGE;

      if (isGiphy(threadMedia)) {
        const response = await fetch(threadMedia.images.original.url);
        const blob = await response.blob();
        fileToUpload = new File([blob], `${threadMedia.id}.gif`, {
          type: 'image/gif',
        });
        type = FileType.GIF;
      } else if (isMediaFile(threadMedia)) {
        fileToUpload = threadMedia.file;
        type = FileType.IMAGE;
      }

      if (!fileToUpload) return null;

      const url = await uploadToStorage(fileToUpload);
      if (!url) throw new Error('Upload failed to return a URL');

      return { fileUrl: url, fileType: type };
    } catch (error) {
      toast.error('Failed to upload media. Please try again.');
      throw error;
    }
  };

  const handleMutation = async () => {
    setOpenDialog(false);

    try {
      const mediaResult = await handleMediaUpload();

      const promise = createThread({
        text: text.trim(),
        media: mediaResult?.fileUrl
          ? {
              fileType: mediaResult.fileType,
              fileUrl: mediaResult.fileUrl,
            }
          : undefined,
        privacy,
        quoteId: quoteInfo?.id,
        linkPreview: linkPreview ?? undefined,
        mentions: validMentions.map((m) => ({
          mentionedUserId: m.mentionedUserId,
          index: m.startIndex,
        })),
      });

      return promise as any;
    } catch (error) {
      throw error;
    }
  };

  return {
    handleMutation,
    isCreating,
  };
};

export default useCreateThread;
