'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/trpc/react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Fragment, useRef } from 'react';
import SettingPanel from './components/SettingPanel';
import SettingSidebar from './components/SettingSidebar';

const SettingClient = () => {
  const router = useRouter();
  const { data: user, isLoading } = api.user.getMe.useQuery();

  const sectionRefs = {
    'manage-account': useRef<HTMLDivElement>(null),
    privacy: useRef<HTMLDivElement>(null),
    'push-notifications': useRef<HTMLDivElement>(null),
    'content-preferences': useRef<HTMLDivElement>(null),
    about: useRef<HTMLDivElement>(null),
  };

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
        {isLoading ? (
          <Fragment>
            <Skeleton className='relative flex-[0_0_356px] h-full' />
            <Skeleton className='relative flex-[0_0_728px] h-full' />
          </Fragment>
        ) : (
          <Fragment>
            <SettingSidebar sectionRefs={sectionRefs} />
            <SettingPanel sectionRefs={sectionRefs} user={user} />
          </Fragment>
        )}
      </div>
    </div>
  );
};

export default SettingClient;
