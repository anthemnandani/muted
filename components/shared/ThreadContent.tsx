import ThreadText from '@/components/shared/ThreadText';
import { type OriginalDimensions, ThreadContentProps } from '@/lib/types';
import { FileType } from '@prisma/client';
import { Fragment } from 'react';
import ThreadImageCard from '../cards/ThreadImageCard';
import ThreadVideoCard from '../cards/ThreadVideoCard';

const ThreadContent = ({
  id,
  text,
  mentions,
  media,
  variant = 'default',
}: ThreadContentProps) => {
  const threadMedia = media?.[0];
  return (
    <Fragment>
      {text && <ThreadText text={text} mentions={mentions} variant={variant} />}
      {threadMedia && (
        <Fragment>
          {(threadMedia.fileType === FileType.IMAGE ||
            threadMedia.fileType === FileType.GIF) && (
            <ThreadImageCard
              image={threadMedia.fileUrl!}
              fileType={threadMedia.fileType}
            />
          )}
          {threadMedia.fileType === FileType.VIDEO && (
            <ThreadVideoCard
              playbackId={threadMedia.playbackId!}
              encodingStatus={threadMedia.encodingStatus!}
              aspectRatio={threadMedia.aspectRatio!}
              thumbnailToken={threadMedia.thumbnailToken!}
              videoToken={threadMedia.videoToken!}
              originalDimensions={
                threadMedia.originalDimensions as OriginalDimensions
              }
              threadId={id!}
            />
          )}
        </Fragment>
      )}
    </Fragment>
  );
};

export default ThreadContent;
