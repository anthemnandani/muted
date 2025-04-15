'use client';

import useMentions from '@/hooks/useMentions';
import { cn } from '@/lib/utils';
import { useUser } from '@clerk/nextjs';
import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import UsersMenu from '../menus/UsersMenu';
import { EmojiPicker } from '../modals/EmojiPicker';
import { Avatar, AvatarImage } from '../ui/avatar';
import { CommentInputProps } from '@/lib/types';

const CommentInput = ({
  placeholder,
  textValue,
  onTextChange,
  onSubmit,
  charCount,
  maxChars,
  isSubmitting,
  showCancelButton = false,
  onCancel,
  isEdit,
}: CommentInputProps) => {
  const { user } = useUser();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isAtLimit = charCount >= maxChars;

  const {
    mentionSuggestions,
    showMentionSuggestions,
    cursorPosition,
    handleMentionSearch,
    isMentionsLoading,
    insertMention,
  } = useMentions({
    textareaRef,
    setCommentText: onTextChange,
  });

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = textareaRef.current.scrollHeight;
      const baseHeight = 24;

      const lineCount = Math.ceil(newHeight / baseHeight);
      const hasMultipleLines = lineCount > 1;

      if (hasMultipleLines) {
        textareaRef.current.style.height = `${Math.min(newHeight, 170)}px`;
      } else {
        textareaRef.current.style.height = '24px';
      }
    }
  }, [textValue]);

  const hasText = textValue.length > 0;

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    handleMentionSearch(text, e.target.selectionStart || 0);
    if (text.length <= maxChars) {
      onTextChange(text);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const newText = textValue + pastedText;
    const trimmedText = newText.slice(0, maxChars);

    onTextChange(trimmedText);
  };

  const handleEmojiSelect = (emoji: string) => {
    const newText = textValue + emoji;
    if (newText.length <= maxChars) {
      onTextChange(newText);
    }
  };

  return (
    <div className='relative flex items-center gap-2'>
      <Avatar className='flex-shrink-0 size-8'>
        <AvatarImage
          src={user?.imageUrl ?? ''}
          alt={user?.username ?? ''}
          className='object-cover'
        />
      </Avatar>

      <div className='relative flex-1'>
        <div className='flex items-center bg-white-13 rounded-lg px-3 pr-16'>
          <textarea
            ref={textareaRef}
            placeholder={placeholder}
            value={textValue}
            onChange={handleInputChange}
            onPaste={handlePaste}
            rows={1}
            autoFocus
            maxLength={maxChars}
            className={cn(
              'w-full text-sm resize-none bg-transparent text-white placeholder-gray-400 outline-none py-2 overflow-hidden',
              hasText ? 'pb-7' : ''
            )}
          />

          <div className='absolute bottom-2 right-3 flex items-center gap-2'>
            <EmojiPicker onChange={handleEmojiSelect} />
            {showCancelButton && (
              <button
                onClick={onCancel}
                className='text-gray-400 hover:text-gray-200 ml-1'
                title='Cancel'
              >
                <X className='size-4' />
              </button>
            )}
          </div>
        </div>

        {hasText && (
          <div
            className={cn(
              `text-xs absolute bottom-2 left-3`,
              isAtLimit ? 'text-primary-blue' : 'text-gray-400'
            )}
          >
            {charCount}/{maxChars}
          </div>
        )}

        {showMentionSuggestions && (
          <UsersMenu
            showMentionSuggestions={showMentionSuggestions}
            mentionSuggestions={mentionSuggestions}
            cursorPosition={cursorPosition}
            isLoading={isMentionsLoading}
            onSelect={insertMention}
          />
        )}
      </div>

      <button
        onClick={onSubmit}
        disabled={isSubmitting || !textValue.trim()}
        className={`font-medium px-2 text-sm ${
          !textValue.trim() || isSubmitting
            ? 'text-gray-600'
            : 'text-primary-blue'
        }`}
      >
        {isEdit ? 'Update' : 'Post'}
      </button>
    </div>
  );
};

export default CommentInput;
