import type { MediaType, ThreadData } from '@/lib/types';
import { useUploadThing } from '@/lib/uploadthing';
import {
  getImageDimensions,
  getMediaAspectRatio,
  getVideoDimensions,
} from '@/lib/utils';
import useDialog from '@/store/dialog';
import useFileStore from '@/store/fileStore';
import { api } from '@/trpc/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import usePost from './usePost';

const useCreateThread = (
  setMentions: (mentions: Array<{ userId: string; index: number }>) => void
) => {
  const router = useRouter();
  const { postPrivacy } = usePost();
  const { selectedFile, setSelectedFile } = useFileStore();
  const { startUpload } = useUploadThing('media');
  const {
    replyPostInfo,
    setReplyPostInfo,
    quoteInfo,
    setQuoteInfo,
    editPostInfo,
    setEditPostInfo,
  } = useDialog();

  const [threadData, setThreadData] = useState<ThreadData>({
    privacy: postPrivacy,
    text: '',
    linkPreview: null,
  });

  const trpcUtils = api.useUtils();

  useEffect(() => {
    setThreadData((prev) => ({
      ...prev,
      privacy: postPrivacy,
    }));
  }, [postPrivacy]);

  useEffect(() => {
    if (editPostInfo) {
      setThreadData((prev) => ({
        ...prev,
        text: editPostInfo.text,
      }));
    }
  }, [editPostInfo]);

  const { isLoading, mutateAsync: createThread } =
    api.post.createPost.useMutation({
      onMutate: () => {
        setThreadData((prev) => ({
          ...prev,
          text: '',
        }));
        setMentions([]);
      },
      onError: () => {
        toast.error('PostingError: Something went wrong!');
      },
      onSettled: async () => {
        await trpcUtils.post.getInfinitePosts.invalidate();
      },
      retry: false,
    });

  const { isLoading: isEditing, mutateAsync: editPost } =
    api.post.editPost.useMutation({
      onError: (err) => {
        if (err.message === 'Edit window has expired') {
          toast.error('Edit time window has expired');
        } else {
          toast.error('Error editing post');
        }
      },
      onSettled: async () => {
        await trpcUtils.invalidate();
      },
    });

  const { isLoading: isReplying, mutateAsync: replyToPost } =
    api.post.replyToPost.useMutation({
      onError: (err) => {
        toast.error('ReplyingError: Something went wrong!');
        if (err.data?.code === 'UNAUTHORIZED') {
          router.push('/sign-in');
        }
      },
      onSettled: async () => {
        await trpcUtils.post.getInfinitePosts.invalidate();
        await trpcUtils.invalidate();
      },
      retry: false,
    });

  const handleMediaUpload = async () => {
    if (selectedFile.length === 0) return {};

    const file = selectedFile[0];
    try {
      if ('images' in file) {
        const response = await fetch(file.images.original.url);
        const blob = await response.blob();
        const gifFile = new File([blob], `${file.id}.gif`, {
          type: 'image/gif',
        });

        const fileRes = await startUpload([gifFile]);
        if (!fileRes?.[0]) return {};

        return {
          fileUrl: fileRes[0].fileUrl,
          fileType: 'gif',
        };
      }
      if (file instanceof File) {
        const dimensions = file.type.startsWith('image/')
          ? await getImageDimensions(file)
          : file.type.startsWith('video/')
          ? await getVideoDimensions(file)
          : null;

        let aspectRatio;
        let originalDimensions;

        if (dimensions) {
          aspectRatio = getMediaAspectRatio(dimensions);
          if (!aspectRatio) {
            originalDimensions = dimensions;
          }
        }

        const fileRes = await startUpload(selectedFile as File[]);
        if (!fileRes?.[0]) return {};

        return {
          fileUrl: fileRes[0].fileUrl,
          fileType: fileRes[0].fileKey.split('.').pop() || '',
          aspectRatio,
          originalDimensions,
        };
      }
      return {};
    } catch (error) {
      toast.error('Error processing media file');
      return {};
    }
  };

  const handleMutation = async (
    mentions: Array<{
      userId: string;
      index: number;
    }>
  ) => {
    const {
      fileUrl: mediaUploadUrl,
      fileType,
      aspectRatio,
      originalDimensions,
    } = await handleMediaUpload();

    const promise = replyPostInfo
      ? replyToPost({
          text: threadData.text.trim(),
          postId: replyPostInfo.id,
          media: mediaUploadUrl
            ? { fileType, fileUrl: mediaUploadUrl }
            : undefined,
          privacy: threadData.privacy,
          postAuthor: replyPostInfo.author.id,
        })
      : editPostInfo
      ? editPost({
          id: editPostInfo.id,
          text: threadData.text.trim(),
          mentions,
        })
      : createThread({
          text: threadData.text.trim(),
          media: mediaUploadUrl
            ? {
                fileType: fileType as MediaType,
                fileUrl: mediaUploadUrl,
                aspectRatio,
                originalDimensions,
              }
            : undefined,
          privacy: threadData.privacy,
          quoteId: quoteInfo?.id,
          postAuthor: quoteInfo?.author.id,
          linkPreview: threadData.linkPreview ?? undefined,
          mentions,
        });

    return promise as any;
  };

  const resetState = () => {
    setThreadData({
      privacy: postPrivacy,
      text: '',
      linkPreview: null,
    });
    setSelectedFile([]);
    setReplyPostInfo(null);
    setQuoteInfo(null);
    setMentions([]);
    setEditPostInfo(null);
  };

  return {
    threadData,
    setThreadData,
    isLoading,
    isReplying,
    handleMutation,
    isEditing,
    resetState,
  };
};

export default useCreateThread;
