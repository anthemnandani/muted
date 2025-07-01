'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useChat, type Chat, type User } from '@/contexts/ChatContext';
import { useSocket } from '@/contexts/SocketContext';
import { cn, formatMsgTime } from '@/lib/utils';
import { useUser } from '@clerk/nextjs';
import { Fragment, useCallback } from 'react';

interface ChatListItemParams {
  chat: Chat;
  isSelected: boolean;
  otherUser: User;
}

const ChatListItem = ({ chat, isSelected, otherUser }: ChatListItemParams) => {
  const { user } = useUser();
  const hasUnread = chat.unreadCount > 0;
  const lastMessage = chat.lastMessage;
  const { handleSetCurrChat } = useChat();

  const { activeUsers } = useSocket();
  // const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  // const [deleteAction, setDeleteAction] = useState<'chat' | 'messages' | null>(
  //   null
  // );
  // const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  // const handleDeleteClick = (chatId: string, action: 'chat' | 'messages') => {
  //   setSelectedChatId(chatId);
  //   setDeleteAction(action);
  //   setShowDeleteDialog(true);
  // };

  const isActive = useCallback(
    (userId: string): boolean => {
      return activeUsers.includes(userId);
    },
    [activeUsers]
  );

  const isOnline = isActive(otherUser.id);

  // const handleConfirmDelete = async () => {
  //   if (!selectedChatId || !deleteAction) return;

  //   try {
  //     if (deleteAction === 'chat') {
  //       await deleteChat(selectedChatId);
  //     } else {
  //       await deleteMessages(selectedChatId);
  //     }
  //   } catch (error) {
  //     console.error('Delete operation failed:', error);
  //   } finally {
  //     setShowDeleteDialog(false);
  //     setSelectedChatId(null);
  //     setDeleteAction(null);
  //   }
  // };

  return (
    <div
      key={chat.id}
      className={cn(
        'flex items-center p-4 cursor-pointer transition-all duration-200 group',
        'hover:bg-white/5',
        isSelected && 'bg-white/10 border-l-4 border-l-primary-blue'
      )}
    >
      <div
        className='flex items-center flex-1 min-w-0'
        onClick={() => handleSetCurrChat(chat)}
      >
        <div className='relative mr-3 flex-shrink-0'>
          <Avatar className='size-12 rounded-full overflow-hidden'>
            <AvatarImage
              src={otherUser.image!}
              alt={otherUser.fullName || 'User'}
              width={48}
              height={48}
              className='object-cover w-full h-full'
            />
            <AvatarFallback className='flex-center'>
              {otherUser.username?.slice(0, 2).toUpperCase()}
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

        <div className='flex-1 min-w-0'>
          <div className='flex-between mb-1'>
            <h3
              className={`font-medium truncate text-white/90 ${
                hasUnread ? 'font-semibold' : ''
              }`}
            >
              {otherUser.fullName || otherUser.username}
            </h3>
            {chat.lastMessageAt && (
              <span className='text-xs text-white/40 flex-shrink-0'>
                {formatMsgTime(chat.lastMessageAt)}
              </span>
            )}
          </div>

          <div className='flex-between'>
            <p
              className={`text-sm text-white/60 truncate ${
                hasUnread ? 'font-medium text-white/80' : ''
              }`}
            >
              {lastMessage ? (
                <Fragment>
                  {lastMessage.sender.id === user?.id && (
                    <span className='text-white/40'>You: </span>
                  )}
                  {lastMessage.content}
                </Fragment>
              ) : (
                <span className='text-white/40'>No messages yet</span>
              )}
            </p>
            {hasUnread && (
              <span
                className={cn(
                  'bg-red-500 text-white/90 text-[14px]',
                  'rounded-full ml-2 size-[22px] flex-center'
                )}
              >
                {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type='button'
            title='Options'
            className={cn(
              'p-2 rounded-full opacity-0 group-hover:opacity-100',
              'hover:bg-white/10 transition-all duration-200',
              'focus:opacity-100 focus:outline-none'
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className='size-4 text-white/60' />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align='end'
          className='w-48 bg-gray-800 border-gray-700'
        >
          <DropdownMenuItem
            onClick={() => handleDeleteClick(chat.id, 'messages')}
            className='text-white/80 hover:bg-white/10 focus:bg-white/10'
            disabled={deleteMessagesLoading}
          >
            <MessageSquare className='mr-2 size-4' />
            Clear messages
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleDeleteClick(chat.id, 'chat')}
            className='text-red-400 hover:bg-red-500/20 focus:bg-red-500/20'
            disabled={deleteChatLoading}
          >
            <Trash2 className='mr-2 size-4' />
            Delete chat
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteChat
        showDeleteDialog={showDeleteDialog}
        setShowDeleteDialog={setShowDeleteDialog}
        onConfirm={handleConfirmDelete}
        deleteAction={deleteAction}
      /> */}
    </div>
  );
};

export default ChatListItem;
