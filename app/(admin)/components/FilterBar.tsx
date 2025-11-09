'use client';

import AdminFiltersSkeleton from '@/components/skeletons/AdminFiltersSkeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FilterBarProps } from '@/lib/types';
import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';

const FilterBar = ({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  onReset,
  children,
}: FilterBarProps) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <AdminFiltersSkeleton />;
  }

  return (
    <div className='rounded-lg border p-4'>
      <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
        <div className='flex flex-1 items-center gap-2'>
          <div className='relative w-full md:max-w-sm'>
            <Search className='pointer-events-none absolute left-2 top-2.5 size-4 text-muted-foreground' />
            <Input
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className='pl-8 focus-visible:ring-0 focus-visible:ring-offset-0'
            />
          </div>
        </div>
        <div className='flex flex-wrap items-center gap-2'>
          {children}
          <Button
            variant='ghost'
            size='sm'
            className='bg-primary-blue text-white hover:bg-primary-blue/90'
            onClick={onReset}
          >
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
