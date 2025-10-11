'use client';

import { Icons } from '@/components/icons';
import MenuItem from '@/components/shared/MenuItem';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Eye, MoreHorizontal, Pause } from 'lucide-react';
import { useRouter } from 'next/navigation';

const UserActions = ({ id, username }: { id: string; username: string }) => {
  const router = useRouter();

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div
          className={cn(
            'relative h-12 flex-center cursor-pointer transition-all duration-200 drop-shadow-lg group',
            'before:content-[""] before:absolute before:size-10 before:rounded-full before:bg-white-13',
            'hover:before:scale-100 before:scale-0 before:transition-transform before:duration-200'
          )}
        >
          <MoreHorizontal className='aspect-square object-cover object-center size-6 overflow-hidden flex-1 text-white z-10' />
        </div>
      </HoverCardTrigger>
      <HoverCardContent
        align='end'
        className='dropdown-content-container w-[175px] p-0 rounded-lg'
      >
        <MenuItem
          icon={Eye}
          label='View'
          onClick={() => router.push(`/@${username}`)}
        />
        <Separator />
        <MenuItem
          icon={Pause}
          label='Suspend'
          //   onClick={() => handleToggleMuteUser({ userId: author.id })}
        />
        <Separator />
        <MenuItem
          icon={Icons.block}
          label='Block'
          //   onClick={() => handleToggleMuteUser({ userId: author.id })}
        />
      </HoverCardContent>
    </HoverCard>
  );
};

export default UserActions;
