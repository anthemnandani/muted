import { Icons } from '@/components/icons';
import type { PostMedia } from '@/lib/types';
import { getImageDimensions, getVideoDimensions } from '@/lib/utils';
import useFileStore from '@/store/fileStore';
import usePostDialog from '@/store/postDialog';
import { api } from '@/trpc/react';
import { createId } from '@paralleldrive/cuid2';
import { PostStatus } from '@prisma/client';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { useMuxUpload } from './useMuxUpload';

const useCreatePost = () => {
  const { mediaFiles, setMediaFiles, setThreadMedia } = useFileStore();
  const { uploadToStorage, prepareMuxUpload, startMuxUpload } = useMuxUpload();
  const abortControllerRef = useRef<AbortController | null>(null);
  const { editPostId, resetPostState, setOpenDialog, postData, validMentions } =
    usePostDialog();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const trpcUtils = api.useUtils();

  const closeAndReset = () => {
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
    api.post.createPost.useMutation();

  const { mutateAsync: editPost, isPending: isEditing } =
    api.post.editPost.useMutation({
      onMutate: () => {
        closeAndReset();
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
    closeAndReset();
    setOpenDialog(false);
    setIsUploading(false);
    setUploadProgress(0);
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

  // const handleGiphyGifUpload = async (gif: IGif): Promise<PostMedia> => {
  //   try {
  //     const response = await fetch(gif.images.original.url);
  //     const blob = await response.blob();
  //     const gifFile = new File([blob], `${gif.id}.gif`, {
  //       type: 'image/gif',
  //     });

  //     const fileUrl = await uploadToStorage(gifFile);

  //     const dimensions = {
  //       width: gif.images.original.width,
  //       height: gif.images.original.height,
  //     };

  //     return {
  //       fileType: 'gif',
  //       fileUrl,
  //       originalDimensions: dimensions,
  //     };
  //   } catch (error) {
  //     console.error('Error processing Giphy GIF:', error);
  //     throw new Error('Failed to process Giphy GIF');
  //   }
  // };

  const handleCreatePost = async () => {
    if (mediaFiles.length === 0) return;

    try {
      setIsUploading(true);
      setUploadProgress(0);

      const generatedPostId = createId();
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      const processedMedia: PostMedia[] = [];
      const uploadsQueue: Array<() => Promise<void>> = [];

      for (const fileObj of mediaFiles) {
        if (signal.aborted) throw new Error('Upload cancelled');
        const file = fileObj.file;

        if (file.type.startsWith('video/')) {
          const dimensions = await getVideoDimensions(file);

          const { url, uploadId } = await prepareMuxUpload(generatedPostId);

          const localBlobUrl = URL.createObjectURL(file);

          processedMedia.push({
            fileType: 'video',
            videoId: uploadId,
            playbackId: localBlobUrl,
            aspectRatio: fileObj.aspectRatio,
            originalDimensions: dimensions,
            encodingStatus: 'processing',
          });

          uploadsQueue.push(() =>
            startMuxUpload(file, url, (pct) => {
              const totalProgress = 20 + Math.floor(pct * 0.8);
              setUploadProgress(totalProgress);
            })
          );
        } else {
          const dimensions = await getImageDimensions(file);
          const url = await uploadToStorage(file);
          processedMedia.push({
            fileType: 'image',
            fileUrl: url,
            aspectRatio: fileObj.aspectRatio,
            originalDimensions: dimensions,
          });
        }
      }

      setUploadProgress(10);

      await createPost({
        id: generatedPostId,
        text: postData.caption,
        media: processedMedia,
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

      setUploadProgress(20);

      for (const uploadTask of uploadsQueue) {
        if (signal.aborted) throw new Error('Upload cancelled');
        await uploadTask();
      }

      setUploadProgress(100);
      toast.success('Post uploaded!');
      closeAndReset();

      await trpcUtils.post.getInfinitePosts.invalidate();
    } catch (error: any) {
      setIsUploading(false);
      toast.error('Upload failed');
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
