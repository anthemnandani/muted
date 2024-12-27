import React from 'react';
import { Icons } from '../icons';

const PostViewSelector = () => {
  return (
    <div className='flex items-end'>
      <div className='mr-3 text-gray-3 dark:text-zinc-200'>View:</div>
      <Icons.list className='mr-2 h-5 w-5 flex-shrink-0 stroke-2 transition hover:cursor-pointer text-gray-3 dark:text-zinc-200' />
      <Icons.grid className='h-5 w-5 flex-shrink-0 stroke-2 transition hover:cursor-pointer text-zinc-500 dark:text-gray-3' />
    </div>
  );
};

export default PostViewSelector;
