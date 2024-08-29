import React from 'react';
import { Icons } from '../icons';

const CreateThreadButton = () => {
  return (
    <div className='max-md:hidden fixed bottom-6 right-6 dark:bg-gray-6 bg-white border border-border-dark dark:border-border-light rounded-2xl shadow-lg cursor-pointer flex-center w-[82px] h-[68px] transform transition-all duration-300 ease-in-out hover:scale-110'>
      <Icons.plus className='w-6 h-6' />
    </div>
  );
};

export default CreateThreadButton;
