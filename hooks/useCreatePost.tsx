import type { PostData, PostMedia } from '@/lib/types';
import {
  getImageDimensions,
  getMediaAspectRatio,
  getVideoDimensions,
} from '@/lib/utils';
import useFileStore from '@/store/fileStore';
import usePost from '@/store/post';
import usePostDialog from '@/store/postDialog';
import { api } from '@/trpc/react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useBunnyUpload } from './useBunnyUpload';

const useCreatePost = (
  setMentions?: (mentions: Array<{ userId: string; index: number }>) => void
) => {
  const { postPrivacy } = usePost();
  const { mediaFiles, setMediaFiles } = useFileStore();
  const { uploadToStorage, uploadToStream } = useBunnyUpload();
  const { quoteInfo, editPostInfo, resetPostState } = usePostDialog();

  const [postData, setPostData] = useState<PostData>({
    privacy: postPrivacy,
    text: '',
    linkPreview: null,
  });

  const trpcUtils = api.useUtils();

  useEffect(() => {
    setPostData((prev) => ({
      ...prev,
      privacy: postPrivacy,
    }));
  }, [postPrivacy]);

  useEffect(() => {
    if (editPostInfo) {
      setPostData((prev) => ({
        ...prev,
        text: editPostInfo.text,
      }));
    }
  }, [editPostInfo]);

  const { isLoading, mutateAsync: createPost } =
    api.post.createPost.useMutation({
      onMutate: () => {
        resetPostState();
        setMediaFiles([]);
        setMentions?.([]);
      },
      onError: () => {
        toast.error('PostingError: Something went wrong!');
      },
      onSettled: async () => {
        await trpcUtils.post.getInfinitePosts.invalidate();
        await trpcUtils.user.postInfo.invalidate();
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

  const handleMediaUpload = async () => {
    try {
      const mediaItems: PostMedia[] = await Promise.all(
        mediaFiles.map(async (mediaFile) => {
          // Handle GIFs from Giphy
          // if (
          //   typeof mediaFile.file === 'object' &&
          //   'images' in mediaFile.file
          // ) {
          //   const gif = mediaFile.file as IGif;
          //   const response = await fetch(gif.images.original.url);
          //   const blob = await response.blob();
          //   const gifFile = new File([blob], `${gif.id}.gif`, {
          //     type: 'image/gif',
          //   });

          //   const { url: fileUrl } = await uploadToStorage(gifFile);
          //   return {
          //     fileType: 'gif' as MediaType,
          //     fileUrl,
          //   };
          // }

          const file = mediaFile.file;

          // Handle Videos
          if (file.type.startsWith('video/')) {
            const dimensions = await getVideoDimensions(file);
            const aspectRatio = getMediaAspectRatio(dimensions);
            const { fileUrl, thumbnailUrl } = await uploadToStream(file);

            return {
              fileType: 'video',
              fileUrl,
              thumbnailUrl,
              aspectRatio,
              originalDimensions: dimensions,
            };
          } else {
            const dimensions = await getImageDimensions(file);
            const aspectRatio = getMediaAspectRatio(dimensions);
            const fileUrl = await uploadToStorage(file);

            return {
              fileType: 'image',
              fileUrl,
              aspectRatio,
              originalDimensions: dimensions,
            };
          }
        })
      );

      return {
        success: true,
        mediaItems,
      };
    } catch (error) {
      toast.error('Error processing media files');
      return { success: false, error };
    }
  };

  const handleMutation = async (
    mentions: Array<{
      userId: string;
      index: number;
    }>
  ) => {
    const mediaUploadResult = await handleMediaUpload();

    if (!mediaUploadResult.success) {
      return Promise.reject(new Error('Media upload failed'));
    }

    const promise = editPostInfo
      ? editPost({
          id: editPostInfo.id,
          text: postData.text.trim(),
          mentions,
        })
      : createPost({
          text: postData.text.trim(),
          media: mediaUploadResult.mediaItems,
          privacy: postData.privacy,
          quoteId: quoteInfo?.id,
          postAuthor: quoteInfo?.author.id,
          linkPreview: postData.linkPreview ?? undefined,
          mentions,
        });

    return promise as any;
  };

  return {
    postData,
    setPostData,
    isLoading,
    handleMutation,
    isEditing,
  };
};

export default useCreatePost;
