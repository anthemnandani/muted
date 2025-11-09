'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ContentType, PostStatusFilter } from '@/lib/types';
import { useAdminFiltersStore } from '@/store/adminFiltersStore';
import FilterBar from './FilterBar';

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

  return (
    <FilterBar
      searchValue={postSearch}
      onSearchChange={setPostSearch}
      searchPlaceholder='Search by description or author'
      onReset={resetPostFilters}
    >
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
    </FilterBar>
  );
};

export default ContentFilters;
