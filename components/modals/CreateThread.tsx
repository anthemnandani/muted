'use client';
import usePost from '@/hooks/usePost';
import useWindow from '@/hooks/useWindow';
import useDialog from '@/store/dialog';
import { api } from '@/trpc/react';
import { Check } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { toast } from 'sonner';
import CreateThreadDesktop from '../buttons/CreateThreadDesktop';
import CreateThreadMobile from '../buttons/CreateThreadMobile';
import { Icons } from '../icons';
import CreateThreadInput from '../inputs/CreateThreadInput';
import PostPrivacyMenu from '../menus/PostPrivacyMenu';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog';

const CreateThread = () => {
  const { postPrivacy } = usePost();

  const { openDialog, setOpenDialog, replyPostInfo, quoteInfo } = useDialog();
  const [threadData, setThreadData] = React.useState({
    privacy: postPrivacy,
    text: '',
  });

  const trpcUtils = api.useUtils();

  const { isLoading, mutateAsync: createThread } =
    api.post.createPost.useMutation({
      onMutate: ({}) => {
        setThreadData({
          ...threadData,
          text: '',
        });
        // TODO: Add new optimistic update, old one is not working
      },
      onError: () => {
        toast.error('PostingError: Something went wrong!');
      },
      onSettled: async () => {
        await trpcUtils.post.getInfinitePosts.invalidate();
      },
      retry: false,
    });

  async function handleMutation() {
    const promise = createThread({
      text: threadData.text,
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
    });
  }

  const handleFieldChange = (textValue: string) => {
    setThreadData({
      ...threadData,
      text: textValue,
    });
  };
  const { isMobile } = useWindow();
  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogTrigger>
        {isMobile ? <CreateThreadMobile /> : <CreateThreadDesktop />}
      </DialogTrigger>
      <DialogContent className='w-full max-w-lg select-none border-none bg-transparent shadow-none outline-none sm:max-w-[668px]'>
        <h1 className='mb-2 w-full text-center font-bold text-white'>
          {replyPostInfo ? 'Reply' : 'New thread'}
        </h1>
        <Card className='rounded-2xl border-none bg-background shadow-2xl ring-1 ring-[#393939] ring-offset-0 dark:bg-gray-6'>
          <div className='no-scrollbar max-h-[70vh] overflow-y-auto p-6'>
            <CreateThreadInput
              isOpen={openDialog}
              onTextareaChange={handleFieldChange}
              quoteInfo={quoteInfo}
            />
          </div>
          <div className='w-full flex-between p-6'>
            <PostPrivacyMenu />
            <Button
              onClick={handleCreateThread}
              variant='ghost'
              className='bg-transparent border border-border-dark dark:border-border-light rounded-lg text-[14px] leading-none flex-center hover:bg-transparent dark:hover:bg-transparent disabled:cursor-not-allowed disabled:pointer-events-auto'
              disabled={threadData?.text === '' || isLoading}
            >
              {isLoading && (
                <Icons.spinner
                  className='mr-2 h-4 w-4 animate-spin'
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
