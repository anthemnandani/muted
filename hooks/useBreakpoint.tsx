import { useEffect, useState } from 'react';

type Breakpoint = 'smallMobile' | 'mobile' | 'tablet' | 'desktop' | 'largeDesktop';

type BreakpointState = {
  isSmallMobile: boolean;  // < 400px
  isMobile: boolean;       // < 768px
  isTablet: boolean;       // 768px – 1023px
  isDesktop: boolean;      // >= 1024px
  isLargeDesktop: boolean; // >= 1280px
  breakpoint: Breakpoint;
};

const getBreakpointState = (width: number): BreakpointState => {
  const isSmallMobile = width < 400;
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;
  const isLargeDesktop = width >= 1280;

  let breakpoint: Breakpoint = 'desktop';
  if (width < 400) breakpoint = 'smallMobile';
  else if (width < 768) breakpoint = 'mobile';
  else if (width < 1024) breakpoint = 'tablet';
  else if (width < 1280) breakpoint = 'desktop';
  else breakpoint = 'largeDesktop';

  return { isSmallMobile, isMobile, isTablet, isDesktop, isLargeDesktop, breakpoint };
};

// SSR-safe defaults — sab false, server pe koi mismatch nahi
const SSR_DEFAULT: BreakpointState = {
  isSmallMobile: false,
  isMobile: false,
  isTablet: false,
  isDesktop: true,
  isLargeDesktop: false,
  breakpoint: 'desktop',
};

const useBreakpoint = (): BreakpointState => {
  const [state, setState] = useState<BreakpointState>(SSR_DEFAULT);

  useEffect(() => {
    // Mount hone ke baad actual value set karo
    setState(getBreakpointState(window.innerWidth));

    const queries = [
      window.matchMedia('(max-width: 399px)'),
      window.matchMedia('(max-width: 767px)'),
      window.matchMedia('(min-width: 768px) and (max-width: 1023px)'),
      window.matchMedia('(min-width: 1024px)'),
      window.matchMedia('(min-width: 1280px)'),
    ];

    const onChange = () => setState(getBreakpointState(window.innerWidth));

    queries.forEach((q) => q.addEventListener('change', onChange));
    return () => queries.forEach((q) => q.removeEventListener('change', onChange));
  }, []);

  return state;
};

export default useBreakpoint;