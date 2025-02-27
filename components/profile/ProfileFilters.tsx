import { PROFILE_FILTERS } from '@/lib/constants';
import type { ProfileFiltersProps } from '@/lib/types';
import FilterButton from './FilterButton';

const ProfileFilters = ({
  selectedFilter,
  setSelectedFilter,
}: ProfileFiltersProps) => {
  return (
    <div className='p-0.5 mt-0.5 mb-1.5 rounded-md min-h-9 flex items-center bg-white-13 w-fit'>
      {PROFILE_FILTERS.map(({ label, value }) => (
        <FilterButton
          key={value}
          label={label}
          value={value}
          isSelected={selectedFilter === value}
          onClick={setSelectedFilter}
        />
      ))}
    </div>
  );
};

export default ProfileFilters;
