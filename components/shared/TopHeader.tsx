'use client';

import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { Icons } from '../icons';
import PinToHome from '../menus/PinToHome';

interface TopHeaderProps {
  title?: string;
  onBack?: () => void;
  showBack?: boolean;
}

const TopHeader = ({
  title = 'Thread',
  showBack = false,
  onBack,
}: TopHeaderProps) => {
  const router = useRouter();

  const handleBack = () => {
    router.back();
    onBack?.();
  };

  return (
    <div className='flex-between h-[60px] px-4'>
      {showBack && (
        <div className='icon-container' onClick={handleBack}>
          <Icons.back className='size-3' />
        </div>
      )}
      <span
        className={cn(
          'text-[15px] text-center font-semibold',
          !showBack && 'flex-1'
        )}
      >
        {title}
      </span>
      <PinToHome />
    </div>
  );
};

export default TopHeader;
