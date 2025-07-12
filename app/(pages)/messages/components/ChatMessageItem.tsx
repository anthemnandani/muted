'use client';

import { Icons } from '@/components/icons';
import MenuItem from '@/components/shared/MenuItem';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { useSocket } from '@/contexts/SocketContext';
import { EMOJIS } from '@/lib/constants';
import { ChatMessageItemProps, MessageReaction } from '@/lib/types';
import { cn } from '@/lib/utils';
import useChatStore from '@/store/chatStore';
import { api } from '@/trpc/react';
import { useUser } from '@clerk/nextjs';
import { MessageStatus } from '@prisma/client';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, MoreHorizontal } from 'lucide-react';
import Image from 'next/image';
import { Fragment, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
  isOwn,
  isLastMessage,
}) => {
  const { user } = useUser();
  const { socket } = useSocket();
  const { removeMessageOptimistically, addMessageBack } = useChatStore();

  const [reactions, setReactions] = useState<MessageReaction[]>(
    message.reactions || []
  );
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setReactions(message.reactions || []);
  }, [message.reactions]);

  const { mutate: deleteMessage } = api.chat.deleteMessage.useMutation({
    onMutate: async ({ messageId }) => {
      setIsDeleting(true);

      setTimeout(() => {
        removeMessageOptimistically(messageId);
      }, 200);

      return { deletedMessage: message };
    },
    onError: (error, variables, context) => {
      toast.error(error.message || 'Failed to delete message');

      setIsDeleting(false);

      if (context?.deletedMessage) {
        addMessageBack(context.deletedMessage);
      }
    },
    onSuccess: () => {
      toast.success('Message deleted');
    },
  });

  const handleEmojiClick = (emoji: string) => {
    if (!user || !socket?.connected || isDeleting) return;

    const currentUserReactionIndex = reactions.findIndex(
      (r) => r.userId === user.id
    );

    if (currentUserReactionIndex > -1) {
      const currentReaction = reactions[currentUserReactionIndex];
      if (currentReaction.emoji === emoji) {
        setReactions((prev) => prev.filter((r) => r.userId !== user.id));
      } else {
        setReactions((prev) =>
          prev.map((r) => (r.userId === user.id ? { ...r, emoji } : r))
        );
      }
    } else {
      const newReaction: MessageReaction = {
        id: uuidv4(),
        messageId: message.id,
        userId: user.id,
        emoji,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {
          id: user.id,
          username: user.username ?? 'You',
        },
      };
      setReactions((prev) => [...prev, newReaction]);
    }

    socket.emit('TOGGLE_REACTION', {
      messageId: message.id,
      emoji,
      userId: user.id,
    });
  };

  const getMessageStatusIcon = (status: MessageStatus) => {
    switch (status) {
      case MessageStatus.FAILED:
        return <AlertCircle className='size-5 text-red-500' />;
      default:
        return null;
    }
  };

  const renderAvatar = () => {
    const avatarImage = isOwn ? user?.imageUrl : message.sender.image;
    const avatarName = isOwn
      ? user?.fullName || user?.username || 'You'
      : message.sender.fullName || message.sender.username || 'User';

    const initials = isOwn
      ? user?.username?.slice(0, 2).toUpperCase() ||
        user?.fullName?.slice(0, 2).toUpperCase() ||
        'YU'
      : message.sender.username?.slice(0, 2).toUpperCase() ||
        message.sender.fullName?.slice(0, 2).toUpperCase() ||
        'US';

    return (
      <Avatar className='size-8 rounded-full overflow-hidden flex-shrink-0'>
        {avatarImage && (
          <Image
            src={avatarImage}
            alt={avatarName}
            width={32}
            height={32}
            className='object-cover w-full h-full'
          />
        )}
        <AvatarFallback className='flex-center'>{initials}</AvatarFallback>
      </Avatar>
    );
  };

  const renderReactions = () => {
    if (!reactions || reactions.length === 0 || isDeleting) return null;

    return (
      <AnimatePresence mode='wait'>
        <motion.div
          key={`reactions-${message.id}`}
          layout
          initial={{ opacity: 1, scale: 1 }}
          animate={{ opacity: isDeleting ? 0 : 1, scale: isDeleting ? 0.8 : 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.15 }}
          className={cn(
            'absolute -bottom-5 flex items-center gap-0.5 z-10',
            'p-1 rounded-full',
            'bg-white/10 backdrop-blur-sm shadow-lg',
            isOwn ? 'right-1' : 'left-1'
          )}
        >
          {reactions.map((reaction) => (
            <motion.span
              layout
              key={reaction.id}
              className='text-sm leading-none cursor-pointer p-0.5'
              title={`${
                reaction.user.id === user?.id ? 'You' : reaction.user.username
              } reacted with ${reaction.emoji}`}
              whileHover={
                !isDeleting ? { scale: 1.2, rotate: [0, -10, 10, 0] } : {}
              }
            >
              {reaction.emoji}
            </motion.span>
          ))}
        </motion.div>
      </AnimatePresence>
    );
  };

  const renderMessageContent = () => (
    <div className='relative'>
      <motion.div
        animate={{
          opacity: isDeleting ? 0.5 : 1,
          scale: isDeleting ? 0.95 : 1,
        }}
        transition={{ duration: 0.15 }}
        className={cn(
          'msg-container transition-colors duration-150',
          isOwn ? 'bg-slate-700' : 'bg-[#4b4b4b]'
        )}
      >
        {isDeleting ? (
          <p className='text-sm leading-relaxed italic text-gray-400'>
            Deleting message...
          </p>
        ) : (
          <p className='text-sm leading-relaxed'>{message.content}</p>
        )}
      </motion.div>
      {renderReactions()}
    </div>
  );

  const renderActionButtons = () => (
    <div
      className={cn(
        'flex items-center self-center gap-0',
        isOwn && 'flex-row-reverse'
      )}
    >
      {!isDeleting && (
        <HoverCard>
          <HoverCardTrigger asChild>
            <button
              type='button'
              className='p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white/10'
              disabled={isDeleting}
            >
              <Icons.chatSmile />
            </button>
          </HoverCardTrigger>
          <HoverCardContent
            side='top'
            align='center'
            className='w-auto p-0 chat-menu'
          >
            <div className='flex-center flex-wrap w-[266px] p-[13px]'>
              {EMOJIS.map((emoji, index) => {
                const currentUserReaction = reactions.find(
                  (r) => r.userId === user?.id
                );
                return (
                  <span
                    key={index}
                    onClick={() => handleEmojiClick(emoji)}
                    className={cn('rounded-lg', {
                      'bg-white/20': currentUserReaction?.emoji === emoji,
                    })}
                  >
                    <span
                      className={cn(
                        'flex-center size-10 cursor-pointer rounded-lg text-2xl transition-transform',
                        'duration-300 hover:scale-[1.45]'
                      )}
                    >
                      {emoji}
                    </span>
                  </span>
                );
              })}
            </div>
          </HoverCardContent>
        </HoverCard>
      )}
      {!isDeleting && (
        <HoverCard>
          <HoverCardTrigger asChild>
            <button
              type='button'
              className='p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white/10'
            >
              <MoreHorizontal className='size-4' />
            </button>
          </HoverCardTrigger>
          <HoverCardContent
            side='top'
            align='center'
            className='chat-menu w-[200px] p-2'
          >
            <MenuItem
              icon={Icons.delete}
              label={isDeleting ? 'Deleting...' : 'Delete'}
              className={cn(
                'text-primary-red focus:text-primary-red text-base',
                isDeleting && 'opacity-50 cursor-not-allowed'
              )}
              onClick={() =>
                deleteMessage({
                  messageId: message.id,
                })
              }
            />
            {!isOwn && !isDeleting && (
              <MenuItem
                icon={Icons.report}
                label='Report'
                className='text-primary-red focus:text-primary-red text-base'
              />
            )}
          </HoverCardContent>
        </HoverCard>
      )}
    </div>
  );

  return (
    <AnimatePresence mode='wait'>
      <motion.div
        key={message.id}
        layout
        initial={{ opacity: 1, y: 0, height: 'auto' }}
        animate={{
          opacity: isDeleting ? 0.7 : 1,
          y: 0,
          height: 'auto',
          scale: isDeleting ? 0.98 : 1,
        }}
        exit={{
          opacity: 0,
          y: -10,
          height: 0,
          scale: 0.95,
          marginBottom: 0,
        }}
        transition={{
          duration: 0.2,
          ease: 'easeInOut',
        }}
        className={cn(
          isOwn ? 'flex justify-end gap-2' : 'flex items-end gap-2',
          'group relative',
          isLastMessage ? 'mb-7' : isOwn ? 'mb-4' : 'mb-5'
        )}
      >
        {isOwn ? (
          <div className='flex items-center gap-2'>
            {renderActionButtons()}
            {getMessageStatusIcon(message.status!)}
            {renderMessageContent()}
            <div className='flex-shrink-0'>{renderAvatar()}</div>
          </div>
        ) : (
          <Fragment>
            <div className='flex-shrink-0'>{renderAvatar()}</div>
            {renderMessageContent()}
            {renderActionButtons()}
          </Fragment>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default ChatMessageItem;
