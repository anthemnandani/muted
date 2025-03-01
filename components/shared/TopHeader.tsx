'use client';

import { useRouter } from 'next/navigation';
import { Icons } from '../icons';

interface TopHeaderProps {
  title?: string;
  onBack?: () => void;
}

const TopHeader = ({ title = 'Thread', onBack }: TopHeaderProps) => {
  const router = useRouter();

  const handleBack = () => {
    router.back();
    onBack?.();
  };

  return (
    <div className='flex-between h-5'>
      <div className='icon-container' onClick={handleBack}>
        <Icons.back className='size-3' />
      </div>
      <span className='text-[15px] text-center font-semibold flex-1'>
        {title}
      </span>
    </div>
  );
};

export default TopHeader;
