import { Share2 } from 'lucide-react';

const ShareButton = () => {
  return (
    <div className='flex flex-col items-center gap-1.5'>
      <button className='btn-action'>
        <Share2 className='size-5' fill='#fff' />
      </button>
      <strong className='text-[13px] text-center'>500</strong>
    </div>
  );
};

export default ShareButton;
