import type { AuthorInfoProps } from '@/lib/types';
import Image from 'next/image';

const DefaultCollectionCover = ({ author }: { author: AuthorInfoProps }) => {
  const { image, fullName, username } = author;
  return (
    <div className='aspect-square relative inline-block size-10 rounded-md bg-zinc-800 cursor-pointer'>
      <div className='flex h-full w-full flex-col overflow-hidden'>
        <div className='m-0.5 flex items-center space-x-1'>
          <div className=' m-0.5 size-4 min-w-max sm:size-6 xl:size-8'>
            <Image
              alt='profile_pic'
              loading='lazy'
              width={40}
              height={40}
              decoding='async'
              data-nimg='1'
              className='size-4 content-center rounded-full object-cover'
              src={image!}
              style={{ color: 'transparent' }}
            />
          </div>
          <div className='flex flex-col'>
            <div className='mr-0.5 text-[8px] font-medium text-zinc-300'>
              {fullName}
            </div>
            <div className='text-[8px] text-zinc-400 '>@{username}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DefaultCollectionCover;
