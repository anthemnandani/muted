'use client';

import useCreateThread from '@/hooks/useCreateThread';
import useMentions from '@/hooks/useMentions';
import useWindow from '@/hooks/useWindow';
import useDialog from '@/store/dialog';
import useFileStore from '@/store/fileStore';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { Check } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { toast } from 'sonner';
import CreateThreadDesktop from '../buttons/CreateThreadDesktop';
import CreateThreadMobile from '../buttons/CreateThreadMobile';
import { Icons } from '../icons';
import CreateThreadInput from '../inputs/CreateThreadInput';
import PostPrivacyMenu from '../menus/PostPrivacyMenu';
import UsersMenu from '../menus/UsersMenu';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { cn } from '@/lib/utils';

const CreateThread = () => {
  const { isMobile } = useWindow();
  const { selectedFile } = useFileStore();
  const { openDialog, setOpenDialog, replyPostInfo, quoteInfo } = useDialog();
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const [mentions, setMentions] = React.useState<
    Array<{
      userId: string;
      index: number;
    }>
  >([]);

  const {
    threadData,
    setThreadData,
    isLoading,
    isReplying,
    handleMutation,
    resetState,
  } = useCreateThread(setMentions);

  const {
    mentionSuggestions,
    showMentionSuggestions,
    cursorPosition,
    handleMentionSearch,
    isMentionsLoading,
    insertMention,
  } = useMentions({ textareaRef, setThreadData, setMentions });

  const handleCreateThread = () => {
    setOpenDialog(false);
    const promise = handleMutation(mentions);

    toast.promise(promise, {
      loading: (
        <div className='flex w-[270px] items-center justify-start gap-1.5 p-0'>
          <div>
            <Icons.loading className='size-8' />
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
  };

  const handleFieldChange = (textValue: string) => {
    setThreadData({
      ...threadData,
      text: textValue,
    });
  };

  React.useEffect(() => {
    if (!openDialog) {
      resetState();
    }
  }, [openDialog]);

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
      <DialogContent
        className={cn(
          'w-full top-[30%] select-none border-none bg-transparent shadow-none outline-none md:max-w-[668px]'
        )}
      >
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
        <Card className='relative rounded-2xl border-none bg-background shadow-2xl ring-1 ring-[#393939] ring-offset-0 dark:bg-gray-6'>
          <div className='no-scrollbar max-h-[70vh] overflow-y-auto p-6'>
            {replyPostInfo && (
              <CreateThreadInput
                isOpen={openDialog}
                onTextareaChange={handleFieldChange}
                replyThreadInfo={replyPostInfo}
                textareaRef={textareaRef}
                value={threadData.text}
                setThreadData={setThreadData}
                handleMentionSearch={handleMentionSearch}
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
              textareaRef={textareaRef}
              value={threadData.text}
              setThreadData={setThreadData}
              handleMentionSearch={handleMentionSearch}
            />
          </div>
          {showMentionSuggestions && (
            <UsersMenu
              showMentionSuggestions={showMentionSuggestions}
              mentionSuggestions={mentionSuggestions}
              cursorPosition={cursorPosition}
              isLoading={isMentionsLoading}
              onSelect={insertMention}
            />
          )}
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
