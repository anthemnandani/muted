'use client';

import { ResizeTextarea } from '@/components/ui/resize-textarea';
import useWindow from '@/hooks/useWindow';
import type { CreateThreadInputProps } from '@/lib/types';
import { cn, getFullName } from '@/lib/utils';
import useDialog from '@/store/dialog';
import useFileStore from '@/store/fileStore';
import { api } from '@/trpc/react';
import { useUser } from '@clerk/nextjs';
import { IGif } from '@giphy/js-types';
import React from 'react';
import ThreadQuoteCard from '../cards/ThreadQuoteCard';
import PostMediaPreview from '../posts/PostMediaPreview';
import PostMediaTools from '../posts/PostMediaTools';
import ReplyPreview from '../posts/ReplyPreview';
import UserAvatar from '../shared/UserAvatar';

const CreateThreadInput = ({
  isOpen,
  replyThreadInfo,
  onTextareaChange,
  placeholder,
  quoteInfo,
  textareaRef,
  value,
  setThreadData,
  handleMentionSearch,
  isReply = false,
}: CreateThreadInputProps) => {
  const { isMobile } = useWindow();
  const { user } = useUser();
  const { editPostInfo } = useDialog();
  const { setSelectedFile } = useFileStore();
  const [previewType, setPreviewType] = React.useState<
    'image' | 'video' | null
  >(null);
  const [previewURL, setPreviewURL] = React.useState<string>();

  const userFullName = React.useMemo(
    () => getFullName(user?.firstName ?? '', user?.lastName ?? ''),
    [user]
  );

  const { data } = api.user.userInfo.useQuery({ username: user?.username! });

  const handleEmojiSelect = (emoji: string) => {
    const cursorPosition = textareaRef.current?.selectionStart || 0;
    const newText =
      value.slice(0, cursorPosition) + emoji + value.slice(cursorPosition);

    handleResizeTextareaChange({
      target: { value: newText },
    } as React.ChangeEvent<HTMLTextAreaElement>);

    if (!isMobile) {
      setTimeout(() => {
        if (textareaRef.current) {
          const newPosition = cursorPosition + emoji.length;
          textareaRef.current.selectionStart = newPosition;
          textareaRef.current.selectionEnd = newPosition;
          textareaRef.current.focus();
        }
      }, 0);
    }
  };

  const handleResizeTextareaChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const newValue = event.target.value;
    handleMentionSearch(newValue, event.target.selectionStart || 0);
    setThreadData((prev) => ({ ...prev, text: newValue }));
    onTextareaChange(newValue);
  };

  const handleFileSelect = (acceptedFiles: File[]) => {
    const acceptedFile = acceptedFiles[0];
    if (!acceptedFile) {
      alert('Selected file is too large!');
      return;
    }

    const previewURL = URL.createObjectURL(acceptedFile);
    setPreviewURL(previewURL);
    setPreviewType(acceptedFile.type.startsWith('image/') ? 'image' : 'video');
    setSelectedFile(acceptedFiles);
  };

  const handleGifSelect = (gif: IGif) => {
    setPreviewURL(gif.images.original.url);
    setSelectedFile([gif]);
    setPreviewType('image');
  };

  const clearPreview = () => {
    setSelectedFile([]);
    setPreviewURL('');
    setPreviewType(null);
  };

  const scrollDownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    scrollDownRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'start',
    });
  }, [isOpen]);

  return (
    <div
      className={cn('flex space-x-3', {
        'mt-1': !replyThreadInfo,
      })}
    >
      <div className='relative flex flex-col items-center'>
        <UserAvatar
          image={
            replyThreadInfo
              ? replyThreadInfo.author.image
              : data?.userDetails?.image || ''
          }
          username={replyThreadInfo?.author.username || user?.username!}
          fullname={replyThreadInfo?.author.fullName || userFullName}
        />
        {(replyThreadInfo?.text ||
          editPostInfo?.text ||
          replyThreadInfo?.media) && (
          <div className='h-full w-0.5 bg-[#D8D8D8] dark:bg-[#313639] rounded-full mt-1.5 my-1' />
        )}
      </div>

      <div className='flex flex-col w-full gap-1.5 pb-4'>
        {replyThreadInfo ? (
          <ReplyPreview {...replyThreadInfo} />
        ) : (
          <>
            <span className='text-[15px] font-medium leading-none tracking-normal'>
              {user?.username}
            </span>
            <ResizeTextarea
              name='text'
              forwardedRef={textareaRef}
              value={value}
              onChange={handleResizeTextareaChange}
              placeholder={placeholder}
              maxLength={5000}
            />
            {previewURL && previewType && (
              <PostMediaPreview
                type={previewType}
                url={previewURL}
                onRemove={clearPreview}
              />
            )}
          </>
        )}

        {!isReply && (
          <PostMediaTools
            onFileSelect={handleFileSelect}
            onGifSelect={handleGifSelect}
            onEmojiSelect={handleEmojiSelect}
          />
        )}

        {quoteInfo && (
          <ThreadQuoteCard {...quoteInfo} createdAt={quoteInfo.createdAt} />
        )}
      </div>
    </div>
  );
};

export default CreateThreadInput;
