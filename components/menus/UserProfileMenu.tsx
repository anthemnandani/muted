'use client';

import useCopyLink from '@/hooks/useCopyLink';
import useToggleMuteUser from '@/hooks/useToggleMuteUser';
import { UserProfileMenuProps } from '@/lib/types';
import { useReportStore } from '@/store/reportStore';
import { useState } from 'react';
import { Icons } from '../icons';
import BlockUser from '../modals/BlockUser';
import MenuItem from '../shared/MenuItem';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Separator } from '../ui/separator';

const UserProfileMenu = ({
  username,
  isMuted,
  userId,
  isBlocked,
}: UserProfileMenuProps) => {
  const { handleCopyProfileLink } = useCopyLink({ username });
  const { handleToggleMuteUser, isLoading } = useToggleMuteUser({ userId });
  const [isOpen, setIsOpen] = useState(false);
  const { openUserReport } = useReportStore();

  const handleCopyLink = () => {
    handleCopyProfileLink();
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          size='icon'
          className='size-10 bg-white-13 hover:bg-white/20 rounded-md transition-colors duration-200'
        >
          <Icons.ellipsis className='size-5 text-neutral-50' />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align='start'
        className='min-w-[190px] p-0 bg-neutral-900 rounded-xl'
      >
        <MenuItem
          icon={Icons.copyLink}
          label='Copy link'
          onClick={handleCopyLink}
        />

        <MenuItem
          icon={Icons.mute}
          label={isMuted ? 'Unmute' : 'Mute'}
          onClick={() => {
            handleToggleMuteUser({ userId });
            setIsOpen(false);
          }}
          disabled={isLoading}
        />
        <Separator />

        <BlockUser
          username={username}
          userId={userId}
          closeMenu={() => setIsOpen(false)}
          isBlocked={isBlocked}
        />

        <MenuItem
          icon={Icons.report}
          label='Report'
          onClick={() => {
            openUserReport(userId);
            setIsOpen(false);
          }}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserProfileMenu;
