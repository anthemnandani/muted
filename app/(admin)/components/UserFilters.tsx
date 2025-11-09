'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { UserStatusFilter } from '@/lib/types';
import { useAdminFiltersStore } from '@/store/adminFiltersStore';
import FilterBar from './FilterBar';

const UserFilters = () => {
  const {
    userSearch,
    userStatus,
    setUserSearch,
    setUserStatus,
    resetUserFilters,
  } = useAdminFiltersStore();

  return (
    <FilterBar
      searchValue={userSearch}
      onSearchChange={setUserSearch}
      searchPlaceholder='Search by username or full name'
      onReset={resetUserFilters}
    >
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
    </FilterBar>
  );
};

export default UserFilters;
