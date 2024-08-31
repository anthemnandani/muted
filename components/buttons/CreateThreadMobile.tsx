import React from 'react';
import { Icons } from '../icons';

const CreateThreadMobile = () => {
  return (
    <div className='relative md:hidden w-15 h-12 flex-center rounded-xl hover:bg-primary transition-colors duration-150'>
      <Icons.create className='size-6 text-secondary' />
    </div>
  );
};

export default CreateThreadMobile;
