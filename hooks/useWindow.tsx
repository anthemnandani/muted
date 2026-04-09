// import { useEffect, useState } from 'react';

// type WindowSize = {
//   width: number | undefined;
//   height: number | undefined;
// };

// const useWindow = () => {
//   const [windowSize, setWindowSize] = useState<WindowSize>({
//     width: undefined,
//     height: undefined,
//   });

//   useEffect(() => {
//     const handleResize = () => {
//       setWindowSize({
//         width: window.innerWidth,
//         height: window.innerHeight,
//       });
//     };

//     window.addEventListener('resize', handleResize);
//     handleResize();

//     return () => window.removeEventListener('resize', handleResize);
//   }, []);

//   const isMobile: boolean =
//     typeof windowSize.width === 'number' && windowSize.width < 768;
//   const isTablet: boolean =
//     typeof windowSize.width === 'number' &&
//     windowSize.width >= 768 &&
//     windowSize.width < 1024;
//   const isDesktop: boolean =
//     typeof windowSize.width === 'number' && windowSize.width >= 1024;

//   return { windowSize, isMobile, isTablet, isDesktop };
// };

// export default useWindow;
