import { Inbox } from 'lucide-react';

const EmptyState = ({ message }: { message: string }) => (
  <div className='flex-col-center py-16 px-4'>
    <div className='size-10 rounded-full bg-white/[0.03] flex-center mb-3'>
      <Inbox className='size-5 text-white/30' />
    </div>
    <p className='text-white/40 text-sm'>{message}</p>
  </div>
);

export default EmptyState;
