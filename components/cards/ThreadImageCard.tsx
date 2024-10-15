'use client';

import { useImageStore } from '@/store/image';
import Image from 'next/image';
import React from 'react';

interface ThreadImageCardProps {
  image: string | undefined;
}

const ThreadImageCard: React.FC<ThreadImageCardProps> = ({ image }) => {
  const { setImageUrl } = useImageStore();

  // TODO: need to fix this
  // const buffer = await fetch(image).then(async (res) => {
  //     return Buffer.from(await res.arrayBuffer())
  // })

  // const { base64 } = await getPlaiceholder(buffer)

  return (
    <div className='relative overflow-hidden rounded-xl border border-border w-fit mt-2.5 cursor-pointer'>
      <Image
        loading='lazy'
        src={image ?? ''}
        width={630}
        height={630}
        alt='Will add alt-text soon!'
        onClick={() => {
          setImageUrl(image);
        }}
        className='object-contain max-h-[520px] w-max  rounded-xl'
      />
    </div>
  );
};

export default ThreadImageCard;
