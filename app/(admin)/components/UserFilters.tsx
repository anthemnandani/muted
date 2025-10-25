'use client';

import AdminContentFiltersSkeleton from '@/components/skeletons/AdminContentFiltersSkeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { UserStatusFilter } from '@/lib/types';
import { useAdminFiltersStore } from '@/store/adminFiltersStore';
import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';

const UserFilters = () => {
  const {
    userSearch,
    userStatus,
    setUserSearch,
    setUserStatus,
    resetPostFilters,
  } = useAdminFiltersStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <AdminContentFiltersSkeleton />;
  }
  return (
    <div className='rounded-lg border p-4'>
      <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
        <div className='flex flex-1 items-center gap-2'>
          <div className='relative w-full md:max-w-sm'>
            <Search className='pointer-events-none absolute left-2 top-2.5 size-4 text-muted-foreground' />
            <Input
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder='Search by username or full name'
              className='pl-8 focus-visible:ring-0 focus-visible:ring-offset-0'
            />
          </div>
        </div>

        <Select
          value={userStatus}
          onValueChange={(v) => setUserStatus(v as UserStatusFilter)}
        >
          <SelectTrigger className='w-[150px]'>
            <SelectValue placeholder='Status' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='ALL'>All statuses</SelectItem>
            <SelectItem value='ACTIVE'>Active</SelectItem>
            <SelectItem value='SUSPENDED'>Suspended</SelectItem>
            <SelectItem value='BANNED'>Banned</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant='ghost'
          size='sm'
          className='bg-primary-blue text-white hover:bg-primary-blue/90'
          onClick={resetPostFilters}
        >
          Reset
        </Button>
      </div>
    </div>
  );
};

export default UserFilters;
