'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { SettingsLayoutProps } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Fragment } from 'react';
import SettingSidebar from './SettingSidebar';

const SettingsLayout = ({
  sectionRefs,
  children,
  isLoading = false,
  isBlockOrMutePage = false,
}: SettingsLayoutProps) => {
  const router = useRouter();

  return (
    <div className='h-screen relative w-full flex flex-col overflow-hidden'>
      <div
        role='button'
        onClick={() => router.back()}
        className='cursor-pointer absolute top-8 left-[calc(50%_-_611px)] flex-center size-10 rounded-[50%]'
      >
        <ArrowLeft className='size-6' />
      </div>
      <div className='m-auto flex h-full w-full max-w-[1100px] flex-stretch pt-4'>
        {isLoading && !isBlockOrMutePage ? (
          <Fragment>
            <Skeleton className='relative flex-[0_0_356px] h-full' />
            <Skeleton className='relative flex-[0_0_728px] h-full' />
          </Fragment>
        ) : (
          <Fragment>
            <SettingSidebar sectionRefs={sectionRefs} />
            {isLoading && isBlockOrMutePage ? (
              <Skeleton className='relative flex-[0_0_728px] h-full' />
            ) : (
              <div
                id='scrollableDiv'
                className={cn(
                  'bg-gray-6 shadow-setting-panel rounded-t-lg flex-[0_0_728px]',
                  'pt-4 pb-6 px-6 overflow-y-auto hide-scrollbar'
                )}
              >
                {children}
              </div>
            )}
          </Fragment>
        )}
      </div>
    </div>
  );
};

export default SettingsLayout;
