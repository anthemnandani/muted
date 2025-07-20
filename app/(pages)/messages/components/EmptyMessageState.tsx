import { Icons } from '@/components/icons';

const EmptyMessageState = () => {
  return (
    <div className='absolute inset-0 flex items-center justify-center'>
      <div className='text-center'>
        <div className='size-16 rounded-full flex-center mx-auto mb-4'>
          <Icons.comments />
        </div>
        <p className='text-white/50 text-lg font-medium mb-2'>
          No messages yet
        </p>
        <p className='text-white/30 text-sm'>
          Start the conversation with a friendly hello!
        </p>
      </div>
    </div>
  );
};

export default EmptyMessageState;
