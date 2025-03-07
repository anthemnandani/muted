'use client';

import NewCollection from '@/components/modals/NewCollection';
import React from 'react';

const ScrollContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <main
      id='main-scroll-container'
      className='relative h-screen overflow-y-scroll snap-y snap-mandatory smooth-scroll hide-scrollbar'
    >
      <div className='grid place-items-center min-h-screen'>
        <div className='h-full'>{children}</div>
      </div>
      <NewCollection />
    </main>
  );
};

export default ScrollContainer;
