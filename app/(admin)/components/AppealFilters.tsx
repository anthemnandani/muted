'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { AppealStatusFilter } from '@/lib/types';
import { useAdminFiltersStore } from '@/store/adminFiltersStore';
import FilterBar from './FilterBar';

const AppealFilters = () => {
  const {
    appealSearch,
    appealStatus,
    setAppealSearch,
    setAppealStatus,
    resetAppealFilters,
  } = useAdminFiltersStore();

  return (
    <FilterBar
      searchValue={appealSearch}
      onSearchChange={setAppealSearch}
      searchPlaceholder='Search by username or full name'
      onReset={resetAppealFilters}
    >
      <Select
        value={appealStatus}
        onValueChange={(v) => setAppealStatus(v as AppealStatusFilter)}
      >
        <SelectTrigger className='w-[150px]'>
          <SelectValue placeholder='Status' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='ALL'>All statuses</SelectItem>
          <SelectItem value='PENDING'>Pending</SelectItem>
          <SelectItem value='UPHELD'>Upheld</SelectItem>
          <SelectItem value='OVERTURNED'>Overturned</SelectItem>
        </SelectContent>
      </Select>
    </FilterBar>
  );
};

export default AppealFilters;
