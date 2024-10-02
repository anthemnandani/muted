'use client';
import { Icons } from '../icons';
import MenuItem from '../shared/MenuItem';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

const PinToHome = () => {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <div className='icon-container'>
          <Icons.moreHorizontal className='size-3' />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className='dropdown-content-container p-2 rounded-2xl w-[240px]'
        align='end'
        alignOffset={-15}
      >
        <MenuItem
          icon={Icons.pin}
          label='Pin to home'
          className='flex-between focus:rounded-lg !py-4'
          isActionMenuItem
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default PinToHome;
