'use client';

import type { MentionSuggestion } from '@/lib/types';
import { UserX } from 'lucide-react';
import { Icons } from '../icons';
import UserAvatar from '../shared/UserAvatar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { ScrollArea } from '../ui/scroll-area';

interface UsersMenuProps {
  showMentionSuggestions: boolean;
  mentionSuggestions?: MentionSuggestion[];
  cursorPosition: {
    top: number;
    left: number;
  };
  isLoading: boolean;
  onSelect: (username: string, userId: string) => void;
}

const UsersMenu = ({
  showMentionSuggestions,
  mentionSuggestions,
  cursorPosition,
  isLoading,
  onSelect,
}: UsersMenuProps) => {
  return (
    <Popover open={showMentionSuggestions} modal>
      <PopoverTrigger className='hidden'></PopoverTrigger>
      <PopoverContent
        className='mentions-menu dropdown-content-container absolute rounded-2xl p-0 w-[280px]'
        style={{
          top: `${cursorPosition.top}px`,
          left: `${cursorPosition.left}px`,
        }}
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <ScrollArea
          className='max-h-[285px] overflow-y-auto flex flex-col'
          type='always'
        >
          {isLoading ? (
            <div className='flex-center h-[285px]'>
              <div className='flex flex-col items-center gap-2'>
                <Icons.spinner className='size-5 animate-spin text-muted-foreground' />
                <span className='text-sm text-muted-foreground'>
                  Searching users...
                </span>
              </div>
            </div>
          ) : mentionSuggestions?.length === 0 ? (
            <div className='flex-center h-[285px]'>
              <div className='flex flex-col items-center gap-2'>
                <UserX className='size-5 text-muted-foreground' />
                <span className='text-sm text-muted-foreground'>
                  No users found
                </span>
              </div>
            </div>
          ) : (
            mentionSuggestions?.map((user, index) => (
              <div
                className='overflow-hidden cursor-pointer w-full hover:bg-accent'
                key={user.id}
                onClick={() => onSelect(user.username, user.id)}
              >
                <div className='flex items-center gap-3 p-3'>
                  <UserAvatar
                    image={user.image}
                    username={user.username}
                    fullname={user.fullName}
                    className='size-8'
                  />
                  <div className='flex flex-col items-start'>
                    <span className='text-sm font-medium antialiased'>
                      {user.fullName}
                    </span>
                    <span className='text-xs text-muted-foreground antialiased'>
                      @{user.username}
                    </span>
                  </div>
                </div>
                {index !== mentionSuggestions.length - 1 && (
                  <div className='-mx-1 h-px bg-muted' />
                )}
              </div>
            ))
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default UsersMenu;
