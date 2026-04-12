'use client';

import { useState, useEffect } from 'react';
import { useMediaQuery } from 'react-responsive';

const useDevice = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isSmallMobile = useMediaQuery({ maxWidth: 350 });
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1023 });
  const isDesktop = useMediaQuery({ minWidth: 1024 });
  const isLargeDesktop = useMediaQuery({ minWidth: 1280 });

  if (!mounted) {
    return {
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      isSmallMobile: false,
      isLargeDesktop: false,
    };
  }

  return {
    isMobile,
    isTablet,
    isDesktop,
    isSmallMobile,
    isLargeDesktop,
  };
};

export default useDevice;
