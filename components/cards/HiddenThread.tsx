import useToggleHideThread from '@/hooks/useToggleHideThread';

const HiddenThread = ({
  message,
  threadId,
}: {
  message: string;
  threadId: string;
}) => {
  const { toggleHide } = useToggleHideThread({
    threadId,
  });

  return (
    <div className='px-2 md:px-4 mb-3 w-full'>
      <div className='bg-[#1e1e1e] rounded-xl p-4 flex-between'>
        <p className='text-white/50 text-[13px]'>{message}</p>
        <div
          role='button'
          onClick={toggleHide}
          className='text-white/50 text-[13px] font-semibold'
        >
          Undo
        </div>
      </div>
    </div>
  );
};

export default HiddenThread;
