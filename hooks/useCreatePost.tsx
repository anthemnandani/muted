import { Icons } from '@/components/icons';
import { EncodingStatus, FileType, PostStatus } from '@/generated/prisma/enums';
import { getCroppedImg } from '@/lib/canvasUtils';
import type { MediaFile } from '@/lib/types';
import { getImageDimensions, getVideoDimensions } from '@/lib/utils';
import useFileStore from '@/store/fileStore';
import usePostDialog from '@/store/postDialog';
import { api } from '@/trpc/react';
import type { UpChunk } from '@mux/upchunk';
import { createId } from '@paralleldrive/cuid2';
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

  const individualProgressRef = useRef<number[]>([]);

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

  const { mutate: deletePost } = api.post.deletePost.useMutation();

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
      deletePost({ id: activePostId.current });
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

  const processImage = async (fileObj: MediaFile) => {
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
      fileType: FileType.IMAGE,
      fileUrl: url,
      aspectRatio: resolvedAspectRatio as string,
      originalDimensions: finalDimensions,
      encodingStatus: EncodingStatus.UPLOADED,
    };
  };

  const processVideo = async (fileObj: MediaFile, postId: string) => {
    const finalDimensions = await getVideoDimensions(fileObj.file);
    const passthrough = `post|${postId}`;
    const { url, uploadId } = await prepareMuxUpload(passthrough);
    const localBlobUrl = URL.createObjectURL(fileObj.file);

    return {
      media: {
        fileType: FileType.VIDEO,
        videoId: uploadId,
        playbackId: localBlobUrl,
        aspectRatio: fileObj.aspectRatio,
        originalDimensions: finalDimensions,
        encodingStatus: EncodingStatus.PROCESSING,
      },
      uploadUrl: url,
    };
  };

  const handleProgressUpdate = (index: number, percent: number) => {
    individualProgressRef.current[index] = percent;
    const total = individualProgressRef.current.reduce((a, b) => a + b, 0);
    const average = Math.round(total / individualProgressRef.current.length);
    setUploadProgress(average);
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

      const pendingVideoUploads: Array<{
        file: File;
        uploadUrl: string;
        index: number;
      }> = [];

      const uploadPromises = mediaFiles.map(async (fileObj, index) => {
        if (signal.aborted) throw new Error('Cancelled');

        if (fileObj.type.toUpperCase() === FileType.VIDEO) {
          const { media, uploadUrl } = await processVideo(
            fileObj,
            generatedPostId,
          );

          pendingVideoUploads.push({ file: fileObj.file, uploadUrl, index });

          return media;
        } else {
          const media = await processImage(fileObj);
          handleProgressUpdate(index, 100);
          return media;
        }
      });

      const processedMedia = await Promise.all(uploadPromises);

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
        status: processedMedia.some(
          (media) => media.fileType === FileType.VIDEO,
        )
          ? PostStatus.HIDDEN
          : PostStatus.VISIBLE,
      });

      if (pendingVideoUploads.length > 0) {
        const muxUploadPromises = pendingVideoUploads.map(
          ({ file, uploadUrl, index }) => {
            return startMuxUpload(
              file,
              uploadUrl,
              (pct) => handleProgressUpdate(index, pct),
              (uploadInstance) => activeMuxUploads.current.push(uploadInstance),
            );
          },
        );

        await Promise.all(muxUploadPromises);
      }

      if (signal.aborted) throw new Error('Cancelled');

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
