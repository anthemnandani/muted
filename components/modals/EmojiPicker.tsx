'use client';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { EmojiPickerProps } from '@/lib/types';
import data from '@emoji-mart/data/';
import Picker from '@emoji-mart/react';
import { Smile } from 'lucide-react';
import { useState } from 'react';

const EmojiPicker = ({ onChange }: EmojiPickerProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <div
          role='button'
          className='text-gray-3 flex cursor-pointer select-none items-center gap-1 text-[15px]'
        >
          <Smile className='size-5 select-none transform transition-transform active:scale-75' />
        </div>
      </PopoverTrigger>
      <PopoverContent
        side='top'
        sideOffset={10}
        className='z-[9999] w-auto border-none bg-transparent p-0 shadow-none'
      >
        <Picker
          data={data}
          onEmojiSelect={(emoji: any) => {
            onChange?.(emoji.native);
            setOpen(false);
          }}
          theme='dark'
          perLine={9}
          maxFrequentRows={1}
          skinTonePosition='none'
          previewPosition='none'
          navPosition='top'
        />
      </PopoverContent>
    </Popover>
  );
};

export default EmojiPicker;
