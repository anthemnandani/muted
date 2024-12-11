'use client';

import PinToHome from '@/components/menus/PinToHome';
import HeaderWrapper from '@/components/shared/HeaderWrapper';
import Wrapper from '@/components/shared/Wrapper';
import useWindow from '@/hooks/useWindow';

interface ProfileLayoutProps {
  children: React.ReactNode;
}

export default function ProfileLayout({ children }: ProfileLayoutProps) {
  const { isMobile } = useWindow();
  return (
    <>
      {!isMobile && (
        <HeaderWrapper>
          <div className='flex-between h-[60px] px-4'>
            <span className='text-[15px] font-semibold flex-1 text-center'>
              Profile
            </span>
            <PinToHome />
          </div>
        </HeaderWrapper>
      )}

      <Wrapper>{children}</Wrapper>
    </>
  );
}
