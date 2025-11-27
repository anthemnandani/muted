import { Icons } from '@/components/icons';
import type { PostMedia } from '@/lib/types';
import { getImageDimensions, getVideoDimensions } from '@/lib/utils';
import useFileStore from '@/store/fileStore';
import usePostDialog from '@/store/postDialog';
import { api } from '@/trpc/react';
import type { IGif } from '@giphy/js-types';
import { PostStatus } from '@prisma/client';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { useBunnyUpload } from './useBunnyUpload';

const useCreatePost = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { mediaFiles, setMediaFiles, setThreadMedia } = useFileStore();
  const { uploadToStorage, uploadToStream } = useBunnyUpload();
  const abortControllerRef = useRef<AbortController | null>(null);
  const { editPostId, resetPostState, setOpenDialog, postData, validMentions } =
    usePostDialog();

  const trpcUtils = api.useUtils();

  const cleanupAndClose = () => {
    setTimeout(() => {
      setOpenDialog(false);
      setMediaFiles([]);
      setThreadMedia(null);
      resetPostState();
      setIsUploading(false);
      setUploadProgress(0);
      abortControllerRef.current = null;
    }, 300);
  };

  const { mutateAsync: createPost, isPending: isCreating } =
    api.post.createPost.useMutation({
      onSuccess: () => {
        setUploadProgress(100);
        cleanupAndClose();
      },
      onError: () => {
        setIsUploading(false);
      },
      onSettled: async () => {
        await trpcUtils.post.getInfinitePosts.invalidate();
      },
    });

  const { mutateAsync: editPost, isPending: isEditing } =
    api.post.editPost.useMutation({
      onMutate: () => {
        cleanupAndClose();
      },
      onSettled: async () => {
        await trpcUtils.post.getInfinitePosts.invalidate();
      },
    });

  const cancelUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    cleanupAndClose();
    setOpenDialog(false);
    toast.info('Post creation cancelled');
  };

  const handleEditPost = () => {
    if (!editPostId) return;

    const promise = editPost({
      id: editPostId,
      text: postData.caption,
      hideLikes: postData.hideLikes,
      turnOffComments: postData.turnOffComments,
      mentions: validMentions.map((m) => ({
        username: m.username,
        index: m.startIndex,
      })),
    });

    toast.promise(promise, {
      loading: (
        <div className='flex gap-2'>
          <Icons.loading className='size-5' /> Editing...
        </div>
      ),
      success: 'Post updated!',
      error: 'Error editing post',
    });
  };

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

  const handleCreatePost = async () => {
    if (mediaFiles.length === 0) return;

    try {
      setIsUploading(true);
      setUploadProgress(0);

      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      const processedMedia = [];
      const totalFiles = mediaFiles.length;
      let completedFiles = 0;

      for (const fileObj of mediaFiles) {
        if (signal.aborted) throw new Error('Upload cancelled by user');

        const file = fileObj.file;

        const updateCombinedProgress = (filePercent: number) => {
          const rawTotalPercent =
            (completedFiles * 100 + filePercent) / totalFiles;

          const scaledPercent = Math.round(rawTotalPercent * 0.9);

          setUploadProgress(scaledPercent);
        };

        if (file.type.startsWith('video/')) {
          const dimensions = await getVideoDimensions(file);
          const result = await uploadToStream(file, {
            onProgress: updateCombinedProgress,
            signal: signal,
          });

          processedMedia.push({
            fileType: 'video',
            fileUrl: result.fileUrl,
            thumbnailUrl: result.thumbnailUrl,
            videoId: result.videoId,
            aspectRatio: fileObj.aspectRatio,
            originalDimensions: dimensions,
            encodingStatus: 'processing',
          });
        } else {
          const dimensions = await getImageDimensions(file);
          const url = await uploadToStorage(file);
          updateCombinedProgress(100);
          processedMedia.push({
            fileType: 'image',
            fileUrl: url,
            aspectRatio: fileObj.aspectRatio,
            originalDimensions: dimensions,
          });
        }
        completedFiles++;
      }

      setUploadProgress(92);

      if (signal.aborted) throw new Error('Upload cancelled by user');

      await createPost({
        text: postData.caption,
        media: processedMedia as PostMedia[],
        hideLikes: postData.hideLikes,
        turnOffComments: postData.turnOffComments,
        privacy: postData.privacy,
        mentions: validMentions.map((m) => ({
          mentionedUserId: m.mentionedUserId,
          index: m.startIndex,
        })),
        status: processedMedia.some((media) => media.fileType === 'video')
          ? PostStatus.HIDDEN
          : PostStatus.VISIBLE,
      });
    } catch (error: any) {
      if (error.message !== 'Upload cancelled by user') {
        setIsUploading(false);
        toast.error('Upload failed. Please try again.');
      }
    }
  };

  return {
    handleCreatePost,
    handleEditPost,
    cancelUpload,
    isCreating,
    isEditing,
    isUploading,
    uploadProgress,
  };
};

export default useCreatePost;
