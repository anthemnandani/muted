'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MONTHS } from '@/lib/constants';
import {
  DatePickerRowProps,
  SortFilterDialogProps,
  SortOrder,
} from '@/lib/types';
import { cn, generateYears, getDaysInMonth } from '@/lib/utils';
import { X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

const DatePickerRow = ({
  label,
  month,
  day,
  year,
  onMonthChange,
  onDayChange,
  onYearChange,
  years,
}: DatePickerRowProps) => {
  const daysInMonth = getDaysInMonth(month, year);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div>
      <p className='text-sm font-semibold text-white mb-2'>{label}</p>
      <div className='flex gap-2'>
        <select
          aria-label='Months'
          value={month}
          onChange={(e) => onMonthChange(Number(e.target.value))}
          className='flex-1 bg-transparent border border-white/[0.12] rounded-lg px-3 py-2.5 text-sm text-white appearance-none cursor-pointer hover:border-white/20 focus:outline-none focus:border-white/30'
        >
          {MONTHS.map((m, i) => (
            <option key={m} value={i} className='bg-[#262626] text-white'>
              {m}
            </option>
          ))}
        </select>

        <select
          aria-label='Days'
          value={day}
          onChange={(e) => onDayChange(Number(e.target.value))}
          className='w-[70px] bg-transparent border border-white/[0.12] rounded-lg px-3 py-2.5 text-sm text-white appearance-none cursor-pointer hover:border-white/20 focus:outline-none focus:border-white/30'
        >
          {days.map((d) => (
            <option key={d} value={d} className='bg-[#262626] text-white'>
              {d}
            </option>
          ))}
        </select>

        <select
          aria-label='Years'
          value={year}
          onChange={(e) => onYearChange(Number(e.target.value))}
          className='w-[90px] bg-transparent border border-white/[0.12] rounded-lg px-3 py-2.5 text-sm text-white appearance-none cursor-pointer hover:border-white/20 focus:outline-none focus:border-white/30'
        >
          {years.map((y) => (
            <option key={y} value={y} className='bg-[#262626] text-white'>
              {y}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

const SortFilterDialog = ({
  open,
  onOpenChange,
  value,
  onApply,
  minDate,
}: SortFilterDialogProps) => {
  const now = new Date();
  const minYear = minDate?.getFullYear() ?? 2020;
  const years = useMemo(
    () => generateYears(minYear, now.getFullYear()),
    [minYear],
  );

  const [sortOrder, setSortOrder] = useState<SortOrder>(value.sortOrder);

  const defaultStart =
    value.dateFilter.startDate ?? minDate ?? new Date(2020, 0, 1);
  const defaultEnd = value.dateFilter.endDate ?? now;

  const [startMonth, setStartMonth] = useState(defaultStart.getMonth());
  const [startDay, setStartDay] = useState(defaultStart.getDate());
  const [startYear, setStartYear] = useState(defaultStart.getFullYear());

  const [endMonth, setEndMonth] = useState(defaultEnd.getMonth());
  const [endDay, setEndDay] = useState(defaultEnd.getDate());
  const [endYear, setEndYear] = useState(defaultEnd.getFullYear());

  useEffect(() => {
    if (open) {
      setSortOrder(value.sortOrder);
      const s = value.dateFilter.startDate ?? minDate ?? new Date(2020, 0, 1);
      const e = value.dateFilter.endDate ?? now;
      setStartMonth(s.getMonth());
      setStartDay(s.getDate());
      setStartYear(s.getFullYear());
      setEndMonth(e.getMonth());
      setEndDay(e.getDate());
      setEndYear(e.getFullYear());
    }
  }, [open]);

  useEffect(() => {
    const max = getDaysInMonth(startMonth, startYear);
    if (startDay > max) setStartDay(max);
  }, [startMonth, startYear]);

  useEffect(() => {
    const max = getDaysInMonth(endMonth, endYear);
    if (endDay > max) setEndDay(max);
  }, [endMonth, endYear]);

  const handleApply = useCallback(() => {
    onApply({
      sortOrder,
      dateFilter: {
        startDate: new Date(startYear, startMonth, startDay),
        endDate: new Date(endYear, endMonth, endDay, 23, 59, 59),
      },
    });
    onOpenChange(false);
  }, [
    sortOrder,
    startYear,
    startMonth,
    startDay,
    endYear,
    endMonth,
    endDay,
    onApply,
    onOpenChange,
  ]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='bg-[#262626] border-white/[0.12] text-white max-w-md p-0 gap-0 rounded-2xl'>
        <DialogHeader className='relative px-4 py-4 border-b border-white/[0.08]'>
          <button
            aria-label='Close'
            onClick={() => onOpenChange(false)}
            className='absolute left-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors'
          >
            <X className='size-6' />
          </button>
          <DialogTitle className='text-center text-base font-bold'>
            Sort & Filter
          </DialogTitle>
        </DialogHeader>

        <div className='px-5 py-5 space-y-6'>
          <div>
            <p className='text-sm font-semibold text-white mb-3'>Sort by</p>
            <div className='flex gap-2'>
              {(['newest', 'oldest'] as const).map((order) => (
                <button
                  key={order}
                  onClick={() => setSortOrder(order)}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-all border',
                    sortOrder === order
                      ? 'bg-white text-black border-white'
                      : 'bg-transparent text-white/70 border-white/[0.12] hover:border-white/20',
                  )}
                >
                  {order === 'newest' ? 'Newest to Oldest' : 'Oldest to Newest'}
                </button>
              ))}
            </div>
          </div>

          <DatePickerRow
            label='Start date'
            month={startMonth}
            day={startDay}
            year={startYear}
            onMonthChange={setStartMonth}
            onDayChange={setStartDay}
            onYearChange={setStartYear}
            years={years}
          />

          <DatePickerRow
            label='End date'
            month={endMonth}
            day={endDay}
            year={endYear}
            onMonthChange={setEndMonth}
            onDayChange={setEndDay}
            onYearChange={setEndYear}
            years={years}
          />
        </div>

        <div className='px-5 pb-5'>
          <button
            onClick={handleApply}
            className='w-full py-3 rounded-xl bg-primary-blue text-white text-sm font-bold hover:bg-primary-blue/90 transition-colors'
          >
            Apply
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SortFilterDialog;
