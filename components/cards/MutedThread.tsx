import useToggleMuteUser from '@/hooks/useToggleMuteUser';
import { MutedPostProps } from '@/lib/types';

const MutedThread: React.FC<MutedPostProps> = ({ userId, username }) => {
  const { toggleMute } = useToggleMuteUser({
    userId,
  });

  return (
    <div className='px-2 md:px-4 mb-3 w-full'>
      <div className='bg-[#1e1e1e] rounded-xl p-4 flex-between'>
        <p className='text-white/50 text-[13px]'>
          Threads from {username} are muted
        </p>
        <div
          role='button'
          onClick={toggleMute}
          className='text-white/50 text-[13px] font-semibold'
        >
          Undo
        </div>
      </div>
    </div>
  );
};

export default MutedThread;
