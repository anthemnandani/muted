import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import React from 'react';

export default function Loader({ className }: { className?: string }) {
  return (
    <div className={cn('h-[75vh] md:h-screen w-full flex-center', className)}>
      <Icons.loading className='size-11' />
    </div>
  );
}
