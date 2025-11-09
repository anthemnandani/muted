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
import type { ReportStatusFilter } from '@/lib/types';
import { useAdminFiltersStore } from '@/store/adminFiltersStore';
import { ReportStatus } from '@prisma/client';
import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';

const ReportFilters = () => {
  const {
    reportSearch,
    reportStatus,
    setReportSearch,
    setReportStatus,
    resetReportFilters,
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
              value={reportSearch}
              onChange={(e) => setReportSearch(e.target.value)}
              placeholder='Search by reporter, target, or reason'
              className='pl-8 focus-visible:ring-0 focus-visible:ring-offset-0'
            />
          </div>
        </div>

        <div className='flex flex-wrap items-center gap-2'>
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

          <Button
            variant='ghost'
            size='sm'
            className='bg-primary-blue text-white hover:bg-primary-blue/90'
            onClick={resetReportFilters}
          >
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReportFilters;
