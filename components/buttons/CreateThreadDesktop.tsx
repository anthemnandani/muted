import React from 'react';
import { Icons } from '../icons';
import { cn } from '@/lib/utils';

const CreateThreadDesktop = () => {
  return (
    <div
      className={cn(
        'fixed bottom-6 right-6 bg-gray-6  border border-border-light',
        'rounded-2xl shadow-lg cursor-pointer flex-center w-[82px] h-[68px]',
        'transform transition-all duration-300 ease-in-out hover:scale-110',
      )}
    >
      <Icons.plus className='size-6' />
    </div>
  );
};

export default CreateThreadDesktop;
