import { Icons } from '@/components/icons';
import type { SectionRefs } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Bell, Info, LockKeyhole, Video } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

const SETTING_ITEMS = [
  {
    id: 0,
    icon: Icons.userRound,
    title: 'Manage Account',
    sectionId: 'manage-account',
  },
  {
    id: 1,
    icon: LockKeyhole,
    title: 'Privacy',
    sectionId: 'privacy',
  },
  {
    id: 2,
    icon: Bell,
    title: 'Push notifications',
    sectionId: 'push-notifications',
  },
  {
    id: 3,
    icon: Video,
    title: 'Content preferences',
    sectionId: 'content-preferences',
  },
  {
    id: 4,
    icon: Info,
    title: 'About',
    sectionId: 'about',
  },
];

const SettingSidebar = ({ sectionRefs }: { sectionRefs: SectionRefs }) => {
  const [isActive, setIsActive] = useState(0);

  const router = useRouter();
  const pathname = usePathname();

  const handleItemClick = (
    sectionId: keyof typeof sectionRefs,
    index: number
  ) => {
    if (pathname === '/setting') {
      setIsActive(index);
      sectionRefs[sectionId].current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    } else {
      router.push('/setting');
    }
  };

  return (
    <div className='relative flex-[0_0_356px] h-full max-md:hidden'>
      <div
        className={cn(
          'w-[356px] pb-4 px-0 bg-gray-6 shadow-setting-panel rounded-t-lg',
          'overflow-x-hidden overflow-y-auto scrollbar scrollbar-w-8 scrollbar-thumb-zinc-800',
          'scrollbar-track-transparent absolute top-0 bottom-0'
        )}
      >
        {SETTING_ITEMS.map((item, index) => (
          <button
            key={item.id}
            type='button'
            onClick={() =>
              handleItemClick(item.sectionId as keyof typeof sectionRefs, index)
            }
            className={cn(
              'w-full h-[52px] py-[14px] px-6 flex items-center cursor-pointer transition-colors hover:bg-white/10',
              {
                'bg-blue-500/20 hover:bg-blue-500/20': isActive === index,
              }
            )}
          >
            <span
              className={cn(
                'mr-3',
                isActive === index ? 'text-primary-blue' : 'text-white/90'
              )}
            >
              <item.icon className='size-6' />
            </span>
            <span
              className={cn(
                'text-lg font-semibold antialiased',
                isActive === index ? 'text-primary-blue' : 'text-white/90'
              )}
            >
              {item.title}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SettingSidebar;
