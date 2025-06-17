import { Skeleton } from '@/components/ui/skeleton';

const MessageSkeleton = ({ isOwn = false }: { isOwn?: boolean }) => {
  return (
    <div className={`flex mb-3 ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[70%] ${isOwn ? 'mr-2' : 'ml-2'}`}>
        <Skeleton className='h-4 w-32 mb-1' />
        <Skeleton className='h-4 w-24' />
      </div>
    </div>
  );
};

const ChatSkeleton = () => {
  return (
    <div className='flex-1 overflow-y-auto p-4'>
      <div className='space-y-1'>
        <div className='flex justify-center my-4'>
          <div className='px-3 py-1 rounded-full'>
            <Skeleton className='h-3 w-16' />
          </div>
        </div>

        <MessageSkeleton isOwn={false} />
        <MessageSkeleton isOwn={true} />
        <MessageSkeleton isOwn={false} />
        <MessageSkeleton isOwn={true} />
        <MessageSkeleton isOwn={false} />
        <MessageSkeleton isOwn={true} />
        <MessageSkeleton isOwn={false} />

        <div className='flex justify-center my-4'>
          <div className='px-3 py-1 rounded-full'>
            <Skeleton className='h-3 w-20' />
          </div>
        </div>

        <MessageSkeleton isOwn={true} />
        <MessageSkeleton isOwn={false} />
        <MessageSkeleton isOwn={true} />
        <MessageSkeleton isOwn={false} />
        <MessageSkeleton isOwn={true} />
      </div>
    </div>
  );
};

export default ChatSkeleton;
