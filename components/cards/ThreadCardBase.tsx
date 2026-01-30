'use client';

import ThreadActions from '@/components/cards/ThreadActions';
import { ThreadCardBaseProps } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useHiddenPosts } from '@/store/hiddenPosts';
import { useMutedUsers } from '@/store/mutedUsers';
import { useRouter } from 'next/navigation';
import { Fragment } from 'react';
import ThreadHeader from '../shared/ThreadHeader';
import RepostedBy from '../user/RepostedBy';
import LinkPreviewCard from './LinkPreviewCard';
import ThreadContent from '../shared/ThreadContent';
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
  privacy,
  linkPreview,
  //   showMuted = true,
  variant = 'default',
  showHeader = true,
  showActions = true,
  className,
  children,
}) => {
  const { isTemporarilyHidden } = useHiddenPosts();
  const { isMutedUser } = useMutedUsers();
  const router = useRouter();

  const content = (
    <Fragment>
      <ThreadContent
        id={id}
        text={text}
        mentions={mentions}
        media={media}
        variant={variant}
      />
      {quoteId && (
        <div className='px-10'>
          <ThreadQuoteCard quoteId={quoteId} />
        </div>
      )}
    </Fragment>
  );

  //   if (isMutedUser(author.id) && showMuted) {
  //     return (
  //       <MutedPost
  //         message={`Posts from ${author.username} are muted.`}
  //         userId={author.id}
  //       />
  //     );
  //   }

  //   if (isTemporarilyHidden(id)) {
  //     return (
  //       <HiddenPost
  //         message={`This ${
  //           variant === 'reply' ? 'reply' : 'post'
  //         } has been hidden.`}
  //         postId={id}
  //       />
  //     );
  //   }

  return (
    <div className={cn('mb-3', className)}>
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
          variant={variant}
          mentions={mentions}
          privacy={privacy}
          linkPreview={linkPreview}
        />
      )}

      {variant === 'default' ? (
        <div className='w-full cursor-pointer'>{content}</div>
      ) : (
        content
      )}

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
            privacy={privacy}
          />
        </div>
      )}

      {children}
    </div>
  );
};

export default ThreadCardBase;
