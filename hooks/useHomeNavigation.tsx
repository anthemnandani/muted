import { triggerHardRefresh } from '@/lib/utils';
import { usePathname } from 'next/navigation';

const useHomeNavigation = () => {
  const pathname = usePathname();

  const handleHomeClick = (e: React.MouseEvent) => {
    if (pathname === '/') {
      e.preventDefault();
      triggerHardRefresh();
    }
  };

  return { handleHomeClick };
};

export default useHomeNavigation;
