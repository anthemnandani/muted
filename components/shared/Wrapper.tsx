'use client';

import useWindow from '@/hooks/useWindow';
import { cn } from '@/lib/utils';
import React from 'react';

const Wrapper = ({
  children,
  isSearch,
}: {
  children: React.ReactNode;
  isSearch?: boolean;
}) => {
  const { isMobile } = useWindow();
  return (
    <main className='flex justify-center h-screen'>
      <section className='w-full'>
        <div
          className={cn(
            'w-full md:max-w-[600px] mx-auto relative',
            isSearch && 'mt-4',
          )}
        >
          <div
            className={cn(
              'min-h-screen',
              !isMobile &&
                'bg-gray-6 border-gray-5 shadow-lg rounded-tl-[25px] rounded-tr-[25px]',
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
