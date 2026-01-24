import ThreadText from '@/components/shared/ThreadText';
import type { AuthorInfoProps, Mention, PostMedia, Thread } from '@/lib/types';
import { isImageOrVideo } from '@/lib/utils';
import React from 'react';

interface ThreadContentProps {
  id: string;
  text: string;
  media: PostMedia[];
  mentions: Mention[];
  author: AuthorInfoProps;
  variant?: 'default' | 'reply';
}

const ThreadContent = ({
  id,
  text,
  mentions,
  author,
  media,
  variant = 'default',
}: ThreadContentProps) => {
  return (
    <React.Fragment>
      {text && <ThreadText text={text} mentions={mentions} variant={variant} />}
      {/* {media && media[0].fileType && (
        <>
          {isImageOrVideo(media.fileType) === 'image' && (
            <ThreadImageCard
              image={media.fileUrl as string}
              aspectRatio={media.aspectRatio}
              originalDimensions={media.originalDimensions}
            />
          )}
          {media.fileType === 'video' && (
            <ThreadVideoCard
              video={media.fileUrl! as string}
              poster={media.thumbnailUrl! as string}
              aspectRatio={media.aspectRatio}
              author={author!}
              createdAt={createdAt!}
              postId={id!}
              text={text}
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
      )} */}
    </React.Fragment>
  );
};

export default ThreadContent;
