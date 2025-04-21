'use client';

import useMentions from '@/hooks/useMentions';
import { CommentInputProps } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useUser } from '@clerk/nextjs';
import { X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import UsersMenu from '../menus/UsersMenu';
import { EmojiPicker } from '../modals/EmojiPicker';
import { Avatar, AvatarImage } from '../ui/avatar';

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
  replyToUsername,
}: CommentInputProps) => {
  const { user } = useUser();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isAtLimit = charCount >= maxChars;
  const [hasPrefixedReply, setHasPrefixedReply] = useState(false);

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

  useEffect(() => {
    if (replyToUsername && !hasPrefixedReply && !isEdit) {
      const prefixedText = `@${replyToUsername} `;
      onTextChange(prefixedText);
      setHasPrefixedReply(true);

      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(
            prefixedText.length,
            prefixedText.length
          );
        }
      }, 0);
    }
  }, [replyToUsername, hasPrefixedReply, onTextChange, isEdit]);

  const hasText = textValue.length > 0;

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    const cursorPos = e.target.selectionStart || 0;

    if (replyToUsername && text.indexOf(`@${replyToUsername}`) !== 0) {
      const preservedPrefix = `@${replyToUsername} `;
      const newText = preservedPrefix + text.substring(cursorPos);
      onTextChange(newText);
      setTimeout(() => {
        if (textareaRef.current) {
          const newPos = Math.max(preservedPrefix.length, cursorPos);
          textareaRef.current.setSelectionRange(newPos, newPos);
        }
      }, 0);

      return;
    }

    handleMentionSearch(text, cursorPos);
    if (text.length <= maxChars) {
      onTextChange(text);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');

    if (replyToUsername) {
      const prefixedReply = `@${replyToUsername} `;
      const cursorPos = textareaRef.current?.selectionStart || 0;

      if (cursorPos >= prefixedReply.length) {
        const beforeCursor = textValue.substring(0, cursorPos);
        const afterCursor = textValue.substring(cursorPos);
        const newText = beforeCursor + pastedText + afterCursor;

        const trimmedText = newText.slice(0, maxChars);
        onTextChange(trimmedText);

        setTimeout(() => {
          if (textareaRef.current) {
            const newPos = cursorPos + pastedText.length;
            textareaRef.current.setSelectionRange(newPos, newPos);
          }
        }, 0);
      }
    } else {
      const newText = textValue + pastedText;
      const trimmedText = newText.slice(0, maxChars);
      onTextChange(trimmedText);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    if (replyToUsername) {
      const prefixedReply = `@${replyToUsername} `;
      const cursorPos = textareaRef.current?.selectionStart || 0;

      if (cursorPos >= prefixedReply.length) {
        const beforeCursor = textValue.substring(0, cursorPos);
        const afterCursor = textValue.substring(cursorPos);
        const newText = beforeCursor + emoji + afterCursor;

        if (newText.length <= maxChars) {
          onTextChange(newText);
          setTimeout(() => {
            if (textareaRef.current) {
              const newPos = cursorPos + emoji.length;
              textareaRef.current.setSelectionRange(newPos, newPos);
            }
          }, 0);
        }
      }
    } else {
      const newText = textValue + emoji;
      if (newText.length <= maxChars) {
        onTextChange(newText);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (replyToUsername) {
      const prefixedReply = `@${replyToUsername} `;
      const cursorPos = textareaRef.current?.selectionStart || 0;
      if (
        (e.key === 'Backspace' && cursorPos <= prefixedReply.length) ||
        (e.key === 'Delete' && cursorPos < prefixedReply.length) ||
        ((e.key === 'Backspace' || e.key === 'Delete') &&
          textareaRef.current?.selectionStart !==
            textareaRef.current?.selectionEnd &&
          (textareaRef.current?.selectionStart || 0) < prefixedReply.length)
      ) {
        e.preventDefault();
        return;
      }
      if (e.key === 'a' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();

        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.setSelectionRange(
              prefixedReply.length,
              textValue.length
            );
          }
        }, 0);
        return;
      }
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
            onKeyDown={handleKeyDown}
            rows={1}
            autoFocus
            maxLength={maxChars}
            className={cn(
              'w-full text-sm resize-none bg-transparent text-white placeholder-gray-400 outline-none py-2 overflow-hidden',
              hasText ? 'pb-7' : ''
            )}
          />

          <div className='absolute bottom-2 right-3 flex items-center gap-2'>
            <EmojiPicker onChange={handleEmojiSelect} isComment />
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
