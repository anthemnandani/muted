import { EmptyStateProps } from '@/lib/types';
import { cn } from '@/lib/utils';

const EmptyState = ({
  icon,
  title,
  description,
  isNotification = false,
}: EmptyStateProps) => {
  return (
    <div
      className={cn(
        'flex-col-center w-full h-full text-center mx-auto',
        isNotification ? 'pt-[88px] px-8' : 'min-h-[490px]'
      )}
    >
      <div
        className={cn(
          isNotification
            ? 'size-[70px]'
            : 'size-[92px] rounded-full bg-zinc-800 flex-center'
        )}
      >
        {icon}
      </div>
      <p
        className={cn(
          'font-bold text-white/90',
          isNotification ? 'text-base mt-4' : 'text-2xl mt-6'
        )}
      >
        {title}
      </p>
      {description && (
        <p
          className={cn(
            'font-normal text-white/75 mt-2',
            isNotification ? 'text-sm' : 'text-base'
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
};

export default EmptyState;
