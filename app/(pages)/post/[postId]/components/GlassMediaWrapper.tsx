'use client';

import Image from 'next/image';

interface GlassMediaWrapperProps {
  children: React.ReactNode;
  thumbnailUrl?: string;
}

const GlassMediaWrapper = ({
  children,
  thumbnailUrl,
}: GlassMediaWrapperProps) => {
  return (
    <div className='relative w-full h-full flex-center bg-black overflow-hidden'>
      {thumbnailUrl && (
        <div className='absolute inset-0 z-0'>
          <Image
            src={thumbnailUrl}
            alt='Background blur'
            fill
            className='object-cover blur-3xl opacity-40 scale-110'
            quality={10}
          />
          <div className='absolute inset-0 bg-black/20' />
        </div>
      )}

      <div className='relative z-10 h-full w-full max-w-full flex-center p-4'>
        <div className='relative h-full w-full flex-center justify-center'>
          {children}
        </div>
      </div>
    </div>
  );
};

export default GlassMediaWrapper;
