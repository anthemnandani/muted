'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSocket } from '@/contexts/SocketContext';
import { Chat } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import ChatMenu from './ChatMenu';

const ChatHeader: React.FC<{ selectedChat: Chat }> = ({ selectedChat }) => {
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
                {otherUser?.username?.slice(0, 2).toUpperCase()}
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

        <ChatMenu chatId={selectedChat.id} />
      </div>
    </div>
  );
};

export default ChatHeader;
