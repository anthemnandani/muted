'use client';

import useSettingStore from '@/store/settingStore';
import { X } from 'lucide-react';

const DeleteUserHeader = ({
  title,
  icon,
}: {
  title: string;
  icon?: React.ReactNode;
}) => {
  const setIsOpen = useSettingStore((state) => state.setIsOpen);
  return (
    <div className='flex-between p-6 border-b border-zinc-800'>
      <div className='flex items-center gap-2'>
        {icon}
        <h2 className='text-2xl font-bold text-white/90'>{title}</h2>
      </div>
      <button
        title='Close'
        type='button'
        className='rounded-full p-1 hover:bg-zinc-800'
        onClick={() => {
          setIsOpen(false);
        }}
      >
        <X className='size-5 text-white/90 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-none' />
      </button>
    </div>
  );
};

export default DeleteUserHeader;
