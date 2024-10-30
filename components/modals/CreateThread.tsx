'use client';
import usePost from '@/hooks/usePost';
import useWindow from '@/hooks/useWindow';
import { useUploadThing } from '@/lib/uploadthing';
import { getImageDimensions } from '@/lib/utils';
import useDialog from '@/store/dialog';
import useFileStore from '@/store/fileStore';
import { api } from '@/trpc/react';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { Check } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react';
import { toast } from 'sonner';
import CreateThreadDesktop from '../buttons/CreateThreadDesktop';
import CreateThreadMobile from '../buttons/CreateThreadMobile';
import { Icons } from '../icons';
import CreateThreadInput from '../inputs/CreateThreadInput';
import PostPrivacyMenu from '../menus/PostPrivacyMenu';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';

const CreateThread = () => {
  const { postPrivacy } = usePost();
  const router = useRouter();

  const { selectedFile, setSelectedFile } = useFileStore();

  const { startUpload } = useUploadThing('media');

  const {
    openDialog,
    setOpenDialog,
    replyPostInfo,
    setReplyPostInfo,
    quoteInfo,
    setQuoteInfo,
  } = useDialog();

  const [threadData, setThreadData] = React.useState({
    privacy: postPrivacy,
    text: '',
  });

  React.useEffect(() => {
    setThreadData((prevThreadData) => ({
      ...prevThreadData,
      privacy: postPrivacy,
    }));
  }, [postPrivacy]);

  const trpcUtils = api.useUtils();

  const { isLoading, mutateAsync: createThread } =
    api.post.createPost.useMutation({
      onMutate: ({}) => {
        setThreadData({
          ...threadData,
          text: '',
        });
      },
      onError: () => {
        toast.error('PostingError: Something went wrong!');
      },
      onSettled: async () => {
        await trpcUtils.post.getInfinitePosts.invalidate();
      },
      retry: false,
    });

  const { isLoading: isReplying, mutateAsync: replyToPost } =
    api.post.replyToPost.useMutation({
      onError: (err) => {
        toast.error('ReplyingError: Something went wrong!');
        if (err.data?.code === 'UNAUTHORIZED') {
          router.push('/login');
        }
      },
      onSettled: async () => {
        await trpcUtils.post.getInfinitePosts.invalidate();
        await trpcUtils.invalidate();
      },
      retry: false,
    });

  async function handleMutation() {
    let mediaUploadUrl = '';
    let fileType = '';
    let aspectRatio: string | undefined;
    let originalDimensions: { width: number; height: number } | undefined;
    if (selectedFile.length > 0) {
      const file = selectedFile[0];
      if (file.type.startsWith('image/')) {
        const dimensions = await getImageDimensions(file);
        const ratio = dimensions.width / dimensions.height;

        if (Math.abs(ratio - 1) < 0.01) {
          aspectRatio = '1:1';
        } else if (Math.abs(ratio - 16 / 9) < 0.01) {
          aspectRatio = '16:9';
        } else if (Math.abs(ratio - 4 / 5) < 0.01) {
          aspectRatio = '4:5';
        } else {
          originalDimensions = dimensions;
        }
      }
      const fileRes = await startUpload(selectedFile);
      if (fileRes && fileRes[0]) {
        mediaUploadUrl = fileRes[0].fileUrl;
        fileType = fileRes[0].fileKey.split('.').pop() || '';
      }
    }

    const promise = replyPostInfo
      ? replyToPost({
          text: threadData.text,
          postId: replyPostInfo.id,
          media: mediaUploadUrl
            ? { fileType, fileUrl: mediaUploadUrl }
            : undefined,
          privacy: threadData.privacy,
          postAuthor: replyPostInfo.author.id,
        })
      : createThread({
          text: threadData.text,
          media: mediaUploadUrl
            ? {
                fileType,
                fileUrl: mediaUploadUrl,
                aspectRatio,
                originalDimensions,
              }
            : undefined,
          privacy: threadData.privacy,
          quoteId: quoteInfo?.id,
          postAuthor: quoteInfo?.author.id,
        });

    return promise;
  }

  function handleCreateThread() {
    setOpenDialog(false);
    const promise = handleMutation();

    toast.promise(promise, {
      loading: (
        <div className='flex w-[270px] items-center justify-start gap-1.5 p-0'>
          <div>
            <Icons.loading className='h-8 w-8 ' />
          </div>
          Posting...
        </div>
      ),
      success: (data) => {
        return (
          <div className='flex-between w-[270px] p-0 '>
            <div className='flex-center gap-1.5'>
              <Check className='size-5' />
              Posted
            </div>
            <Link
              href={`/${data?.createPost.author.username}/post/${data?.createPost.id}`}
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
  }

  const handleFieldChange = (textValue: string) => {
    setThreadData({
      ...threadData,
      text: textValue,
    });
  };

  React.useEffect(() => {
    if (!openDialog) {
      setThreadData({
        privacy: postPrivacy,
        text: '',
      });
      setSelectedFile([]);
      setReplyPostInfo(null);
      setQuoteInfo(null);
    }
  }, [openDialog]);
  const { isMobile } = useWindow();

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogTrigger>
        {isMobile ? (
          <CreateThreadMobile />
        ) : (
          <>
            <div className='hidden md:flex relative w-15 h-12 flex-center rounded-xl bg-primary transition-colors duration-150 border-none text-secondary hover:text-foreground'>
              <Icons.plus className='size-6' />
            </div>
            <CreateThreadDesktop />
          </>
        )}
      </DialogTrigger>
      <DialogContent className='w-full select-none border-none bg-transparent shadow-none outline-none md:max-w-[668px]'>
        <DialogHeader>
          <DialogTitle>
            <VisuallyHidden.Root>
              {replyPostInfo ? 'Reply' : 'New thread'}
            </VisuallyHidden.Root>
          </DialogTitle>
        </DialogHeader>
        <h1 className='mb-2 w-full text-center font-bold text-white'>
          {replyPostInfo ? 'Reply' : 'New thread'}
        </h1>
        <Card className='rounded-2xl border-none bg-background shadow-2xl ring-1 ring-[#393939] ring-offset-0 dark:bg-gray-6'>
          <div className='no-scrollbar max-h-[70vh] overflow-y-auto p-6'>
            {replyPostInfo && (
              <CreateThreadInput
                isOpen={openDialog}
                onTextareaChange={handleFieldChange}
                replyThreadInfo={replyPostInfo}
              />
            )}
            <CreateThreadInput
              isOpen={openDialog}
              onTextareaChange={handleFieldChange}
              quoteInfo={quoteInfo}
              placeholder={
                replyPostInfo
                  ? `Reply to ${replyPostInfo?.author?.username}...`
                  : 'Start a thread...'
              }
            />
          </div>
          <div className='w-full flex-between p-6'>
            <PostPrivacyMenu />
            <Button
              onClick={handleCreateThread}
              variant='ghost'
              className='bg-transparent border border-border-dark dark:border-border-light rounded-lg text-[14px] leading-none flex-center hover:bg-transparent dark:hover:bg-transparent disabled:cursor-not-allowed disabled:pointer-events-auto'
              disabled={
                (threadData?.text === '' && !selectedFile) ||
                isLoading ||
                isReplying
              }
            >
              {(isLoading || isReplying) && (
                <Icons.spinner
                  className='mr-2 size-4 animate-spin'
                  aria-hidden='true'
                />
              )}
              Post
            </Button>
          </div>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default CreateThread;
