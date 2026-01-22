'use client';

import useCreateThread from '@/hooks/useCreateThread';
import useMentions from '@/hooks/useMentions';
import { useThreadStore } from '@/store/threadStore';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { Check } from 'lucide-react';
import Link from 'next/link';
import { useRef } from 'react';
import { toast } from 'sonner';
import CreateThreadDesktop from '../buttons/CreateThreadDesktop';
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

const CreateThread = () => {
  const {
    openDialog,
    text,
    setOpenDialog,
    addValidMention,
    updateMentionIndices,
    setText,
  } = useThreadStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { isCreating, handleMutation } = useCreateThread();

  const {
    mentionSuggestions,
    showMentionSuggestions,
    cursorPosition,
    handleMentionSearch,
    isMentionsLoading,
    insertMention,
  } = useMentions({
    textareaRef,
    setCommentText: setText,
    addValidMention,
    updateMentionIndices,
  });

  const handleSubmit = () => {
    const promise = handleMutation();

    toast.promise(promise, {
      loading: (
        <div className='flex w-[270px] items-center justify-start gap-1.5 p-0'>
          <div>
            <Icons.loading className='size-8' />
          </div>
          Posting
        </div>
      ),
      success: (data) => {
        const threadInfo = data?.thread;
        return (
          <div className='flex-between w-[270px] p-0 '>
            <div className='flex-center gap-1.5'>
              <Check className='size-5' />
              {/* {data?.isEdited ? 'Edited' : 'Posted'} */}
              Posted
            </div>
            <Link
              href={`/${threadInfo.author.username}/thread/${threadInfo.id}`}
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

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogTrigger>
        <CreateThreadDesktop />
      </DialogTrigger>
      <DialogContent className='w-full select-none border-none bg-transparent shadow-none outline-none md:max-w-[668px]'>
        <DialogHeader>
          <DialogTitle>
            <VisuallyHidden.Root>New thread</VisuallyHidden.Root>
          </DialogTitle>
        </DialogHeader>
        <h1 className='mb-2 w-full text-center font-bold text-white'>
          New thread
        </h1>
        <Card className='relative rounded-2xl border-none bg-gray-6 shadow-2xl ring-1 ring-[#393939] ring-offset-0'>
          <div className='max-h-[calc(100vh-100px)] overflow-y-auto'>
            <div className='p-6'>
              <CreateThreadInput
                placeholder='Start a thread...'
                textareaRef={textareaRef}
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
                onClick={() => handleSubmit()}
                variant='ghost'
                className='bg-transparent border border-border-dark dark:border-border-light rounded-lg text-[14px] leading-none flex-center hover:bg-transparent dark:hover:bg-transparent disabled:cursor-not-allowed disabled:pointer-events-auto'
                disabled={text === '' || isCreating}
              >
                {isCreating && (
                  <Icons.spinner
                    className='mr-2 size-4 animate-spin'
                    aria-hidden='true'
                  />
                )}
                Post
              </Button>
            </div>
          </div>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default CreateThread;
