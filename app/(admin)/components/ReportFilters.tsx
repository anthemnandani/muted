'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ReportStatusFilter } from '@/lib/types';
import { useAdminFiltersStore } from '@/store/adminFiltersStore';
import { ReportStatus } from '@prisma/client';
import FilterBar from './FilterBar';

const ReportFilters = () => {
  const {
    reportSearch,
    reportStatus,
    setReportSearch,
    setReportStatus,
    resetReportFilters,
  } = useAdminFiltersStore();

  return (
    <FilterBar
      searchValue={reportSearch}
      onSearchChange={setReportSearch}
      searchPlaceholder='Search by reporter, target, or reason'
      onReset={resetReportFilters}
    >
      <Select
        value={reportStatus}
        onValueChange={(v) => setReportStatus(v as ReportStatusFilter)}
      >
        <SelectTrigger className='w-[150px]'>
          <SelectValue placeholder='Status' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='ALL'>All statuses</SelectItem>
          <SelectItem value={ReportStatus.PENDING}>Pending</SelectItem>
          <SelectItem value={ReportStatus.ACTIONED}>Actioned</SelectItem>
          <SelectItem value={ReportStatus.DISMISSED}>Dismissed</SelectItem>
        </SelectContent>
      </Select>
    </FilterBar>
  );
};

export default ReportFilters;
