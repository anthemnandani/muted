import { Button } from '@/components/ui/button';
import { ActionBannerProps } from '@/lib/types';
import { Trash2 } from 'lucide-react';

const ActionBanner = ({
  count,
  isProcessing,
  onAction,
  onCancel,
  actionLabel,
}: ActionBannerProps) => {
  return (
    <div className='fixed left-1/2 bottom-6 z-50 animate-in slide-in-from-bottom-8 duration-300 pointer-events-none'>
      <div className='mx-auto max-w-fit flex items-center gap-4 px-4 py-2.5 bg-[#18181b]/80 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl pointer-events-auto'>
        <div className='flex items-center gap-2 pl-2'>
          <div className='flex-center size-6 rounded-full bg-white/10'>
            <span className='text-xs font-bold text-white'>{count}</span>
          </div>
          <span className='text-sm font-medium text-white/70 hidden sm:inline-block'>
            selected
          </span>
        </div>

        <div className='w-px h-5 bg-white/[0.15]' />

        <div className='flex items-center gap-1.5'>
          <Button
            variant='ghost'
            onClick={onCancel}
            disabled={isProcessing}
            className='h-auto px-4 py-2 rounded-full text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 active:scale-95 transition-all duration-200'
          >
            Cancel
          </Button>

          <Button
            variant='destructive'
            onClick={onAction}
            disabled={count === 0 || isProcessing}
            className='h-auto flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 active:scale-95'
          >
            <Trash2 className='size-4' />
            {actionLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ActionBanner;
