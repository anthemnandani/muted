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
import type { ContentType, PostStatusFilter } from '@/lib/types';
import { useAdminFiltersStore } from '@/store/adminFiltersStore';
import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';

const ContentFilters = () => {
  const {
    postSearch,
    postType,
    postStatus,
    setPostSearch,
    setPostType,
    setPostStatus,
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
              value={postSearch}
              onChange={(e) => setPostSearch(e.target.value)}
              placeholder='Search by description or author'
              className='pl-8 focus-visible:ring-0 focus-visible:ring-offset-0'
            />
          </div>
        </div>

        <div className='flex flex-wrap items-center gap-2'>
          <Select
            value={postType}
            onValueChange={(v) => setPostType(v as ContentType)}
          >
            <SelectTrigger className='w-[150px]'>
              <SelectValue placeholder='Content Type' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='ALL'>All types</SelectItem>
              <SelectItem value='IMAGE'>Image</SelectItem>
              <SelectItem value='VIDEO'>Video</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={postStatus}
            onValueChange={(v) => setPostStatus(v as PostStatusFilter)}
          >
            <SelectTrigger className='w-[150px]'>
              <SelectValue placeholder='Status' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='ALL'>All statuses</SelectItem>
              <SelectItem value='VISIBLE'>Visible</SelectItem>
              <SelectItem value='HIDDEN'>Hidden</SelectItem>
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
    </div>
  );
};

export default ContentFilters;
