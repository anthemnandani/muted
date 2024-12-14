import useToggleHidePost from '@/hooks/useToggleHidePost';

interface HiddenPostProps {
  message: string;
  postId: string;
}

const HiddenPost = ({ message, postId }: HiddenPostProps) => {
  const { handleToggleHidePost } = useToggleHidePost({
    postId,
  });

  return (
    <div className='px-2 md:px-4 mb-3 w-full'>
      <div className='bg-neutral-100 dark:bg-[#1e1e1e] rounded-xl  p-4 flex-between'>
        <p className='text-neutral-500 dark:text-gray-3 text-[13px]'>
          {message}
        </p>
        <div
          role='button'
          onClick={() => handleToggleHidePost({ postId })}
          className='text-neutral-500 dark:text-gray-3 text-[13px] font-semibold'
        >
          Undo
        </div>
      </div>
    </div>
  );
};

export default HiddenPost;
