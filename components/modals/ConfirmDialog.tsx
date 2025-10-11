'use client';

import type { ConfirmDialogProps } from '@/lib/types';
import { cn } from '@/lib/utils';
import { DialogTitle } from '@radix-ui/react-dialog';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { Icons } from '../icons';
import MenuItem from '../shared/MenuItem';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from '../ui/dialog';

const ConfirmDialog = ({
  title,
  description,
  open,
  setOpen,
  onClick,
  isLoading,
  trigger,
  btnClassName,
  closeMenu,
  btnTitle = 'Delete',
}: ConfirmDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild className='w-full'>
        {trigger ?? (
          <MenuItem
            icon={Icons.delete}
            label='Delete'
            className='text-primary-red focus:text-primary-red'
          />
        )}
      </DialogTrigger>
      <DialogContent
        isSecondDialog
        className='w-full !max-w-[320px] select-none border-none bg-transparent shadow-none outline-none z-[1001] box-content'
      >
        <DialogHeader>
          <DialogTitle>
            <VisuallyHidden.Root>{title}</VisuallyHidden.Root>
          </DialogTitle>
        </DialogHeader>
        <Card className='rounded-2xl border-none bg-background dark:bg-gray-6 shadow-2xl ring-1 ring-gray-7 ring-offset-0'>
          <div className='w-full text-center px-4 pt-6 pb-5'>
            <div className='font-bold text-lg'>{title}?</div>
            <p className='text-[15px] pt-3 text-white/50'>{description}</p>
          </div>
          <div className='flex-between w-full border-t-[0.8px] border-t-border-dark dark:border-t-gray-7'>
            <Button
              variant='ghost'
              className='flex-1 font-normal text-base rounded-none rounded-l-2xl h-[54px] border-r-[0.8px] border-r-border-dark dark:border-r-gray-7 ring-0 hover:bg-transparent'
              onClick={() => {
                setOpen(false);
                closeMenu();
              }}
            >
              Cancel
            </Button>
            <Button
              variant='ghost'
              className={cn(
                'flex-1 text-base text-primary-red hover:text-primary-red/75 font-bold rounded-none rounded-r-2xl h-[54px] ring-0 hover:bg-transparent',
                btnClassName
              )}
              onClick={onClick}
              disabled={isLoading}
            >
              {btnTitle}
            </Button>
          </div>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmDialog;
