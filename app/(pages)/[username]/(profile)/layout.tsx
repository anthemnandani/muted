'use client';

import HeaderWrapper from '@/components/shared/HeaderWrapper';
import TopHeader from '@/components/shared/TopHeader';
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
          <TopHeader title='Profile' />
        </HeaderWrapper>
      )}

      <Wrapper>{children}</Wrapper>
    </>
  );
}
