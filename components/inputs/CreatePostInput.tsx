'use client';

import { ResizeTextarea } from '@/components/ui/resize-textarea';
import useDevice from '@/hooks/useDevice';
import { CreatePostInputProps, GiphyMedia } from '@/lib/types';
import { getFullName } from '@/lib/utils';
import useFileStore from '@/store/fileStore';
import usePostDialog from '@/store/postDialog';
import { useUser } from '@clerk/nextjs';
import { IGif } from '@giphy/js-types';
import { Fragment, useMemo } from 'react';
import PostMediaPreview from '../posts/PostMediaPreview';
import PostMediaTools from '../posts/PostMediaTools';
import UserAvatar from '../shared/UserAvatar';

const CreatePostInput = ({
  onTextareaChange,
  placeholder,
  textareaRef,
  value,
  setPostData,
  handleMentionSearch,
  getRootProps,
  getInputProps,
}: CreatePostInputProps) => {
  const { isMobile } = useDevice();
  const { user } = useUser();
  const { postData } = usePostDialog();
  const { threadMedia, setThreadMedia } = useFileStore();

  const userFullName = useMemo(
    () => getFullName(user?.firstName ?? '', user?.lastName ?? ''),
    [user]
  );

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
    setPostData({ ...postData });
    onTextareaChange(newValue);
  };

  const handleGifSelect = (gif: IGif) => {
    const newMedia: GiphyMedia = {
      id: gif.id,
      gif: gif,
      type: 'gif',
    };
    setThreadMedia(newMedia);
  };

  const clearMedia = () => {
    setThreadMedia(null);
  };

  return (
    <div className='flex space-x-3 mt-1'>
      <div className='relative flex flex-col items-center'>
        <UserAvatar
          image={user?.imageUrl || ''}
          username={user?.username!}
          fullname={userFullName}
        />
      </div>

      <div className='flex flex-col w-full gap-1.5 pb-4'>
        <Fragment>
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
            autoFocus
            className='max-h-[175px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent pr-4'
          />
          {threadMedia && (
            <PostMediaPreview
              type={threadMedia.type}
              url={
                threadMedia.type === 'gif'
                  ? threadMedia.gif.images.fixed_height.url
                  : threadMedia.preview
              }
              onRemove={clearMedia}
            />
          )}
        </Fragment>

        <PostMediaTools
          onGifSelect={handleGifSelect}
          onEmojiSelect={handleEmojiSelect}
          getRootProps={getRootProps}
          getInputProps={getInputProps}
        />
      </div>
    </div>
  );
};

export default CreatePostInput;
