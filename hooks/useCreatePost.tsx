import { Icons } from '@/components/icons';
import { type PostMedia } from '@/lib/types';
import { getImageDimensions, getVideoDimensions } from '@/lib/utils';
import useFileStore from '@/store/fileStore';
import usePostDialog from '@/store/postDialog';
import { api } from '@/trpc/react';
import type { IGif } from '@giphy/js-types';
import { Check } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useBunnyUpload } from './useBunnyUpload';

const useCreatePost = () => {
  const { mediaFiles, threadMedia, setMediaFiles, setThreadMedia } =
    useFileStore();
  const { uploadToStorage, uploadToStream } = useBunnyUpload();
  const {
    quoteInfo,
    editPostId,
    resetPostState,
    setPostData,
    setOpenDialog,
    postData,
    validMentions,
  } = usePostDialog();

  const trpcUtils = api.useUtils();

  const { isPending: isCreating, mutateAsync: createPost } =
    api.post.createPost.useMutation({
      onMutate: () => {
        setTimeout(() => {
          setMediaFiles([]);
          setThreadMedia(null);
          resetPostState();
        }, 150);
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

  const { isPending: isEditing, mutateAsync: editPost } =
    api.post.editPost.useMutation({
      onMutate: () => {
        setTimeout(() => {
          setMediaFiles([]);
          resetPostState();
        }, 150);
      },
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

  const handleGiphyGifUpload = async (gif: IGif): Promise<PostMedia> => {
    try {
      const response = await fetch(gif.images.original.url);
      const blob = await response.blob();
      const gifFile = new File([blob], `${gif.id}.gif`, {
        type: 'image/gif',
      });

      const fileUrl = await uploadToStorage(gifFile);

      const dimensions = {
        width: gif.images.original.width,
        height: gif.images.original.height,
      };

      return {
        fileType: 'gif',
        fileUrl,
        originalDimensions: dimensions,
      };
    } catch (error) {
      console.error('Error processing Giphy GIF:', error);
      throw new Error('Failed to process Giphy GIF');
    }
  };

  const handleMediaUpload = async () => {
    try {
      const allMediaItems: PostMedia[] = [];
      if (mediaFiles.length > 0) {
        const mediaItems = await Promise.all(
          mediaFiles.map(async (mediaFile) => {
            const file = mediaFile.file;

            if (file.type.startsWith('video/')) {
              const dimensions = await getVideoDimensions(file);
              const { fileUrl, thumbnailUrl, videoId } = await uploadToStream(
                file
              );

              return {
                fileType: 'video' as const,
                fileUrl,
                thumbnailUrl,
                aspectRatio: mediaFile.aspectRatio,
                originalDimensions: dimensions,
                videoId,
                encodingStatus: 'processing' as const,
              };
            } else {
              const dimensions = await getImageDimensions(file);
              const fileUrl = await uploadToStorage(file);

              return {
                fileType: file.type === 'image/gif' ? 'gif' : 'image',
                fileUrl,
                aspectRatio: mediaFile.aspectRatio,
                originalDimensions: dimensions,
              };
            }
          })
        );

        allMediaItems.push(...mediaItems);
      }

      return {
        success: true,
        mediaItems: allMediaItems,
      };
    } catch (error) {
      toast.error('Error processing media files');
      return { success: false, error };
    }
  };

  const handleMutation = async () => {
    const { caption, hideLikes, turnOffComments, privacy } = postData;

    if (editPostId) {
      return editPost({
        id: editPostId,
        text: caption?.trim(),
        hideLikes,
        turnOffComments,
        mentions: validMentions.map((m) => ({
          username: m.username,
          index: m.startIndex,
        })),
      });
    } else {
      const mediaUploadResult = await handleMediaUpload();

      if (!mediaUploadResult.success) {
        return Promise.reject(new Error('Media upload failed'));
      }

      return createPost({
        text: caption?.trim(),
        media: mediaUploadResult.mediaItems,
        mentions: validMentions.map((m) => ({
          mentionedUserId: m.mentionedUserId,
          index: m.startIndex,
        })),
        privacy,
        quoteId: quoteInfo?.id,
        postAuthor: quoteInfo?.author.id,
        hideLikes,
        turnOffComments,
      });
    }
  };

  const handleSubmit = (isEdit = false) => {
    setOpenDialog(false);
    const promise = handleMutation();

    toast.promise(promise, {
      loading: (
        <div className='flex w-[270px] items-center justify-start gap-1.5 p-0'>
          <div>
            <Icons.loading className='size-8' />
          </div>
          {isEdit ? 'Editing...' : 'Posting...'}
        </div>
      ),
      success: (data) => {
        return (
          <div className='flex-between w-[270px] p-0 '>
            <div className='flex-center gap-1.5'>
              <Check className='size-5' />
              {data?.isEdited ? 'Edited' : 'Posted'}
            </div>
            <Link
              href={`/${data?.post.author.username}/post/${data?.post.id}`}
              className='hover:text-blue-900'
            >
              View
            </Link>
          </div>
        );
      },
      error: 'Error',
      richColors: true,
    });
  };

  return {
    postData,
    setPostData,
    isLoading: isCreating,
    handleSubmit,
    isEditing,
  };
};

export default useCreatePost;
