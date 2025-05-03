'use client';

import { ReportHeaderProps } from '@/lib/types';
import { ChevronLeft, X } from 'lucide-react';

const ReportHeader = ({
  currentView,
  goBack,
  handleOpenChange,
}: ReportHeaderProps) => {
  if (currentView !== 'categories') {
    return (
      <div className='flex-between p-4 border-b border-zinc-800 h-fit'>
        <div className='flex items-center'>
          <button
            onClick={goBack}
            className='mr-3 rounded-full p-1 hover:bg-zinc-800/50'
          >
            <ChevronLeft className='size-5 text-white/90' />
          </button>
          <h2 className='text-xl font-bold text-white/90'>Report</h2>
        </div>
        <button
          type='button'
          className='rounded-full p-1 hover:bg-zinc-800'
          onClick={() => {
            handleOpenChange(false);
          }}
        >
          <X className='size-5 text-white/90 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-none' />
        </button>
      </div>
    );
  }

  return (
    <div className='flex-between p-4 border-b border-zinc-800'>
      <h2 className='text-xl font-bold text-white/90'>Report</h2>
      <button
        type='button'
        className='rounded-full p-1 hover:bg-zinc-800'
        onClick={() => {
          handleOpenChange(false);
        }}
      >
        <X className='size-5 text-white/90 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-none' />
      </button>
    </div>
  );
};

export default ReportHeader;
