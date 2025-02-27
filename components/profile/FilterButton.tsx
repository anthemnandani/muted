import { FilterButtonProps } from '@/lib/types';
import { cn } from '@/lib/utils';

const FilterButton = ({
  label,
  value,
  isSelected,
  onClick,
}: FilterButtonProps) => (
  <button
    type='button'
    onClick={() => onClick(value)}
    className={cn(
      'rounded-[4px] min-w-12 px-2.5 py-1.5 text-sm transition-colors',
      isSelected
        ? 'bg-neutral-800 text-white/90'
        : 'text-white/60 hover:text-white/75'
    )}
  >
    {label}
  </button>
);

export default FilterButton;
