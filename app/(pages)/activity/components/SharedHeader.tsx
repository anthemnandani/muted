import { SharedHeaderProps, type SortFilterState } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useActivityStore } from '@/store/activityStore';
import { ArrowDownUp } from 'lucide-react';
import { Fragment } from 'react';
import SortFilterDialog from './SortFilterDialog';

const SharedHeader = ({
  allSelected,
  handleSelectAll,
  canSelect,
  hideContentTypeToggle = false,
}: SharedHeaderProps) => {
  const {
    tab,
    contentType,
    isSelecting,
    sortFilter,
    isSortFilterOpen,
    setContentType,
    setSortFilter,
    enterSelecting,
    exitSelecting,
    setIsSortFilterOpen,
  } = useActivityStore();

  const hasActiveFilter = (state: SortFilterState) => {
    return (
      state.sortOrder !== 'newest' ||
      state.dateFilter.startDate !== null ||
      state.dateFilter.endDate !== null
    );
  };

  const handleSortFilterApply = (state: SortFilterState) => {
    setSortFilter(state);
    exitSelecting();
  };

  return (
    <Fragment>
      <div className='flex items-center justify-between py-3 px-3'>
        <div className='flex bg-white/[0.03] rounded-xl border border-white/[0.06] p-[3px]'>
          {!hideContentTypeToggle ? (
            <div className='flex bg-white/[0.03] rounded-xl border border-white/[0.06] p-[3px]'>
              {(['posts', 'threads'] as const).map((ct) => (
                <button
                  key={ct}
                  onClick={() => {
                    exitSelecting();
                    setContentType(ct);
                  }}
                  className={cn(
                    'px-4 py-1.5 rounded-lg text-xs font-medium transition-all capitalize',
                    contentType === ct
                      ? 'bg-white/[0.08] text-white'
                      : 'text-white/40 hover:text-white/60',
                  )}
                >
                  {ct}
                </button>
              ))}
            </div>
          ) : (
            <div />
          )}
        </div>

        <div className='flex items-center gap-2'>
          {isSelecting ? (
            <>
              <button
                onClick={handleSelectAll}
                className='px-3 py-1.5 rounded-lg text-xs font-medium text-white/50 hover:text-white/80 hover:bg-white/[0.06] transition-all'
              >
                {allSelected ? 'Deselect all' : 'Select all'}
              </button>
              <button
                onClick={exitSelecting}
                className='px-3 py-1.5 rounded-lg text-xs font-medium text-white/50 hover:text-white/80 hover:bg-white/[0.06] transition-all'
              >
                Cancel
              </button>
            </>
          ) : (
            canSelect && (
              <button
                onClick={enterSelecting}
                className='px-3 py-1.5 rounded-lg text-xs font-medium text-primary-blue hover:text-primary-blue/90 transition-all'
              >
                Select
              </button>
            )
          )}
          <button
            onClick={() => setIsSortFilterOpen(true)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border',
              hasActiveFilter(sortFilter)
                ? 'bg-white/10 border-white/20 text-white'
                : 'bg-transparent border-white/[0.08] text-white/50 hover:text-white/80 hover:border-white/20',
            )}
          >
            <ArrowDownUp className='size-3.5' />
            Sort & filter
          </button>
        </div>
      </div>
      <SortFilterDialog
        open={isSortFilterOpen}
        onOpenChange={setIsSortFilterOpen}
        value={sortFilter}
        onApply={handleSortFilterApply}
      />
    </Fragment>
  );
};

export default SharedHeader;
