import { SettingRowProps } from '@/lib/types';
import { cn } from '@/lib/utils';

const SettingRow: React.FC<SettingRowProps> = ({
  title,
  description,
  control,
  onClick,
  isButton = false,
  border = false,
  className,
}) => {
  const wrapperProps = isButton
    ? { role: 'button', onClick, className: 'cursor-pointer relative' }
    : {};

  return (
    <div {...wrapperProps}>
      <div className={cn('relative', border && 'border-b border-b-white/15')}>
        <div className='text-base leading-[22px] text-white/90 mx-4'>
          {title}
        </div>
        {description && (
          <div
            className={cn(
              'text-white/60 text-sm leading-tight mt-1 ml-4 mr-[84px] antialiased',
              className
            )}
          >
            {description}
          </div>
        )}
        <div className='inline-flex absolute right-0 mx-4 my-0 top-1/2 -translate-y-1/2'>
          {control}
        </div>
      </div>
    </div>
  );
};

export default SettingRow;
