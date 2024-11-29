'use client';

import useWindow from '@/hooks/useWindow';
import { cn } from '@/lib/utils';
import data from '@emoji-mart/data/';
import Picker from '@emoji-mart/react';
import { Smile } from 'lucide-react';
import { useTheme } from 'next-themes';
import React from 'react';

interface EmojiPickerProps {
  onChange?: (emoji: string) => void;
}

export function EmojiPicker({ onChange }: EmojiPickerProps) {
  const [open, setOpen] = React.useState(false);
  const { isMobile } = useWindow();
  const { theme } = useTheme();
  const triggerRef = React.useRef<HTMLDivElement>(null);
  const pickerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
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
    <>
      <div
        ref={triggerRef}
        onClick={() => {
          setOpen(!open);
        }}
        className='text-gray-3 flex gap-1 select-none items-center text-[15px] cursor-pointer'
      >
        <Smile className='size-5 select-none transform active:scale-75 transition-transform' />
      </div>

      {open && (
        <div
          ref={pickerRef}
          className={cn(
            'absolute z-[9999] top-[110px]',
            isMobile ? 'left-16' : 'left-[120px]'
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <Picker
            data={data}
            onEmojiSelect={(emoji: any) => {
              onChange?.(emoji.native);
            }}
            theme={theme}
            emojiSize={isMobile ? 20 : 24}
            emojiButtonSize={isMobile ? 28 : 36}
            perLine={isMobile ? 8 : 9}
          />
        </div>
      )}
    </>
  );
}
