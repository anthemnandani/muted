'use client';

import { ResizeTextarea } from '@/components/ui/resize-textarea';
import useDevice from '@/hooks/useDevice';
import type { CreatePostInputProps } from '@/lib/types';
import { cn, getFullName } from '@/lib/utils';
import usePostDialog from '@/store/postDialog';
import { api } from '@/trpc/react';
import { useUser } from '@clerk/nextjs';
import React from 'react';
import ThreadQuoteCard from '../cards/ThreadQuoteCard';
import PostMediaTools from '../posts/PostMediaTools';
import ReplyPreview from '../posts/ReplyPreview';
import UserAvatar from '../shared/UserAvatar';

const CreatePostInput = ({
  isOpen,
  replyPostInfo,
  onTextareaChange,
  placeholder,
  quoteInfo,
  textareaRef,
  value,
  setPostData,
  isReply = false,
}: CreatePostInputProps) => {
  const { isMobile } = useDevice();
  const { user } = useUser();
  const { editPostInfo } = usePostDialog();
  // const { setSelectedFile } = useFileStore();
  // const [previewType, setPreviewType] = React.useState<
  //   'image' | 'video' | null
  // >(null);
  // const [previewURL, setPreviewURL] = React.useState<string>();

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
    // handleMentionSearch(newValue, event.target.selectionStart || 0);
    setPostData((prev) => ({ ...prev, text: newValue }));
    onTextareaChange(newValue);
  };

  // const handleFileSelect = (acceptedFiles: File[]) => {
  //   const acceptedFile = acceptedFiles[0];
  //   if (!acceptedFile) {
  //     alert('Selected file is too large!');
  //     return;
  //   }

  //   const previewURL = URL.createObjectURL(acceptedFile);
  //   setPreviewURL(previewURL);
  //   setPreviewType(acceptedFile.type.startsWith('image/') ? 'image' : 'video');
  //   setSelectedFile(acceptedFiles);
  // };

  // const handleGifSelect = (gif: IGif) => {
  //   setPreviewURL(gif.images.original.url);
  //   setSelectedFile([gif]);
  //   setPreviewType('image');
  // };

  // const clearPreview = () => {
  //   setSelectedFile([]);
  //   setPreviewURL('');
  //   setPreviewType(null);
  // };

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
        'mt-1': !replyPostInfo,
      })}
    >
      <div className='relative flex flex-col items-center'>
        <UserAvatar
          image={
            replyPostInfo
              ? replyPostInfo.author.image
              : data?.userDetails?.image || ''
          }
          username={replyPostInfo?.author.username || user?.username!}
          fullname={replyPostInfo?.author.fullName || userFullName}
        />
        {(replyPostInfo?.text ||
          editPostInfo?.text ||
          replyPostInfo?.media) && (
          <div className='h-full w-0.5 bg-[#D8D8D8] dark:bg-[#313639] rounded-full mt-1.5 my-1' />
        )}
      </div>

      <div className='flex flex-col w-full gap-1.5 pb-4'>
        {replyPostInfo ? (
          <ReplyPreview {...replyPostInfo} />
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
            {/* {previewURL && previewType && (
              <PostMediaPreview
                type={previewType}
                url={previewURL}
                onRemove={clearPreview}
              />
            )} */}
          </>
        )}

        {!isReply && (
          <PostMediaTools
            // onFileSelect={handleFileSelect}
            // onGifSelect={handleGifSelect}
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

export default CreatePostInput;
