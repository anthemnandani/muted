'use client';

import ThreadActions from '@/components/cards/ThreadActions';
import { ViewContentType } from '@/generated/prisma/enums';
import { usePostInteraction } from '@/hooks/usePostInteraction';
import { useViewTracker } from '@/hooks/useViewTracker';
import { ThreadCardBaseProps } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useHiddenThreads } from '@/store/hiddenThreads';
import { useMutedUsers } from '@/store/mutedUsers';
import { Fragment } from 'react';
import ThreadContent from '../shared/ThreadContent';
import ThreadHeader from '../shared/ThreadHeader';
import RepostedBy from '../user/RepostedBy';
import HiddenThread from './HiddenThread';
import LinkPreviewCard from './LinkPreviewCard';
import MutedThread from './MutedThread';
import ThreadQuoteCard from './ThreadQuoteCard';

const ThreadCardBase: React.FC<ThreadCardBaseProps> = ({
  id,
  text,
  createdAt,
  author,
  media,
  quoteId,
  repostedBy,
  repostedAt,
  mentions,
  likes,
  likesCount,
  reposts,
  repostsCount,
  bookmarks,
  bookmarksCount,
  repliesCount,
  hideLikes,
  pinned,
  privacy,
  linkPreview,
  showHeader = true,
  showActions = true,
  className,
  children,
  source,
  disableTracking,
}) => {
  const { isThreadHidden } = useHiddenThreads();
  const { isMutedUser } = useMutedUsers();

  const { isLoading: isCheckingPermissions, canInteract } = usePostInteraction({
    authorId: author.id,
    privacy,
    mentions,
  });

  const { ref: viewRef } = useViewTracker({
    threadId: id,
    source,
    contentType: ViewContentType.THREAD,
    skip: disableTracking,
  });

  const content = (
    <Fragment>
      <ThreadContent id={id} text={text} mentions={mentions} media={media} />
      {quoteId && (
        <div className='px-10'>
          <ThreadQuoteCard quoteId={quoteId} />
        </div>
      )}
    </Fragment>
  );

  if (isMutedUser(author.id)) {
    return <MutedThread username={author.username} userId={author.id} />;
  }

  if (isThreadHidden(id)) {
    return (
      <HiddenThread message='This thread has been hidden.' threadId={id} />
    );
  }

  return (
    <div ref={viewRef} className={cn('mb-3', className)}>
      {repostedBy && (
        <RepostedBy repostedBy={repostedBy} repostedAt={repostedAt!} />
      )}

      {showHeader && (
        <ThreadHeader
          author={author}
          createdAt={createdAt}
          id={id}
          currentText={text ?? ''}
          hideLikes={hideLikes!}
          pinned={pinned!}
          mentions={mentions}
          privacy={privacy}
          linkPreview={linkPreview}
        />
      )}

      <div className='w-full'>{content}</div>

      {linkPreview && (
        <div className='mx-2 md:mx-4 my-2'>
          <LinkPreviewCard
            url={linkPreview.url}
            title={linkPreview.title}
            description={linkPreview.description}
            image={linkPreview.image}
          />
        </div>
      )}

      {showActions && (
        <div className='pt-2 flex-between w-full px-2 md:px-4'>
          <ThreadActions
            id={id}
            likesCount={likesCount ?? 0}
            likes={likes}
            text={text}
            author={author}
            createdAt={createdAt}
            repliesCount={repliesCount ?? 0}
            repostsCount={repostsCount ?? 0}
            reposts={reposts}
            media={media}
            linkPreview={linkPreview}
            quoteId={quoteId}
            mentions={mentions}
            hideLikes={hideLikes!}
            bookmarksCount={bookmarksCount ?? 0}
            bookmarks={bookmarks}
            isCheckingPermissions={isCheckingPermissions}
            canInteract={canInteract}
          />
        </div>
      )}

      {children}
    </div>
  );
};

export default ThreadCardBase;
