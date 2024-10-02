import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
// import usePost from '@/store/post';

const PostPrivacyMenu: React.FC = ({}) => {
  //   const { postPrivacy, setPostPrivacy } = usePost();

  const privacyText = {
    ['FOLLOWERS']: 'Your followers can reply & quote',
    ['FOLLOWED']: 'Profiles you follow can reply & quote',
    ['MENTIONED']: 'Profiles you mention can reply & quote',
  };

  //   const privacyDisplayText = React.useMemo(() => {
  //     return privacyText[postPrivacy];
  //     // eslint-disable-next-line react-hooks/exhaustive-deps
  //   }, [postPrivacy]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type='button'
          className='text-[15px] text-gray-3 tracking-normal z-50 cursor-pointer select-none outline-none'
        >
          {privacyText.FOLLOWERS}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align='start'
        className='dropdown-content-container w-[200px] p-0 rounded-2xl -ml-4'
      >
        <DropdownMenuItem
          className='dropdown-menu-item'
          //   onClick={() => setPostPrivacy('ANYONE')}
        >
          Anyone
        </DropdownMenuItem>
        <DropdownMenuSeparator className=' h-[1.2px] my-0' />
        <DropdownMenuItem
          className='dropdown-menu-item'
          //   onClick={() => setPostPrivacy('FOLLOWED')}
        >
          Profiles you follow
        </DropdownMenuItem>
        <DropdownMenuSeparator className=' h-[1.2px] my-0' />
        <DropdownMenuItem
          className='dropdown-menu-item'
          //   onClick={() => setPostPrivacy('MENTIONED')}
        >
          Mentioned only
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default PostPrivacyMenu;
