import { useMediaQuery } from 'react-responsive';

const useDevice = () => {
  const isSmallMobile = useMediaQuery({ maxWidth: 350 });
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1023 });
  const isDesktop = useMediaQuery({ minWidth: 1024 });

  return {
    isMobile,
    isTablet,
    isDesktop,
    isSmallMobile,
    isLargeDesktop: useMediaQuery({ minWidth: 1280 }),
  };
};

export default useDevice;
