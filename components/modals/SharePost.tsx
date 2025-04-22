import { SharePostProps } from '@/lib/types';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';

import { X } from 'lucide-react';
import ShareButton from '../buttons/ShareButton';
import { Card } from '../ui/card';

const SharePost: React.FC<SharePostProps> = ({ id, reposts }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <ShareButton />
      </DialogTrigger>
      <DialogContent
        isSecondDialog
        className='!max-w-[unset] w-[30rem] select-none border-none bg-transparent shadow-none outline-none z-[9999] box-content'
      >
        <DialogHeader>
          <DialogTitle>
            <VisuallyHidden.Root>Share To</VisuallyHidden.Root>
          </DialogTitle>
        </DialogHeader>
        <Card className='rounded-xl px-2 border-none bg-gray-6 shadow-2xl ring-1 ring-gray-7 ring-offset-0'>
          <div className='relative flex-center h-[52px] mb-5'>
            <h2 className='flex-1 text-center text-[17px] font-medium text-neutral-100 whitespace-nowrap overflow-hidden text-ellipsis'>
              Share to
            </h2>
            <button type='button' className='size-11 flex-center text-[24px]'>
              <X className='size-6 text-neutral-100' />
            </button>
          </div>
          <div className='flex items-center'>
            <div className='relative px-3 flex items-center'></div>
          </div>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default SharePost;
