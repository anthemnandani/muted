'use client';

import { cn } from '@/lib/utils';
import { Image, Send, SmileIcon } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface MessageInputProps {
  value: string;
  setIsMultiLine: (isMultiLine: boolean) => void;
  isMultiLine: boolean;
  onChange: (e: React.FormEvent<HTMLDivElement>) => void;
  onSubmit: (e?: React.FormEvent) => void;
  loading: boolean;
  placeholder?: string;
}

const MessageInput: React.FC<MessageInputProps> = ({
  value,
  setIsMultiLine,
  isMultiLine,
  onChange,
  onSubmit,
  loading,
  placeholder = 'Type a message...',
}) => {
  const contentEditableRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() && !loading) {
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
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  useEffect(() => {
    const element = contentEditableRef.current;
    if (element) {
      element.focus();
    }
  }, []);

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
        element.setAttribute('data-placeholder', placeholder);
      } else {
        element.removeAttribute('data-placeholder');
      }
    }
  }, [value, placeholder]);

  const characterCount = value.length;
  const isOverLimit = characterCount > 6000;

  return (
    <div className='flex flex-col w-full px-4 py-3'>
      <div className='flex items-end w-full'>
        <div
          className={cn(
            'relative flex flex-1 items-end w-full',
            'bg-white/10 border border-transparent rounded-lg',
            'min-h-11'
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
              contentEditable
              role='textbox'
              aria-label={placeholder}
              className={cn(
                'outline-none select-text whitespace-pre-wrap break-words',
                'text-white/90 text-[15px] leading-[18px]',
                'min-h-[18px] max-h-[108px] overflow-y-auto',
                'before:content-[attr(data-placeholder)] before:text-white/50',
                'before:absolute before:pointer-events-none',
                '[&:not([data-placeholder])]:before:content-none'
              )}
              onInput={onChange}
              onPaste={handlePaste}
              onKeyDown={handleKeyDown}
            />
          </div>

          {isMultiLine && (
            <div className='absolute left-4 bottom-1 text-white/50 text-[14px] leading-[18px]'>
              {characterCount}/6000
            </div>
          )}

          <div className='absolute right-3 bottom-2 flex items-center gap-2'>
            <Image className='size-6 text-white/70 hover:text-white/90 cursor-pointer transition-colors' />
            <SmileIcon className='size-6 text-white/70 hover:text-white/90 cursor-pointer transition-colors' />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!value.trim() || loading || isOverLimit}
          className={cn(
            'ml-3 mb-1 p-2 rounded-full transition-all duration-200',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            !value.trim() || loading || isOverLimit
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
