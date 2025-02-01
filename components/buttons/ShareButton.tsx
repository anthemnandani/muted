import { Forward, Share2 } from 'lucide-react';
import React from 'react';

const ShareButton = () => {
  return (
    <div className='flex flex-col items-center gap-1.5'>
      <button className='flex-center w-12 h-12 rounded-full bg-[#FFFFFF1F] transition ease-in-out duration-200 hover:bg-gray-5'>
        <Share2 className='size-5' fill='#fff' />
      </button>
      <strong className='text-[13px] text-center'>500</strong>
    </div>
  );
};

export default ShareButton;
