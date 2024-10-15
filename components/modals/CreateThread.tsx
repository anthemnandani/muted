'use client';
import usePost from '@/hooks/usePost';
import useWindow from '@/hooks/useWindow';
import { useUploadThing } from '@/lib/uploadthing';
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

  const { selectedFile } = useFileStore();
  const { startUpload } = useUploadThing('media');

  const {
    openDialog,
    setOpenDialog,
    replyPostInfo,
    setReplyPostInfo,
    quoteInfo,
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
    const imgRes = await startUpload(selectedFile);
    const promise = replyPostInfo
      ? replyToPost({
          text: threadData.text,
          postId: replyPostInfo.id,
          imageUrl: imgRes ? imgRes[0]?.fileUrl : undefined,
          privacy: threadData.privacy,
          postAuthor: replyPostInfo.author.id,
        })
      : createThread({
          text: threadData.text,
          imageUrl: imgRes ? imgRes[0]?.fileUrl : undefined,
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
      setReplyPostInfo(null);
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
              disabled={threadData?.text === '' || isLoading || isReplying}
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
