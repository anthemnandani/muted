'use client';

import PinToHome from '@/components/menus/PinToHome';
import HeaderWrapper from '@/components/shared/HeaderWrapper';
import Wrapper from '@/components/shared/Wrapper';
import useWindow from '@/hooks/useWindow';

interface SearchLayoutProps {
  children: React.ReactNode;
}

export default function SearchLayout({ children }: SearchLayoutProps) {
  const { isMobile } = useWindow();

  return (
    <>
      {!isMobile && (
        <HeaderWrapper>
          <div className='flex-between h-[60px] px-4'>
            <span className='text-[15px] font-semibold flex-1 text-center'>
              Search
            </span>
            <PinToHome />
          </div>
        </HeaderWrapper>
      )}

      <Wrapper>
        <div className='max-w-xl mx-auto w-full mt-[18px] px-2 md:px-4'>
          {children}
        </div>
      </Wrapper>
    </>
  );
}
