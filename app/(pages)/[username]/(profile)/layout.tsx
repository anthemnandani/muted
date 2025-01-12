'use client';

import HeaderWrapper from '@/components/shared/HeaderWrapper';
import TopHeader from '@/components/shared/TopHeader';
import useDevice from '@/hooks/useDevice';
import { usePathname } from 'next/navigation';

interface ProfileLayoutProps {
  children: React.ReactNode;
}

export default function ProfileLayout({ children }: ProfileLayoutProps) {
  const { isMobile } = useDevice();
  const pathname = usePathname();
  const hideProfile = pathname.split('/bookmarks/').length > 1;

  return (
    <>
      {!isMobile && !hideProfile && (
        <HeaderWrapper>
          <TopHeader title='Profile' />
        </HeaderWrapper>
      )}

      {children}
    </>
  );
}
