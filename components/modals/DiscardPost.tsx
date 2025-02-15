'use client';

import { DialogTitle } from '@radix-ui/react-dialog';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { useState } from 'react';
import { Icons } from '../icons';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from '../ui/dialog';

const DiscardPost = ({ discardPost }: { discardPost: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button aria-label='Discard Post' type='button' className='font-normal'>
          <Icons.cancel className='size-5 text-white' />
        </button>
      </DialogTrigger>
      <DialogContent
        isSecondDialog
        className='w-full !max-w-[350px] select-none border-none bg-transparent shadow-none outline-none z-[1001] box-content'
      >
        <DialogHeader>
          <DialogTitle>
            <VisuallyHidden.Root>Discard Post</VisuallyHidden.Root>
          </DialogTitle>
        </DialogHeader>
        <Card className='rounded-2xl border-none bg-background dark:bg-gray-6 shadow-2xl ring-1 ring-gray-7 ring-offset-0'>
          <div className='w-full text-center px-6 pt-6 pb-5'>
            <div className='font-normal text-xl pb-2'>Discard post?</div>
            <p className='text-[15px] text-gray-3'>
              If you leave, your media will be discarded.
            </p>
          </div>
          <div className='flex-between w-full border-t-[0.8px] border-t-gray-7'>
            <Button
              variant='ghost'
              className='flex-1 font-normal text-base rounded-none rounded-l-2xl h-[54px] border-r-[0.8px] border-r-gray-7 ring-0 hover:bg-transparent'
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant='ghost'
              className='flex-1 text-base font-normal text-primary-red hover:text-primary-red/80 transition-colors rounded-none rounded-r-2xl h-[54px] ring-0 hover:bg-transparent'
              onClick={() => {
                setIsOpen(false);
                discardPost();
              }}
            >
              Discard
            </Button>
          </div>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default DiscardPost;
