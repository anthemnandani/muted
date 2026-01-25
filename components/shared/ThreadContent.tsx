import ThreadText from '@/components/shared/ThreadText';
import type { ThreadContentProps } from '@/lib/types';
import { isImageOrVideo } from '@/lib/utils';
import { FileType } from '@prisma/client';
import React from 'react';
import ThreadImageCard from '../cards/ThreadImageCard';

const ThreadContent = ({
  text,
  mentions,
  author,
  media,
  variant = 'default',
}: ThreadContentProps) => {
  const threadMedia = media?.[0];
  return (
    <React.Fragment>
      {text && <ThreadText text={text} mentions={mentions} variant={variant} />}
      {threadMedia && (
        <>
          {isImageOrVideo(threadMedia.fileUrl) === FileType.IMAGE && (
            <ThreadImageCard
              image={threadMedia.fileUrl}
              fileType={threadMedia.fileType}
            />
          )}
          {/* {media.fileType === 'video' && (
            <ThreadVideoCard
              video={media.fileUrl! as string}
              poster={media.thumbnailUrl! as string}
              aspectRatio={media.aspectRatio}
              author={author!}
              createdAt={createdAt!}
              postId={id!}
              text={text}
            />
          )} */}
        </>
      )}
    </React.Fragment>
  );
};

export default ThreadContent;
