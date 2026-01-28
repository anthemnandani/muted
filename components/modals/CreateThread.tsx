'use client';

import useCreateThread from '@/hooks/useCreateThread';
import useLinkPreview from '@/hooks/useLinkPreview';
import useMentions from '@/hooks/useMentions';
import useFileStore from '@/store/fileStore';
import { useThreadStore } from '@/store/threadStore';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { Fragment, useRef, useState } from 'react';
import CreateThreadDesktop from '../buttons/CreateThreadDesktop';
import LinkPreviewCard from '../cards/LinkPreviewCard';
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
import DiscardPost from './DiscardPost';

const CreateThread = () => {
  const {
    openDialog,
    text,
    setOpenDialog,
    addValidMention,
    updateMentionIndices,
    setText,
    linkPreview,
    setLinkPreview,
    reset,
  } = useThreadStore();

  const { threadMedia, setThreadMedia } = useFileStore();

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    isCreating,
    handleMutation,
    isUploading,
    uploadProgress,
    cancelUpload,
  } = useCreateThread();
  const { isLinkPreviewLoading } = useLinkPreview();
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);

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

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setOpenDialog(true);
      return;
    }

    const hasUnsavedChanges = text.trim().length > 0 || !!threadMedia;

    if (isUploading || hasUnsavedChanges) {
      setShowDiscardDialog(true);
    } else {
      setOpenDialog(false);
      setTimeout(() => {
        setThreadMedia(null);
        reset();
      }, 300);
    }
  };

  const handleConfirmDiscard = () => {
    setShowDiscardDialog(false);
    cancelUpload();
  };

  return (
    <Fragment>
      <Dialog open={openDialog} onOpenChange={handleOpenChange}>
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
                  isUploading={isUploading}
                  uploadProgress={uploadProgress}
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
              {(linkPreview || isLinkPreviewLoading) && (
                <div className='mx-6'>
                  <LinkPreviewCard
                    url={linkPreview?.url!}
                    title={linkPreview?.title || ''}
                    description={linkPreview?.description || ''}
                    image={linkPreview?.image || ''}
                    isLoading={isLinkPreviewLoading}
                    onClose={() => setLinkPreview(null)}
                  />
                </div>
              )}
              <div className='w-full flex-between p-6'>
                <PostPrivacyMenu />
                <Button
                  onClick={() => handleMutation()}
                  variant='ghost'
                  className='bg-transparent border border-border-light rounded-lg text-[14px] leading-none flex-center hover:bg-transparent disabled:cursor-not-allowed disabled:pointer-events-auto'
                  disabled={text === '' || isCreating}
                >
                  {isCreating ? 'Posting...' : 'Post'}
                </Button>
              </div>
            </div>
          </Card>
        </DialogContent>
      </Dialog>
      <DiscardPost
        isOpen={showDiscardDialog}
        onOpenChange={setShowDiscardDialog}
        discardPost={handleConfirmDiscard}
        showTrigger={false}
        type='Thread'
      />
    </Fragment>
  );
};

export default CreateThread;
