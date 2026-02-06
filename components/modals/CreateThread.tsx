'use client';

import useCreateThread from '@/hooks/useCreateThread';
import useLinkPreview from '@/hooks/useLinkPreview';
import useMentions from '@/hooks/useMentions';
import { cn } from '@/lib/utils';
import useFileStore from '@/store/fileStore';
import { useThreadStore } from '@/store/threadStore';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
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

const CreateThread = ({ rootThreadId }: { rootThreadId?: string }) => {
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
    editThreadInfo,
    replyThreadInfo,
    setPrivacy,
  } = useThreadStore();

  const { threadMedia, setThreadMedia } = useFileStore();

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    isCreating,
    isEditing,
    isCommenting,
    isReplying,
    isDisabled,
    isUploading,
    uploadProgress,
    cancelUpload,
    handleSubmit,
  } = useCreateThread({ rootThreadId });
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

  useEffect(() => {
    if (openDialog && editThreadInfo) {
      setText(editThreadInfo.text);
      setPrivacy(editThreadInfo.privacy);
      setLinkPreview(editThreadInfo.linkPreview);

      if (editThreadInfo.mentions && editThreadInfo.mentions.length > 0) {
        editThreadInfo.mentions.forEach((m) => {
          const mentionString = `@${m.user.username}`;
          const index = editThreadInfo.text.indexOf(mentionString);
          if (index >= 0) {
            addValidMention({
              username: m.user.username,
              mentionedUserId: m.user.id,
              startIndex: index,
              endIndex: index + mentionString.length,
            });
          }
        });
      }
    }
  }, [openDialog, editThreadInfo, setText, setPrivacy, addValidMention]);

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setOpenDialog(true);
      return;
    }

    const hasUnsavedChanges = text.trim().length > 0 || !!threadMedia;

    if (editThreadInfo) {
      reset();
      return;
    }

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

  const buttonText = useMemo(() => {
    if (isCommenting) return 'Commenting...';
    if (isReplying) return 'Replying...';
    if (isCreating) return 'Posting...';
    if (isEditing) return 'Saving...';
    if (editThreadInfo) return 'Save';
    if (replyThreadInfo && replyThreadInfo.isComment) return 'Comment';
    if (replyThreadInfo) return 'Reply';
    return 'Post';
  }, [
    isCreating,
    isEditing,
    isCommenting,
    isReplying,
    editThreadInfo,
    replyThreadInfo,
  ]);

  const titleText = useMemo(() => {
    if (editThreadInfo) return 'Edit thread';
    if (replyThreadInfo && replyThreadInfo.isComment) return 'Comment';
    if (replyThreadInfo) return 'Reply';
    return 'New thread';
  }, [editThreadInfo, replyThreadInfo]);

  return (
    <Fragment>
      <Dialog open={openDialog} onOpenChange={handleOpenChange}>
        <DialogTrigger>
          <CreateThreadDesktop />
        </DialogTrigger>
        <DialogContent className='w-full select-none border-none bg-transparent shadow-none outline-none md:max-w-[668px]'>
          <DialogHeader>
            <DialogTitle>
              <VisuallyHidden.Root>{titleText}</VisuallyHidden.Root>
            </DialogTitle>
          </DialogHeader>
          <h1 className='mb-2 w-full text-center font-bold text-white'>
            {titleText}
          </h1>
          <Card className='relative rounded-2xl border-none bg-gray-6 shadow-2xl ring-1 ring-[#393939] ring-offset-0'>
            <div className='max-h-[calc(100vh-100px)] overflow-y-auto'>
              <div
                className={cn(
                  'p-6',
                  (linkPreview || isLinkPreviewLoading) && '!pb-4',
                )}
              >
                {replyThreadInfo && (
                  <CreateThreadInput
                    textareaRef={textareaRef}
                    handleMentionSearch={handleMentionSearch}
                    replyThreadInfo={replyThreadInfo}
                  />
                )}
                <CreateThreadInput
                  placeholder={
                    replyThreadInfo
                      ? `${replyThreadInfo.isComment ? 'Comment' : 'Reply'} to ${replyThreadInfo?.author?.username}...`
                      : 'Start a thread...'
                  }
                  textareaRef={textareaRef}
                  handleMentionSearch={handleMentionSearch}
                  isUploading={isUploading}
                  uploadProgress={uploadProgress}
                  hideMedia={!!replyThreadInfo}
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
                  onClick={handleSubmit}
                  variant='ghost'
                  className='bg-transparent border border-border-light rounded-lg text-[14px] leading-none flex-center hover:bg-transparent disabled:cursor-not-allowed disabled:pointer-events-auto'
                  disabled={isDisabled}
                >
                  {buttonText}
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
