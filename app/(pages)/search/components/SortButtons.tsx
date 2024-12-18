import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type SortType = 'TOP' | 'LATEST';

interface SortButtonsProps {
  sortBy: SortType;
  onSortChange: (sort: SortType) => void;
  className?: string;
}

const SortButtons = ({ sortBy, onSortChange, className }: SortButtonsProps) => {
  return (
    <div className={cn('flex items-center gap-1.5 px-2 md:px-4', className)}>
      <Button
        variant='ghost'
        onClick={() => onSortChange('TOP')}
        className={cn(sortBy === 'TOP' ? 'sort-btn-top' : 'sort-btn-latest')}
      >
        Top
      </Button>
      <Button
        variant='ghost'
        onClick={() => onSortChange('LATEST')}
        className={cn(sortBy === 'LATEST' ? 'sort-btn-top' : 'sort-btn-latest')}
      >
        Recent
      </Button>
    </div>
  );
};

export default SortButtons;
