import { Icons } from '@/components/icons';
import { getCroppedImg } from '@/lib/canvasUtils';
import type { MediaFile, PostMedia } from '@/lib/types';
import { getImageDimensions, getVideoDimensions } from '@/lib/utils';
import useFileStore from '@/store/fileStore';
import usePostDialog from '@/store/postDialog';
import { api } from '@/trpc/react';
import type { UpChunk } from '@mux/upchunk';
import { createId } from '@paralleldrive/cuid2';
import { PostStatus } from '@prisma/client';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { useMuxUpload } from './useMuxUpload';

const useCreatePost = () => {
  const { mediaFiles, setMediaFiles } = useFileStore();
  const { editPostId, resetPostState, setOpenDialog, postData, validMentions } =
    usePostDialog();
  const { uploadToStorage, prepareMuxUpload, startMuxUpload } = useMuxUpload();

  const abortControllerRef = useRef<AbortController | null>(null);
  const activePostId = useRef<string | null>(null);
  const activeMuxUploads = useRef<UpChunk[]>([]);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const closeAndReset = () => {
    setOpenDialog(false);
    setTimeout(() => {
      setMediaFiles([]);
      resetPostState();
      setIsUploading(false);
      setUploadProgress(0);
      abortControllerRef.current = null;
      activePostId.current = null;
      activeMuxUploads.current = [];
    }, 300);
  };

  const { mutateAsync: createPost, isPending: isCreating } =
    api.post.createPost.useMutation();

  const { mutateAsync: editPost, isPending: isEditing } =
    api.post.editPost.useMutation({
      onMutate: () => {
        closeAndReset();
      },
    });

  const { mutateAsync: deletePost } = api.post.deletePost.useMutation();

  const cancelUpload = async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    if (activeMuxUploads.current.length > 0) {
      activeMuxUploads.current.forEach((upload) => {
        try {
          upload.abort();
        } catch (e) {}
      });
    }

    if (activePostId.current) {
      try {
        await deletePost({ id: activePostId.current });
      } catch (error) {}
    }

    closeAndReset();
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

  const processImage = async (fileObj: MediaFile): Promise<PostMedia> => {
    let fileToUpload = fileObj.file;
    let finalDimensions = { width: 0, height: 0 };

    if (fileObj.cropData) {
      try {
        const croppedBlob = await getCroppedImg(
          fileObj.preview,
          fileObj.cropData,
        );
        fileToUpload = new File([croppedBlob], fileObj.file.name, {
          type: fileObj.file.type,
          lastModified: Date.now(),
        });
        finalDimensions = {
          width: fileObj.cropData.width,
          height: fileObj.cropData.height,
        };
      } catch (e) {
        finalDimensions = await getImageDimensions(fileObj.file);
      }
    } else {
      finalDimensions = await getImageDimensions(fileToUpload);
    }

    const url = await uploadToStorage(fileToUpload);

    const resolvedAspectRatio =
      fileObj.aspectRatio === 'original'
        ? `${finalDimensions.width}/${finalDimensions.height}`
        : fileObj.aspectRatio;

    return {
      fileType: 'image',
      fileUrl: url,
      aspectRatio: resolvedAspectRatio,
      originalDimensions: finalDimensions,
    };
  };

  const processVideo = async (
    fileObj: MediaFile,
    postId: string,
  ): Promise<{ media: PostMedia; uploadUrl: string }> => {
    const finalDimensions = await getVideoDimensions(fileObj.file);
    const { url, uploadId } = await prepareMuxUpload(postId);
    const localBlobUrl = URL.createObjectURL(fileObj.file);

    return {
      media: {
        fileType: 'video',
        videoId: uploadId,
        playbackId: localBlobUrl,
        aspectRatio: fileObj.aspectRatio,
        originalDimensions: finalDimensions,
        encodingStatus: 'PROCESSING',
      },
      uploadUrl: url,
    };
  };

  const handleCreatePost = async () => {
    if (mediaFiles.length === 0) return;

    try {
      setIsUploading(true);
      setUploadProgress(0);

      const generatedPostId = createId();

      activePostId.current = generatedPostId;
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      const processedMedia: PostMedia[] = [];
      const videoQueue: Array<() => Promise<void>> = [];

      const progressMap = new Array(mediaFiles.length).fill(0);

      const updateOverallProgress = (index: number, percent: number) => {
        progressMap[index] = percent;
        const total = progressMap.reduce((a, b) => a + b, 0);
        const average = Math.round(total / mediaFiles.length);
        setUploadProgress(average);
      };

      for (let i = 0; i < mediaFiles.length; i++) {
        const fileObj = mediaFiles[i];
        if (signal.aborted) throw new Error('Cancelled');

        if (fileObj.type === 'video') {
          const { media, uploadUrl } = await processVideo(
            fileObj,
            generatedPostId,
          );
          processedMedia.push(media);

          videoQueue.push(async () => {
            await startMuxUpload(
              fileObj.file,
              uploadUrl,
              (pct) => updateOverallProgress(i, pct),
              (uploadInstance) => {
                activeMuxUploads.current.push(uploadInstance);
              },
            );
          });
        } else {
          const media = await processImage(fileObj);
          processedMedia.push(media);
          updateOverallProgress(i, 100);
        }
      }

      if (signal.aborted) throw new Error('Cancelled');

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

      for (const startUpload of videoQueue) {
        if (signal.aborted) throw new Error('Cancelled');
        await startUpload();
      }

      setUploadProgress(100);
      toast.success('Post uploaded!');
      closeAndReset();
    } catch (error: any) {
      if (error.message !== 'Cancelled') {
        toast.error('Upload failed');
      }
      setIsUploading(false);
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
