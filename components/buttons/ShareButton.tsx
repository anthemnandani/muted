import { Icons } from '../icons';

const ShareButton = () => {
  return (
    // <div className='flex flex-col items-center'>
    <button className='btn-action mt-2 mb-1.5'>
      <Icons.share className='size-6' />
    </button>
    /* <strong className='text-[13px] leading-4 text-center text-gray-2'>
        0
      </strong> */
    // </div>
  );
};

export default ShareButton;
