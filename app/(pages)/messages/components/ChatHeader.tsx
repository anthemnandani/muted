'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useChat } from '@/contexts/ChatContext';
import { useSocket } from '@/contexts/SocketContext';
import { useUser } from '@clerk/nextjs';
import { MoreVertical, Trash, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Chat } from '@/contexts/ChatContext';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const ChatHeader: React.FC<{ selectedChat: Chat }> = ({ selectedChat }) => {
  const { closeChat } = useChat();
  const { user } = useUser();
  const { activeUsers } = useSocket();

  const getOtherUser = () => {
    if (!selectedChat?.participants || !user?.id) return null;
    return selectedChat.participants.find((p) => p.id !== user.id);
  };

  const otherUser = getOtherUser();
  const isOnline = otherUser ? activeUsers.includes(otherUser.id) : false;

  return (
    <div className='border-b border-white/10 p-4 backdrop-blur-sm'>
      <div className='flex-between'>
        <Link
          href={`/@${otherUser?.username}`}
          className='flex items-center space-x-3'
        >
          <div className='relative'>
            <Avatar className='size-10 rounded-full overflow-hidden'>
              <AvatarImage
                src={otherUser?.image ?? ''}
                alt={otherUser?.fullName || 'User'}
                width={48}
                height={48}
                className='object-cover w-full h-full'
              />
              <AvatarFallback className='flex-center'>
                {otherUser!.username?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {isOnline && (
              <div
                className={cn(
                  'absolute bottom-0 right-0 size-3',
                  'bg-green-500 border-2 border-black rounded-full'
                )}
              ></div>
            )}
          </div>

          <div>
            <h3 className='font-semibold text-white/90'>
              {otherUser?.fullName}
            </h3>
            {isOnline && (
              <p className='text-sm text-white/50'>
                <span className='text-green-400'>Online</span>
              </p>
            )}
          </div>
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant='ghost'
              size='sm'
              className='text-white/60 hover:text-white/90 hover:bg-white/10'
            >
              <MoreVertical className='size-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align='end'
            className='bg-gray-900 border-white/20 text-white'
          >
            <DropdownMenuItem
              // onClick={clearChat}
              // disabled={loading}
              className={cn(
                'text-red-400 hover:bg-red-500/20 cursor-pointer',
                'focus:bg-red-500/20 focus:text-red-400'
              )}
            >
              <Trash className='size-4 mr-2' />
              Clear Chat
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={closeChat}
              className='cursor-pointer hover:bg-white/10 focus:bg-white/10'
            >
              <X className='size-4 mr-2' />
              Close Chat
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default ChatHeader;
