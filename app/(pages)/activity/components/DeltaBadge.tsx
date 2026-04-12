import { cn } from '@/lib/utils';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

const DeltaBadge = ({ value }: { value: number }) => {
  if (value === 0) return null;
  const isPositive = value > 0;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 text-[11px] font-medium',
        isPositive ? 'text-white/60' : 'text-white/40',
      )}
    >
      {isPositive ? (
        <ArrowUpRight className='size-3' />
      ) : (
        <ArrowDownRight className='size-3' />
      )}
      {Math.abs(value)}%
    </span>
  );
};

export default DeltaBadge;
