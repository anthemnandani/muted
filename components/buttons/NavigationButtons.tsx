import { NavigationButtonsProps } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Icons } from '../icons';

const NavigationButtons = ({
  isFirstPost,
  isLastPost,
  isLoading,
  handleNavigation,
}: NavigationButtonsProps) => {
  return (
    <div className='absolute z-50 right-4 top-1/2 -translate-y-1/2 flex flex-col justify-center gap-4 w-fit'>
      <button
        type='button'
        title='Up'
        className={cn(
          'navigator-btn',
          (isFirstPost || isLoading) && 'cursor-not-allowed opacity-40'
        )}
        disabled={isFirstPost || isLoading}
        onClick={() => handleNavigation('up')}
      >
        <Icons.chevronUp className='size-6 text-white/90 font-medium' />
      </button>
      <button
        type='button'
        title='Down'
        className={cn(
          'navigator-btn',
          (isLastPost || isLoading) && 'cursor-not-allowed opacity-40'
        )}
        disabled={isLastPost || isLoading}
        onClick={() => handleNavigation('down')}
      >
        <Icons.chevronDown className='size-6 text-white/90 font-medium' />
      </button>
    </div>
  );
};

export default NavigationButtons;
