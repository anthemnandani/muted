import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Message } from '@/lib/types';
import {
  cn,
  formatMessageDateSeparator,
  shouldShowDateSeparator,
} from '@/lib/utils';
import { useUser } from '@clerk/nextjs';
import { MessageStatus } from '@prisma/client';
import { AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { Fragment } from 'react';

const useChatMessages = (messages: Message[]) => {
  const { user } = useUser();

  const getMessageStatusIcon = (status: MessageStatus) => {
    switch (status) {
      case MessageStatus.FAILED:
        return <AlertCircle className='size-5 text-red-500' />;
      // case MessageStatus.SENDING:
      //   return <Check className='size-3' />;
      // case MessageStatus.SENT:
      //   return <CheckCheck className='size-3' />;
      // case MessageStatus.SEEN:
      //   return <CheckCheck className='size-3 text-primary-blue' />;
      default:
        return null;
    }
  };

  const renderDateSeparator = (date: string | Date) => {
    const messageDate = new Date(date);

    return (
      <div className='flex justify-center my-4'>
        <div className='bg-white/10 px-3 py-1 rounded-full'>
          <span className='text-xs text-white/60 font-medium'>
            {formatMessageDateSeparator(messageDate)}
          </span>
        </div>
      </div>
    );
  };

  const renderAvatar = (message: Message, isOwn: boolean) => {
    if (isOwn) {
      return (
        <Avatar className='size-8 rounded-full overflow-hidden flex-shrink-0'>
          {user?.imageUrl && (
            <Image
              src={user.imageUrl}
              alt={user.fullName || user.username || 'You'}
              width={32}
              height={32}
              className='object-cover w-full h-full'
            />
          )}
          <AvatarFallback className='flex-center'>
            {user?.username?.slice(0, 2).toUpperCase() ||
              user?.fullName?.slice(0, 2).toUpperCase() ||
              'YU'}
          </AvatarFallback>
        </Avatar>
      );
    }

    return (
      <Avatar className='size-8 rounded-full overflow-hidden flex-shrink-0'>
        {message.sender.image && (
          <Image
            src={message.sender.image}
            alt={message.sender.fullName || message.sender.username || 'User'}
            width={32}
            height={32}
            className='object-cover w-full h-full'
          />
        )}
        <AvatarFallback className='flex-center'>
          {message.sender.username?.slice(0, 2).toUpperCase() ||
            message.sender.fullName?.slice(0, 2).toUpperCase() ||
            'US'}
        </AvatarFallback>
      </Avatar>
    );
  };

  const renderMessage = (message: Message, index: number) => {
    const isOwn = message.senderId === user?.id;
    const previousMessage = index > 0 ? messages[index - 1] : null;
    const showDateSeparator = shouldShowDateSeparator(message, previousMessage);
    const messageStatus = getMessageStatusIcon(message.status!);

    return (
      <div key={message.id}>
        {showDateSeparator && renderDateSeparator(message.createdAt)}

        <div
          data-message-id={message.id}
          data-is-sender={isOwn}
          className={cn('flex mb-3', isOwn ? 'justify-end' : 'justify-start')}
        >
          <div className={cn('flex items-center gap-2')}>
            {isOwn ? (
              <Fragment>
                <div className='flex flex-col'>
                  <div className='flex items-center gap-2'>
                    {messageStatus && (
                      <div className='flex items-center flex-shrink-0'>
                        {messageStatus}
                      </div>
                    )}
                    <div
                      className={cn(
                        'px-4 py-2 rounded-2xl break-words relative group',
                        'bg-slate-700 text-white',
                        'overflow-hidden w-fit max-w-sm whitespace-pre-line'
                      )}
                    >
                      <p className='text-sm leading-relaxed'>
                        {message.content}
                      </p>
                    </div>
                    <div className='flex-shrink-0'>
                      {renderAvatar(message, isOwn)}
                    </div>
                  </div>
                </div>
              </Fragment>
            ) : (
              <Fragment>
                <div className='flex-shrink-0'>
                  {renderAvatar(message, isOwn)}
                </div>
                <div className='flex flex-col'>
                  <div
                    className={cn(
                      'px-4 py-2 rounded-2xl break-words relative group',
                      'bg-white/10 text-white border border-white/10',
                      'overflow-hidden w-fit max-w-sm whitespace-pre-line'
                    )}
                  >
                    <p className='text-sm leading-relaxed'>{message.content}</p>
                  </div>
                </div>
              </Fragment>
            )}
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
