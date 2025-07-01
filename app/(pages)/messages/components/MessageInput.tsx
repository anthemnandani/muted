'use client';

import { EmojiPicker } from '@/components/modals/EmojiPicker';
import { MessageInputProps } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Image, Send } from 'lucide-react';
import { useEffect, useRef } from 'react';

const MessageInput: React.FC<MessageInputProps> = ({
  value,
  setIsMultiLine,
  isMultiLine,
  onChange,
  onSubmit,
  loading,
  placeholder = 'Type a message...',
  disabled = false,
}) => {
  const contentEditableRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() && !loading && !disabled) {
      onSubmit();
      if (contentEditableRef.current) {
        contentEditableRef.current.style.height = 'auto';
        setIsMultiLine(false);
        setTimeout(() => {
          contentEditableRef.current?.focus();
        }, 0);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    if (disabled) {
      e.preventDefault();
      return;
    }

    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');

    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();

      const textNode = document.createTextNode(text);
      range.insertNode(textNode);

      range.setStartAfter(textNode);
      range.setEndAfter(textNode);
      range.collapse(false);

      selection.removeAllRanges();
      selection.addRange(range);
    }

    const inputEvent = new Event('input', { bubbles: true });
    e.currentTarget.dispatchEvent(inputEvent);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) {
      e.preventDefault();
      return;
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    if (disabled || !contentEditableRef.current) return;

    const element = contentEditableRef.current;
    const selection = window.getSelection();

    element.focus();

    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();

      const emojiNode = document.createTextNode(emoji);
      range.insertNode(emojiNode);

      range.setStartAfter(emojiNode);
      range.setEndAfter(emojiNode);
      range.collapse(false);

      selection.removeAllRanges();
      selection.addRange(range);
    } else {
      element.innerText += emoji;

      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(element);
      range.collapse(false);
      sel?.removeAllRanges();
      sel?.addRange(range);
    }

    const inputEvent = new Event('input', { bubbles: true });
    element.dispatchEvent(inputEvent);
  };

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    onChange(e.currentTarget.innerText, e.currentTarget);
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLDivElement>) => {
    if (disabled) {
      e.preventDefault();
      e.currentTarget.blur();
      return;
    }
  };

  useEffect(() => {
    const element = contentEditableRef.current;
    if (element && !disabled) {
      element.focus();
    }
  }, [disabled]);

  useEffect(() => {
    const element = contentEditableRef.current;
    if (element && element.innerText !== value) {
      element.innerText = value;
    }
  }, [value]);

  useEffect(() => {
    const element = contentEditableRef.current;
    if (element) {
      if (!value.trim()) {
        const placeholderText = disabled ? 'Chat is disabled...' : placeholder;
        element.setAttribute('data-placeholder', placeholderText);
      } else {
        element.removeAttribute('data-placeholder');
      }
    }
  }, [value, placeholder, disabled]);

  const characterCount = value.length;
  const isOverLimit = characterCount > 6000;
  const isInputDisabled = disabled || loading;

  return (
    <div className='flex flex-col w-full px-4 py-3'>
      {disabled && (
        <div className='mb-2 px-3 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded-md'>
          <p className='text-yellow-200 text-xs text-center'>
            Reconnecting to chat server...
          </p>
        </div>
      )}

      <div className='flex items-end w-full'>
        <div
          className={cn(
            'relative flex flex-1 items-end w-full',
            'border border-transparent rounded-lg',
            'min-h-11 transition-all duration-200',
            isInputDisabled
              ? 'bg-white/5 border-white/5'
              : 'bg-white/10 border-transparent hover:bg-white/15'
          )}
        >
          <div
            className={cn(
              'flex-1 pl-4 pr-20 relative',
              isMultiLine ? 'py-2.5 pb-8' : 'py-2.5'
            )}
          >
            <div
              ref={contentEditableRef}
              contentEditable={!isInputDisabled}
              suppressContentEditableWarning={true}
              role='textbox'
              aria-label={disabled ? 'Chat disabled' : placeholder}
              tabIndex={isInputDisabled ? -1 : 0}
              className={cn(
                'outline-none select-text whitespace-pre-wrap break-words',
                'text-[15px] leading-[18px]',
                'min-h-[18px] max-h-[108px] overflow-y-auto',
                'before:content-[attr(data-placeholder)] before:pointer-events-none',
                'before:absolute',
                '[&:not([data-placeholder])]:before:content-none',
                'transition-all duration-200',
                isInputDisabled
                  ? 'text-white/40 cursor-not-allowed before:text-white/30'
                  : 'text-white/90 cursor-text before:text-white/50'
              )}
              onInput={handleInput}
              onPaste={handlePaste}
              onKeyDown={handleKeyDown}
              onClick={handleClick}
              onFocus={handleFocus}
            />
          </div>

          {isMultiLine && !disabled && (
            <div className='absolute left-4 bottom-1 text-white/50 text-[14px] leading-[18px]'>
              {characterCount}/6000
            </div>
          )}

          <div className='absolute right-3 bottom-2 flex items-center gap-2'>
            <Image className='size-6 transition-colors cursor-pointer text-white/70 hover:text-white/90' />
            <EmojiPicker isComment onChange={handleEmojiSelect} />
          </div>
        </div>

        <button
          type='button'
          title='Send'
          onClick={handleSubmit}
          disabled={!value.trim() || isInputDisabled || isOverLimit}
          className={cn(
            'ml-3 mb-1 p-2 rounded-full transition-all duration-200',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            !value.trim() || isInputDisabled || isOverLimit
              ? 'text-white/40'
              : 'text-primary-blue hover:bg-white/5'
          )}
        >
          <Send className='size-6' fill='currentColor' />
        </button>
      </div>
    </div>
  );
};

export default MessageInput;
