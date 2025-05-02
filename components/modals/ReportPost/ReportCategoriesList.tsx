'use client';

import { ReportCategoriesListProps } from '@/lib/types';
import { ChevronRight } from 'lucide-react';

const ReportCategoriesList = ({
  title,
  items,
  onSelect,
}: ReportCategoriesListProps) => {
  return (
    <div className='px-2 mb-2'>
      <div className='pl-2 pb-2 h-[22px] leading-[22px] text-white/75'>
        {title}
      </div>

      {items.map((item) => (
        <button
          key={item.id}
          className='w-[calc(100%-8px)] mr-2 flex-between px-2 py-4 hover:bg-zinc-800 transition-colors rounded-lg break-all'
          onClick={() => onSelect(item)}
        >
          <span className='text-white/90'>{item.label}</span>
          <ChevronRight className='size-5 text-white/75 ml-2' />
        </button>
      ))}
    </div>
  );
};

export default ReportCategoriesList;
