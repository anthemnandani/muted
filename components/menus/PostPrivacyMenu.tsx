import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useThreadStore } from '@/store/threadStore';
import React from 'react';

const PostPrivacyMenu: React.FC = ({}) => {
  const { privacy, setPrivacy } = useThreadStore();

  const privacyText = {
    ['ANYONE']: 'Anyone can reply & quote',
    ['FOLLOWERS']: 'Your followers can reply & quote',
    ['FOLLOWED']: 'Profiles you follow can reply & quote',
    ['MENTIONED']: 'Profiles you mention can reply & quote',
  };

  const privacyDisplayText = React.useMemo(() => {
    return privacyText[privacy];
  }, [privacy]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type='button'
          className='text-[15px] text-gray-3 tracking-normal z-50 cursor-pointer select-none outline-none'
        >
          {privacyDisplayText}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align='start'
        className='shadow-xl bg-gray-6 z-[1001] w-[200px] p-0 rounded-2xl -ml-4'
      >
        <DropdownMenuItem
          className='dropdown-menu-item'
          onClick={() => setPrivacy('ANYONE')}
        >
          Anyone
        </DropdownMenuItem>
        <DropdownMenuSeparator className=' h-[1.2px] my-0' />
        <DropdownMenuItem
          className='dropdown-menu-item'
          onClick={() => setPrivacy('FOLLOWERS')}
        >
          Followers only
        </DropdownMenuItem>
        <DropdownMenuSeparator className=' h-[1.2px] my-0' />
        <DropdownMenuItem
          className='dropdown-menu-item'
          onClick={() => setPrivacy('FOLLOWED')}
        >
          Profiles you follow
        </DropdownMenuItem>
        <DropdownMenuSeparator className=' h-[1.2px] my-0' />
        <DropdownMenuItem
          className='dropdown-menu-item'
          onClick={() => setPrivacy('MENTIONED')}
        >
          Mentioned only
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default PostPrivacyMenu;
