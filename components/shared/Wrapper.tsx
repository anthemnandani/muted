'use client';

import useWindow from '@/hooks/useWindow';
import { cn } from '@/lib/utils';
import React from 'react';

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  const { isMobile } = useWindow();
  return (
    <main className='flex justify-center h-screen'>
      <section className='w-full'>
        <div className='w-full md:max-w-[550px] mx-auto relative'>
          <div
            className={cn(
              'min-h-screen',
              !isMobile &&
                'bg-gray-6 border-gray-5 shadow-lg rounded-tl-[25px] rounded-tr-[25px]'
            )}
          >
            {children}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Wrapper;
