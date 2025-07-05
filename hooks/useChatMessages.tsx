import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Message } from '@/lib/types';
import { cn, formatDateSeparator, formatMessageTime } from '@/lib/utils';
import { useUser } from '@clerk/nextjs';
import { MessageStatus } from '@prisma/client';
import { isSameDay } from 'date-fns';
import { AlertCircle, Check, CheckCheck } from 'lucide-react';
import Image from 'next/image';
import React from 'react';

const useChatMessages = (messages: Message[]) => {
  const { user } = useUser();
  const shouldShowDateSeparator = (
    currentMessage: Message,
    previousMessage: Message | null
  ): boolean => {
    if (!previousMessage) return true;

    const currentDate = new Date(currentMessage.createdAt);
    const previousDate = new Date(previousMessage.createdAt);

    return !isSameDay(currentDate, previousDate);
  };

  const getMessageStatusIcon = (status: MessageStatus) => {
    switch (status) {
      case MessageStatus.SENDING:
        return <Check className='size-3' />;
      case MessageStatus.FAILED:
        return <AlertCircle className='size-3 text-red-500' />;
      case MessageStatus.SENT:
        return <CheckCheck className='size-3' />;
      case MessageStatus.SEEN:
        return <CheckCheck className='size-3 text-primary-blue' />;
      default:
        return null;
    }
  };

  const renderDateSeparator = (date: string | Date) => (
    <div className='flex justify-center my-4'>
      <div className='bg-white/10 px-3 py-1 rounded-full'>
        <span className='text-xs text-white/60 font-medium'>
          {formatDateSeparator(new Date(date))}
        </span>
      </div>
    </div>
  );

  const renderMessage = (message: Message, index: number) => {
    const isOwn = message.senderId === user?.id;
    const time = formatMessageTime(new Date(message.createdAt));
    const previousMessage = index > 0 ? messages[index - 1] : null;
    const showDateSeparator = shouldShowDateSeparator(message, previousMessage);

    return (
      <div key={message.id}>
        {showDateSeparator && renderDateSeparator(message.createdAt)}

        <div
          data-message-id={message.id}
          data-is-sender={isOwn}
          className={cn('flex mb-3', isOwn ? 'justify-end' : 'justify-start')}
        >
          <div
            className={`flex max-w-[70%] ${
              isOwn ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            {!isOwn && (
              <Avatar className='size-8 rounded-full overflow-hidden mr-2 flex-shrink-0 self-end'>
                <Image
                  src={message.sender.image!}
                  alt={message.sender.fullName || 'User'}
                  width={32}
                  height={32}
                  className='object-cover w-full h-full'
                />
                <AvatarFallback className='flex-center'>
                  {message.sender.username?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            )}

            <div
              className={`flex flex-col ${
                isOwn ? 'items-end mr-2' : 'items-start'
              }`}
            >
              <div
                className={`px-4 py-2 rounded-2xl break-words relative group ${
                  isOwn
                    ? 'bg-[#00A2C9] text-white rounded-br-md'
                    : 'bg-white/10 text-white rounded-bl-md border border-white/10'
                }`}
              >
                {message.type === 'MEDIA' ? (
                  <div className='max-w-xs'>
                    <Image
                      src={message.content}
                      alt='Shared media'
                      width={200}
                      height={200}
                      className='rounded-lg object-cover'
                    />
                  </div>
                ) : (
                  <p className='text-sm leading-relaxed'>{message.content}</p>
                )}
              </div>

              <div
                className={`flex items-center mt-1 text-xs text-white/40 ${
                  isOwn ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <span className={isOwn ? 'ml-2' : 'mr-2'}>{time}</span>
                {isOwn && (
                  <div className='flex items-center'>
                    {getMessageStatusIcon(message.status!)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  return {
    renderMessage,
  };
};

export default useChatMessages;
