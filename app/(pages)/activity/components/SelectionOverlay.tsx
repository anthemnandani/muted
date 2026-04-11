import { SelectionOverlayProps } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

const SelectionOverlay = ({
  isSelected,
  isSelecting,
  onToggle,
}: SelectionOverlayProps) => {
  if (!isSelecting) return null;
  return (
    <div
      className='absolute top-2 left-2 z-10 cursor-pointer'
      onClick={onToggle}
    >
      <div
        className={cn(
          'size-6 rounded-full border-2 flex-center transition-all',
          isSelected
            ? 'bg-white border-white'
            : 'bg-black/40 border-white/60 hover:border-white',
        )}
      >
        {isSelected && (
          <Check className='size-3.5 text-black' strokeWidth={3} />
        )}
      </div>
    </div>
  );
};

export default SelectionOverlay;
