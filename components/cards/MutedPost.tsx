import useToggleMuteUser from '@/hooks/useToggleMuteUser';

interface MutedPostProps {
  message: string;
  userId: string;
}

const MutedPost = ({ message, userId }: MutedPostProps) => {
  const { handleToggleMuteUser } = useToggleMuteUser({
    userId,
  });

  return (
    <div className='px-2 md:px-4 mb-3 w-full'>
      <div className='bg-neutral-100 dark:bg-[#1e1e1e] rounded-xl p-4 flex-between'>
        <p className='text-neutral-500 dark:text-gray-3 text-[13px]'>
          {message}
        </p>
        <div
          role='button'
          onClick={() => handleToggleMuteUser({ userId })}
          className='text-neutral-500 dark:text-gray-3 text-[13px] font-semibold'
        >
          Undo
        </div>
      </div>
    </div>
  );
};

export default MutedPost;
