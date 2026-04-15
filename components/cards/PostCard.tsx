'use client';

import { PostCardProps, type ViewContentTypeValue } from '@/lib/types';
import { cn } from '@/lib/utils';
import useBreakpoint from '@/hooks/useBreakpoint';
import { useViewTracker } from '@/hooks/useViewTracking';
import useCommentPanelStore from '@/store/commentPanel';
import { useHiddenPosts } from '@/store/hiddenPosts';
import { useMutedUsers } from '@/store/mutedUsers';
import { useUser } from '@clerk/nextjs';
import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import CommentsPanel from '../comments/CommentsPanel';
import PostMediaCarousel from '../posts/PostMediaCarousel';
import PostActions from '../shared/PostActions';
import BottomSheet from '../ui/bottom-sheet';
import Link from 'next/link';
import HiddenPost from './HiddenPost';
import MutedPost from './MutedPost';

const PostCard: React.FC<PostCardProps> = ({
  media,
  id,
  author,
  likes,
  text,
  createdAt,
  repliesCount,
  bookmarks,
  bookmarksCount,
  reposts,
  repostedBy,
  repostsCount,
  privacy,
  mentions,
  hideLikes,
  turnOffComments,
  likesCount,
  pinned,
  seriesId,
  series,
  episodeNumber,
  episodeTitle,
  source = 'VIDEO_FEED',
}) => {
  const { user } = useUser();
  const { isMobile: isMobileView, isSmallMobile } = useBreakpoint();
  const isMobile = isMobileView || isSmallMobile;

  // Determine content type
  const contentType: ViewContentTypeValue = media?.[0]?.fileType === 'VIDEO'
    ? 'VIDEO'
    : media?.[0]?.fileType === 'GIF'
      ? 'GIF'
      : media?.[0]?.fileType === 'IMAGE'
        ? 'IMAGE'
        : 'TEXT';

  const { ref: viewTrackRef } = useViewTracker({
    postId: id,
    contentType,
    source,
    authorId: author.id,
    currentUserId: user?.id || '',
  });

  const {
    isPanelOpen,
    openPanel,
    closePanel,
    currentPostId,
    updateCurrentPost,
    isShowingPost,
  } = useCommentPanelStore();
  const { isPostHidden } = useHiddenPosts();
  const { isMutedUser } = useMutedUsers();

  const isHidden = isPostHidden(id);
  const isMuted = isMutedUser(author.id);

  const { ref: postRef, inView } = useInView({
    threshold: 0.5,
  });

  // Merge refs for both inView detection and view tracking
  const mergedRef = (node: HTMLElement | null) => {
    postRef(node);
    viewTrackRef(node);
  };

  useEffect(() => {
    if (inView && isPanelOpen) {
      updateCurrentPost(id);
    }
  }, [inView, isPanelOpen, id]);

  const toggleComments = () => {
    if (isShowingPost(id)) {
      closePanel();
    } else {
      openPanel(id);
    }
  };

  const isCommentPanelOpen = isPanelOpen && currentPostId === id;

  return (
    <article
      className='relative flex-center gap-4 snap-center snap-always mx-auto my-0 min-h-screen'
      ref={mergedRef}
    >
      {isHidden ? (
        <HiddenPost postId={id} isFullHeight />
      ) : isMuted ? (
        <MutedPost userId={author.id} username={author.username} />
      ) : (
        <div
          className={cn(
            'h-max flex-end grow gap-4 w-full transition-transform duration-300 ease-in-out',
            isMobile && source === 'VIDEO_FEED' ? 'relative' : '',
            isPanelOpen && !isMobile ? 'translate-x-[-180px]' : 'translate-x-0',
          )}
        >
          {seriesId && series && (
            <div className='px-4 pt-2'>
              <Link
                href={`/series/${series.id}`}
                className='text-xs text-primary-blue font-medium hover:underline'
              >
                {series.title}
              </Link>
              {episodeTitle && (
                <p className='text-sm font-semibold text-white/90 mt-0.5'>
                  {series.seriesType === 'SEQUENTIAL'
                    ? `Episode ${episodeNumber} of ${series.episodeCount}: ${episodeTitle}`
                    : `Episode ${episodeNumber}: ${episodeTitle}`}
                </p>
              )}
            </div>
          )}
          <PostMediaCarousel
            media={media}
            author={author}
            createdAt={createdAt}
            mentions={mentions}
            postId={id!}
            text={text}
            pinned={pinned}
            reposts={reposts}
            repostedBy={repostedBy}
            hideLikes={hideLikes}
            turnOffComments={turnOffComments}
          />
          <div
            className={cn(
              isMobile && source === 'VIDEO_FEED'
                ? 'absolute right-3 bottom-20 z-20'
                : '',
            )}
          >
            <PostActions
              id={id}
              likesCount={likesCount ?? 0}
              likes={likes}
              author={author}
              repliesCount={repliesCount ?? 0}
              repostsCount={repostsCount ?? 0}
              reposts={reposts}
              mentions={mentions}
              hideLikes={hideLikes!}
              turnOffComments={turnOffComments!}
              bookmarksCount={bookmarksCount ?? 0}
              bookmarks={bookmarks}
              privacy={privacy}
              onCommentsToggle={toggleComments}
            />
          </div>
        </div>
      )}

      {isMobile ? (
        <BottomSheet open={isCommentPanelOpen} onOpenChange={(open) => !open && closePanel()}>
          <div className='flex-1 min-h-0'>
            <CommentsPanel
              key={`comments-${id}`}
              postId={id}
              onClose={() => closePanel()}
              authorId={author.id}
              isOpen={isPanelOpen}
              repliesCount={repliesCount ?? 0}
              createdAt={createdAt}
              text={text ?? ''}
              author={author}
              reposts={reposts}
              repostedBy={repostedBy}
            />
          </div>
        </BottomSheet>
      ) : (
        isCommentPanelOpen && (
          <aside className='fixed z-50 shadow-lg top-1/2 right-0 w-[480px] h-screen -translate-y-1/2'>
            <CommentsPanel
              key={`comments-${id}`}
              postId={id}
              onClose={() => closePanel()}
              authorId={author.id}
              isOpen={isPanelOpen}
              repliesCount={repliesCount ?? 0}
              createdAt={createdAt}
              text={text ?? ''}
              author={author}
              reposts={reposts}
              repostedBy={repostedBy}
            />
          </aside>
        )
      )}
    </article>
  );
};

export default PostCard;