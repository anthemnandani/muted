'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import useDevice from '@/hooks/useDevice';
import usePostDialog from '@/store/postDialog';
import { useUser } from '@clerk/nextjs';
import { useRef } from 'react';
import { EmojiPicker } from '../EmojiPicker';

const CreatePost = () => {
  const { user } = useUser();
  const maxLength = 2200;

  const { postData, setPostData } = usePostDialog();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { isMobile } = useDevice();

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPostData({ ...postData, text: e.target.value });
  };

  const handleEmojiSelect = (emoji: string) => {
    const cursorPosition = textareaRef.current?.selectionStart || 0;
    const newText =
      postData.text.slice(0, cursorPosition) +
      emoji +
      postData.text.slice(cursorPosition);

    handleTextareaChange({
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

  const handleSwitchChange = (key: 'hideLikes' | 'turnOffComments') => {
    setPostData({
      ...postData,
      [key]: !postData[key],
    });
  };

  return (
    <div className='p-4'>
      <div className='flex items-center space-x-3 mb-4'>
        <Avatar className='size-7 rounded-full object-cover flex-center'>
          <AvatarImage
            src={user?.imageUrl ?? ''}
            alt={user?.fullName ?? ''}
            className='rounded-full w-full h-full object-cover'
          />
          <AvatarFallback className='flex-center'>
            {user?.username?.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span className='font-medium text-white/90 text-sm truncate'>
          {user?.username}
        </span>
      </div>
      <div className='mb-4'>
        <textarea
          value={postData.text}
          onChange={handleTextareaChange}
          className='w-full h-48 bg-transparent text-white/90 placeholder-gray-400 resize-none focus:outline-none text-sm leading-relaxed overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent'
          maxLength={maxLength}
          ref={textareaRef}
          autoFocus
        />
      </div>

      <div className='flex-between mb-6 relative'>
        <EmojiPicker onChange={handleEmojiSelect} />
        <span className='text-xs text-gray-400'>
          {postData.text.length}/{maxLength}
        </span>
      </div>
      <div className='space-y-4'>
        <div className='flex-between'>
          <span className='text-sm text-white/90'>
            Hide like count on this post
          </span>
          <Switch
            checked={postData.hideLikes}
            onCheckedChange={() => handleSwitchChange('hideLikes')}
          />
        </div>

        <div className='flex-between'>
          <span className='text-sm text-white/90'>Turn off commenting</span>
          <Switch
            checked={postData.turnOffComments}
            onCheckedChange={() => handleSwitchChange('turnOffComments')}
          />
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
