import { useThreadStore } from '@/store/threadStore';
import { api } from '@/trpc/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const useCreateThread = () => {
  const router = useRouter();
  const {
    text,
    privacy,
    linkPreview,
    quoteInfo,
    validMentions,
    reset,
    setOpenDialog,
  } = useThreadStore();

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
        setOpenDialog(false);
        setTimeout(() => {
          reset();
        }, 150);
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

  //   const handleMediaUpload = async () => {
  //     if (selectedFile.length === 0) return {};

  //     const file = selectedFile[0];
  //     try {
  //       if ('images' in file) {
  //         const response = await fetch(file.images.original.url);
  //         const blob = await response.blob();
  //         const gifFile = new File([blob], `${file.id}.gif`, {
  //           type: 'image/gif',
  //         });

  //         const fileRes = await startUpload([gifFile]);
  //         if (!fileRes?.[0]) return {};

  //         return {
  //           fileUrl: fileRes[0].fileUrl,
  //           fileType: 'gif',
  //         };
  //       }
  //       if (file instanceof File) {
  //         const dimensions = file.type.startsWith('image/')
  //           ? await getImageDimensions(file)
  //           : file.type.startsWith('video/')
  //             ? await getVideoDimensions(file)
  //             : null;

  //         let aspectRatio;
  //         let originalDimensions;

  //         if (dimensions) {
  //           aspectRatio = getMediaAspectRatio(dimensions);
  //           if (!aspectRatio) {
  //             originalDimensions = dimensions;
  //           }
  //         }

  //         const fileRes = await startUpload(selectedFile as File[]);
  //         if (!fileRes?.[0]) return {};

  //         return {
  //           fileUrl: fileRes[0].fileUrl,
  //           fileType: fileRes[0].fileKey.split('.').pop() || '',
  //           aspectRatio,
  //           originalDimensions,
  //         };
  //       }
  //       return {};
  //     } catch (error) {
  //       toast.error('Error processing media file');
  //       return {};
  //     }
  //   };

  const handleMutation = async () => {
    // const {
    //   fileUrl: mediaUploadUrl,
    //   fileType,
    //   aspectRatio,
    //   originalDimensions,
    // } = await handleMediaUpload();

    // const promise = replyPostInfo
    //   ? replyToPost({
    //       text: threadData.text.trim(),
    //       postId: replyPostInfo.id,
    //       media: mediaUploadUrl
    //         ? { fileType, fileUrl: mediaUploadUrl }
    //         : undefined,
    //       privacy: threadData.privacy,
    //       postAuthor: replyPostInfo.author.id,
    //     })
    //   : editPostInfo
    //     ? editPost({
    //         id: editPostInfo.id,
    //         text: threadData.text.trim(),
    //         mentions,
    //       })
    //     : createThread({
    //         text: threadData.text.trim(),
    //         media: mediaUploadUrl
    //           ? {
    //               fileType: fileType as MediaType,
    //               fileUrl: mediaUploadUrl,
    //               aspectRatio,
    //               originalDimensions,
    //             }
    //           : undefined,
    //         privacy: threadData.privacy,
    //         quoteId: quoteInfo?.id,
    //         postAuthor: quoteInfo?.author.id,
    //         linkPreview: threadData.linkPreview ?? undefined,
    //         mentions,
    //       });

    const promise = createThread({
      text: text.trim(),
      // media: mediaUploadUrl
      //   ? {
      //       fileType: fileType as MediaType,
      //       fileUrl: mediaUploadUrl,
      //       aspectRatio,
      //       originalDimensions,
      //     }
      //   : undefined,
      privacy,
      quoteId: quoteInfo?.id,
      // postAuthor: quoteInfo?.author.id,
      linkPreview: linkPreview ?? undefined,
      mentions: validMentions.map((m) => ({
        mentionedUserId: m.mentionedUserId,
        index: m.startIndex,
      })),
    });

    return promise as any;
  };

  return {
    handleMutation,
    isCreating,
  };
};

export default useCreateThread;
