import ChatMessageItem from '@/app/(pages)/messages/components/ChatMessageItem';
import { Message } from '@/lib/types';
import {
  formatMessageDateSeparator,
  shouldShowDateSeparator,
} from '@/lib/utils';
import { useUser } from '@clerk/nextjs';

const useChatMessages = ({ messages }: { messages: Message[] }) => {
  const { user } = useUser();

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

  const renderMessage = (message: Message, index: number) => {
    const isOwn = message.senderId === user?.id;
    const previousMessage = index > 0 ? messages?.[index - 1] : null;
    const showDateSeparator = shouldShowDateSeparator(message, previousMessage);

    return (
      <div key={message.id}>
        {showDateSeparator && renderDateSeparator(message.createdAt)}
        <ChatMessageItem
          message={message}
          isOwn={isOwn}
          isLastMessage={messages?.length === index + 1}
        />
      </div>
    );
  };

  return {
    renderMessage,
  };
};

export default useChatMessages;
