'use client';

import { EmojiPickerProps } from '@/lib/types';
import { cn } from '@/lib/utils';
import data from '@emoji-mart/data/';
import Picker from '@emoji-mart/react';
import { Smile } from 'lucide-react';
import { Fragment, useEffect, useRef, useState } from 'react';

export function EmojiPicker({ onChange, isComment = false }: EmojiPickerProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node) &&
        !triggerRef.current?.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  return (
    <Fragment>
      <div
        ref={triggerRef}
        onClick={() => {
          setOpen(!open);
        }}
        className='text-gray-400 flex gap-1 select-none items-center text-[15px] cursor-pointer'
      >
        <Smile className='size-5 select-none transform active:scale-75 transition-transform' />
      </div>

      {open && (
        <div
          ref={pickerRef}
          className={cn(
            'absolute z-[9999] top-[100px] left-[75px]',
            isComment && '-top-[455px]'
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <Picker
            data={data}
            onEmojiSelect={(emoji: any) => {
              onChange?.(emoji.native);
            }}
            theme='dark'
            perLine={9}
            maxFrequentRows={1}
            skinTonePosition='none'
            previewPosition='none'
            navPosition='bottom'
          />
        </div>
      )}
    </Fragment>
  );
}
