'use client';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { UploadStepProps } from '@/lib/types';
import { cn } from '@/lib/utils';

const UploadStep = ({
  getRootProps,
  getInputProps,
  isDragActive,
}: UploadStepProps) => {
  return (
    <div
      {...getRootProps()}
      className='w-full h-full flex-col-center transition-colors'
    >
      <input {...getInputProps()} />
      <Icons.media
        className={cn(
          'mb-4 w-24 h-[77px] text-neutral-100',
          isDragActive && 'text-primary-blue'
        )}
      />
      <span className='text-base sm:text-xl text-neutral-100 text-center'>
        Drag photos and videos here
      </span>
      <Button
        className='bg-primary-blue hover:bg-primary-blue/90 text-neutral-100 transition-colors duration-150 mt-4 sm:mt-6'
        variant='default'
      >
        Select from computer
      </Button>
    </div>
  );
};

export default UploadStep;
