import { Icons } from '@/components/icons';
import React from 'react';

export default function Loading() {
  return (
    <div className='h-[80vh] w-full flex-center'>
      <Icons.loading className='size-11' />
    </div>
  );
}
