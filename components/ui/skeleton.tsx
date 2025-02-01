import { cn } from '@/lib/utils';

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-gray-2 dark:bg-white-12',
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
