'use client';

import { PostCardProps } from '@/lib/types';
import { cn } from '@/lib/utils';
import useCommentPanelStore from '@/store/commentPanel';
import { useHiddenPosts } from '@/store/hiddenPosts';
import { useMutedUsers } from '@/store/mutedUsers';
import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import CommentsPanel from '../comments/CommentsPanel';
import PostMediaCarousel from '../posts/PostMediaCarousel';
import PostActions from '../shared/PostActions';
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
}) => {
  const {
    isPanelOpen,
    openPanel,
    closePanel,
    currentPostId,
    updateCurrentPost,
    isShowingPost,
  } = useCommentPanelStore();
  const { isTemporarilyHidden } = useHiddenPosts();
  const { isMutedUser } = useMutedUsers();

  const isHidden = isTemporarilyHidden(id);
  const isMuted = isMutedUser(author.id);

  const { ref: postRef, inView } = useInView({
    threshold: 0.5,
  });

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
      ref={postRef}
    >
      {isHidden ? (
        <HiddenPost postId={id} />
      ) : isMuted ? (
        <MutedPost userId={author.id} username={author.username} />
      ) : (
        <div
          className={cn(
            'h-max flex-end grow gap-4 w-full transition-transform duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]',
            isPanelOpen ? 'translate-x-[-180px]' : 'translate-x-0'
          )}
        >
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
      )}

      {isCommentPanelOpen && (
        <aside
          className={cn(
            'fixed top-1/2 right-0 w-[480px] h-screen z-50',
            '-translate-y-1/2',
            'shadow-lg'
          )}
        >
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
      )}
    </article>
  );
};

export default PostCard;
