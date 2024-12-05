import ThreadImageCard from '@/components/cards/ThreadImageCard';
import ThreadVideoCard from '@/components/cards/ThreadVideoCard';
import { isImageOrVideo } from '@/lib/utils';
import Image from 'next/image';
import React from 'react';
import ThreadText from './ThreadText';
import type { ParentPostInfo } from '@/lib/types';

type ThreadContentProps = Partial<ParentPostInfo> & {
  variant?: 'default' | 'reply';
};

const ThreadContent = ({
  id,
  text,
  author,
  mentions,
  media,
  variant = 'default',
}: ThreadContentProps) => {
  return (
    <React.Fragment>
      {text && <ThreadText text={text} mentions={mentions} variant={variant} />}
      {media && media.fileType && (
        <>
          {isImageOrVideo(media.fileType) === 'image' && (
            <ThreadImageCard
              image={media.fileUrl as string}
              aspectRatio={media.aspectRatio}
              originalDimensions={media.originalDimensions}
            />
          )}
          {isImageOrVideo(media.fileType) === 'video' && (
            <ThreadVideoCard
              video={media.fileUrl! as string}
              aspectRatio={media.aspectRatio}
              originalDimensions={media.originalDimensions}
              username={author!.username}
              postId={id!}
            />
          )}
          {media.fileType === 'gif' && (
            <div className='relative px-4 overflow-hidden mt-2.5 mb-2'>
              <Image
                src={media.fileUrl as string}
                alt='GIF'
                width={200}
                height={200}
                loading='lazy'
              />
            </div>
          )}
        </>
      )}
    </React.Fragment>
  );
};

export default ThreadContent;
