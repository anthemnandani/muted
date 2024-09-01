import React from 'react';
import { Icons } from '../icons';

const Loader = () => {
  return (
    <div className='h-[200px] w-full flex-center mb-[10vh] sm:mb-0'>
      <Icons.loading className='size-11' />
    </div>
  );
};

export default Loader;
